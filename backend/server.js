const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuid } = require('uuid');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const bindings = [];
const nonces = {};

// Generate nonce for a blockchain address
app.post('/nonce', (req, res) => {
  const { blockchainPublicAddress } = req.body;
  if (!blockchainPublicAddress) {
    return res.status(400).json({ error: 'blockchainPublicAddress required' });
  }
  const nonce = uuid();
  nonces[blockchainPublicAddress] = nonce;
  res.json({ nonce });
});

// Bind a blockchain address to a phone number
app.post('/blockchain-public-addresses', (req, res) => {
  const { phoneNumber, blockchainPublicAddress, blockchainNetworkId } = req.body;
  if (!phoneNumber || !blockchainPublicAddress || !blockchainNetworkId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const id = uuid();
  bindings.push({ id, phoneNumber, blockchainPublicAddress, blockchainNetworkId });
  res.status(201).json({ id });
});

// Retrieve addresses by phone number
app.post('/blockchain-public-addresses/retrieve-blockchains', (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'phoneNumber required' });
  }
  const results = bindings.filter(b => b.phoneNumber === phoneNumber);
  res.json(results.map(({ id, blockchainPublicAddress, blockchainNetworkId }) => ({
    id, blockchainPublicAddress, blockchainNetworkId
  })));
});

// Unbind address by identifier
app.delete('/blockchain-public-addresses/:id', (req, res) => {
  const { id } = req.params;
  const idx = bindings.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Binding not found' });
  }
  bindings.splice(idx, 1);
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
