const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json()); // Middleware to parse JSON requests

// Global variables for storing envelopes and total budget
let totalBudget = 5000; // Example total budget
let envelopes = [
    { id: 1, title: "Groceries", budget: 500 },
    { id: 2, title: "Rent", budget: 1200 },
    { id: 3, title: "Entertainment", budget: 200 }
];

// Generate a new ID for envelopes
const generateId = () => envelopes.length ? Math.max(...envelopes.map(env => env.id)) + 1 : 1;

// GET: Retrieve all envelopes
app.get('/envelopes', (req, res) => {
    res.status(200).json({ envelopes });
});

// GET: Retrieve a specific envelope by ID
app.get('/envelopes/:id', (req, res) => {
    const envelopeId = parseInt(req.params.id);
    const envelope = envelopes.find(env => env.id === envelopeId);

    if (!envelope) {
        return res.status(404).json({ error: 'Envelope not found' });
    }

    res.status(200).json(envelope);
});

// POST: Create a new envelope
app.post('/envelopes', (req, res) => {
    const { title, budget } = req.body;

    if (!title || typeof budget !== 'number' || budget < 0) {
        return res.status(400).json({ error: 'Invalid request. Title and budget are required.' });
    }

    const newEnvelope = { id: generateId(), title, budget };
    envelopes.push(newEnvelope);
    totalBudget += budget;

    res.status(201).json({ message: 'Envelope created successfully', envelope: newEnvelope });
});

// PUT: Update envelope details (title or budget)
app.put('/envelopes/:id', (req, res) => {
    const envelopeId = parseInt(req.params.id);
    const { title, budget } = req.body;

    const envelope = envelopes.find(env => env.id === envelopeId);
    if (!envelope) {
        return res.status(404).json({ error: 'Envelope not found' });
    }

    if (title) envelope.title = title;
    if (budget !== undefined) {
        if (typeof budget !== 'number' || budget < 0) {
            return res.status(400).json({ error: 'Invalid budget value' });
        }
        totalBudget = totalBudget - envelope.budget + budget;
        envelope.budget = budget;
    }

    res.status(200).json({ message: 'Envelope updated successfully', envelope });
});

// POST: Withdraw funds from an envelope
app.post('/envelopes/:id/withdraw', (req, res) => {
    const envelopeId = parseInt(req.params.id);
    const { amount } = req.body;

    const envelope = envelopes.find(env => env.id === envelopeId);
    if (!envelope) {
        return res.status(404).json({ error: 'Envelope not found' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Invalid withdrawal amount' });
    }

    if (envelope.budget < amount) {
        return res.status(400).json({ error: 'Insufficient funds in envelope' });
    }

    envelope.budget -= amount;
    totalBudget -= amount;

    res.status(200).json({ message: 'Amount withdrawn successfully', envelope });
});

// DELETE: Remove an envelope by ID
app.delete('/envelopes/:id', (req, res) => {
    const envelopeId = parseInt(req.params.id);
    const envelope = envelopes.find(env => env.id === envelopeId);

    if (!envelope) {
        return res.status(404).json({ error: 'Envelope not found' });
    }

    // Deduct from total budget and remove envelope
    totalBudget -= envelope.budget;
    envelopes = envelopes.filter(env => env.id !== envelopeId);

    res.status(200).json({ message: 'Envelope deleted successfully', remainingEnvelopes: envelopes });
});

// POST: Transfer funds between envelopes
app.post('/envelopes/transfer/:from/:to', (req, res) => {
    const fromId = parseInt(req.params.from);
    const toId = parseInt(req.params.to);
    const { amount } = req.body;

    const fromEnvelope = envelopes.find(env => env.id === fromId);
    const toEnvelope = envelopes.find(env => env.id === toId);

    if (!fromEnvelope || !toEnvelope) {
        return res.status(404).json({ error: 'One or both envelopes not found' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Invalid transfer amount' });
    }

    if (fromEnvelope.budget < amount) {
        return res.status(400).json({ error: 'Insufficient funds in source envelope' });
    }

    // Transfer funds
    fromEnvelope.budget -= amount;
    toEnvelope.budget += amount;

    res.status(200).json({
        message: 'Transfer successful',
        fromEnvelope,
        toEnvelope
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
