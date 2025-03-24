const express = require('express');
const cors = require('cors');
const db = require('./api/database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ----------------- Envelopes Endpoints -----------------

// GET: Retrieve all envelopes
app.get('/envelopes', (req, res) => {
    const envelopes = db.prepare('SELECT * FROM envelopes').all();
    res.status(200).json({ envelopes });
});

// GET: Retrieve a specific envelope by ID
app.get('/envelopes/:id', (req, res) => {
    const envelope = db.prepare('SELECT * FROM envelopes WHERE id = ?').get(req.params.id);
    envelope
        ? res.status(200).json(envelope)
        : res.status(404).json({ error: 'Envelope not found' });
});

// POST: Create a new envelope
app.post('/envelopes', (req, res) => {
    const { title, budget } = req.body;

    if (!title || typeof budget !== 'number' || budget < 0) {
        return res.status(400).json({ error: 'Invalid request. Title and budget are required.' });
    }

    const result = db.prepare('INSERT INTO envelopes (title, budget) VALUES (?, ?)').run(title, budget);
    res.status(201).json({ message: 'Envelope created', envelope: { id: result.lastInsertRowid, title, budget } });
});

// PUT: Update envelope (title or budget)
app.put('/envelopes/:id', (req, res) => {
    const { title, budget } = req.body;
    const envelope = db.prepare('SELECT * FROM envelopes WHERE id = ?').get(req.params.id);

    if (!envelope) return res.status(404).json({ error: 'Envelope not found' });

    if (title) db.prepare('UPDATE envelopes SET title = ? WHERE id = ?').run(title, req.params.id);
    if (typeof budget === 'number' && budget >= 0) {
        db.prepare('UPDATE envelopes SET budget = ? WHERE id = ?').run(budget, req.params.id);
    }

    const updatedEnvelope = db.prepare('SELECT * FROM envelopes WHERE id = ?').get(req.params.id);
    res.status(200).json({ message: 'Envelope updated', envelope: updatedEnvelope });
});

// DELETE: Remove an envelope
app.delete('/envelopes/:id', (req, res) => {
    const result = db.prepare('DELETE FROM envelopes WHERE id = ?').run(req.params.id);
    result.changes
        ? res.status(200).json({ message: 'Envelope deleted' })
        : res.status(404).json({ error: 'Envelope not found' });
});

// POST: Transfer funds between envelopes
app.post('/envelopes/transfer/:from/:to', (req, res) => {
    const { from, to } = req.params;
    const { amount } = req.body;

    const fromEnvelope = db.prepare('SELECT * FROM envelopes WHERE id = ?').get(from);
    const toEnvelope = db.prepare('SELECT * FROM envelopes WHERE id = ?').get(to);

    if (!fromEnvelope || !toEnvelope || typeof amount !== 'number' || amount <= 0 || fromEnvelope.budget < amount) {
        return res.status(400).json({ error: 'Invalid transfer request' });
    }

    db.prepare('UPDATE envelopes SET budget = ? WHERE id = ?').run(fromEnvelope.budget - amount, from);
    db.prepare('UPDATE envelopes SET budget = ? WHERE id = ?').run(toEnvelope.budget + amount, to);

    res.status(200).json({ message: 'Transfer successful' });
});

// ----------------- Transactions Endpoints -----------------

// POST: Create a new transaction
app.post('/transactions', (req, res) => {
    const { envelopeId, amount, description } = req.body;
    const date = new Date().toISOString().split('T')[0]; // Today's date in 'YYYY-MM-DD' format

    if (!envelopeId || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Invalid request. Envelope ID and valid amount are required.' });
    }

    try {
        const result = db.prepare(
            'INSERT INTO transactions (envelope_id, amount, date, description) VALUES (?, ?, ?, ?)'
        ).run(envelopeId, amount, date, description);

        res.status(201).json({ message: 'Transaction created', transactionId: result.lastInsertRowid });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Error creating transaction' });
    }
});

// GET: Retrieve all transactions with optional sorting
app.get('/transactions', (req, res) => {
    const { sort } = req.query;

    let query = 'SELECT * FROM transactions';

    if (sort) {
        switch (sort) {
            case 'amount-asc':
                query += ' ORDER BY amount ASC';
                break;
            case 'amount-desc':
                query += ' ORDER BY amount DESC';
                break;
            case 'date-asc':
                query += ' ORDER BY date ASC';
                break;
            case 'date-desc':
                query += ' ORDER BY date DESC';
                break;
            case 'description-asc':
                query += ' ORDER BY description ASC';
                break;
            case 'description-desc':
                query += ' ORDER BY description DESC';
                break;
            default:
                break;
        }
    }

    const transactions = db.prepare(query).all();
    res.status(200).json({ transactions });
});

// GET: Retrieve transactions for a specific envelope
app.get('/transactions/:envelopeId', (req, res) => {
    const transactions = db.prepare('SELECT * FROM transactions WHERE envelope_id = ?').all(req.params.envelopeId);
    transactions.length
        ? res.status(200).json({ transactions })
        : res.status(404).json({ error: 'No transactions found for this envelope' });
});

// DELETE: Remove a transaction by ID
app.delete('/transactions/:id', (req, res) => {
    const result = db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);

    if (result.changes) {
        res.status(200).json({ message: 'Transaction deleted successfully' });
    } else {
        res.status(404).json({ error: 'Transaction not found' });
    }
});

// ----------------- Start Server -----------------
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});