const express = require('express');
const cors = require('cors'); // Import the CORS package
const db = require('./api/database');

const app = express();
const PORT = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON requests

// GET: Retrieve all envelopes from the database
app.get('/envelopes', (req, res) => {
    try {
        const envelopes = db.prepare('SELECT * FROM envelopes').all();
        res.status(200).json({ envelopes });
    } catch (error) {
        console.error('Error fetching envelopes:', error);
        res.status(500).json({ error: 'Failed to fetch envelopes' });
    }
});

// GET: Retrieve a specific envelope by ID
app.get('/envelopes/:id', (req, res) => {
    const envelopeId = parseInt(req.params.id);

    try {
        const envelope = db.prepare('SELECT * FROM envelopes WHERE id = ?').get(envelopeId);

        if (!envelope) {
            return res.status(404).json({ error: 'Envelope not found' });
        }

        res.status(200).json(envelope);
    } catch (error) {
        console.error('Error retrieving envelope:', error);
        res.status(500).json({ error: 'Failed to fetch envelope' });
    }
});

// POST: Create a new envelope
app.post('/envelopes', (req, res) => {
    const { title, budget } = req.body;

    if (!title || typeof budget !== 'number' || budget < 0) {
        return res.status(400).json({ error: 'Invalid request. Title and budget are required.' });
    }

    try {
        const stmt = db.prepare('INSERT INTO envelopes (title, budget) VALUES (?, ?)');
        const result = stmt.run(title, budget);

        res.status(201).json({
            message: 'Envelope created successfully',
            envelope: { id: result.lastInsertRowid, title, budget }
        });
    } catch (error) {
        console.error('Error inserting envelope:', error);
        res.status(500).json({ error: 'Failed to insert envelope' });
    }
});

// PUT: Update envelope details (title or budget)
app.put('/envelopes/:id', (req, res) => {
    const envelopeId = parseInt(req.params.id);
    const { title, budget } = req.body;

    try {
        const existingEnvelope = db.prepare('SELECT * FROM envelopes WHERE id = ?').get(envelopeId);

        if (!existingEnvelope) {
            return res.status(404).json({ error: 'Envelope not found' });
        }

        const stmt = db.prepare('UPDATE envelopes SET title = ?, budget = ? WHERE id = ?');
        stmt.run(
            title || existingEnvelope.title,
            budget !== undefined ? budget : existingEnvelope.budget,
            envelopeId
        );

        res.status(200).json({
            message: 'Envelope updated successfully',
            envelope: {
                id: envelopeId,
                title: title || existingEnvelope.title,
                budget: budget !== undefined ? budget : existingEnvelope.budget
            }
        });
    } catch (error) {
        console.error('Error updating envelope:', error);
        res.status(500).json({ error: 'Failed to update envelope' });
    }
});

// DELETE: Remove an envelope by ID
app.delete('/envelopes/:id', (req, res) => {
    const envelopeId = parseInt(req.params.id);

    try {
        const stmt = db.prepare('DELETE FROM envelopes WHERE id = ?');
        const result = stmt.run(envelopeId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Envelope not found' });
        }

        res.status(200).json({ message: 'Envelope deleted successfully' });
    } catch (error) {
        console.error('Error deleting envelope:', error);
        res.status(500).json({ error: 'Failed to delete envelope' });
    }
});

// POST: Transfer funds between envelopes
app.post('/envelopes/transfer/:from/:to', (req, res) => {
    const fromId = parseInt(req.params.from);
    const toId = parseInt(req.params.to);
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Invalid transfer amount' });
    }

    try {
        const fromEnvelope = db.prepare('SELECT * FROM envelopes WHERE id = ?').get(fromId);
        const toEnvelope = db.prepare('SELECT * FROM envelopes WHERE id = ?').get(toId);

        if (!fromEnvelope || !toEnvelope) {
            return res.status(404).json({ error: 'One or both envelopes not found' });
        }

        if (fromEnvelope.budget < amount) {
            return res.status(400).json({ error: 'Insufficient funds in source envelope' });
        }

        // Update balances
        db.prepare('UPDATE envelopes SET budget = ? WHERE id = ?').run(fromEnvelope.budget - amount, fromId);
        db.prepare('UPDATE envelopes SET budget = ? WHERE id = ?').run(toEnvelope.budget + amount, toId);

        res.status(200).json({ message: 'Transfer successful' });
    } catch (error) {
        console.error('Error transferring funds:', error);
        res.status(500).json({ error: 'Failed to transfer funds' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});