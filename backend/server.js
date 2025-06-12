const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuid } = require('uuid');
const { ethers } = require('ethers');
const { Vonage } = require('@vonage/server-sdk');

const vonage = process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET ?
  new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET
  }) : null;

const app = express();
app.use(bodyParser.json());
app.use(cors());

const bindings = [];
const nonces = {};
const verifications = {};

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

// Start phone number verification via Vonage
app.post('/verify/start', async (req, res) => {
  if (!vonage) {
    return res.json({ requestId: 'test', message: 'vonage disabled' });
  }
  try {
    const resp = await vonage.verify.start({ number: req.body.phoneNumber, brand: 'BPA' });
    verifications[resp.request_id] = { phoneNumber: req.body.phoneNumber };
    res.json({ requestId: resp.request_id });
  } catch (e) {
    res.status(500).json({ error: 'verify start failed' });
  }
});

// Check code for phone verification
app.post('/verify/check', async (req, res) => {
  const { requestId, code } = req.body;
  if (!requestId || !code) {
    return res.status(400).json({ error: 'requestId and code required' });
  }
  if (!vonage) {
    verifications[requestId] = { verified: true };
    return res.json({ status: 'ok' });
  }
  try {
    const resp = await vonage.verify.check(requestId, code);
    if (resp.status === '0') {
      verifications[requestId].verified = true;
      res.json({ status: 'ok' });
    } else {
      res.status(400).json({ error: 'code invalid' });
    }
  } catch (e) {
    res.status(500).json({ error: 'verify check failed' });
  }
});

// Bind a blockchain address to a phone number
app.post('/blockchain-public-addresses', (req, res) => {
  const { phoneNumber, blockchainPublicAddress, blockchainNetworkId, nonce, signature, requestId } = req.body;
  if (!phoneNumber || !blockchainPublicAddress || !blockchainNetworkId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (nonce && signature) {
    const expected = nonces[blockchainPublicAddress];
    try {
      const addr = ethers.verifyMessage(expected, signature);
      if (addr.toLowerCase() !== blockchainPublicAddress.toLowerCase()) {
        return res.status(400).json({ error: 'Invalid signature' });
      }
    } catch (e) {
      return res.status(400).json({ error: 'Signature verification failed' });
    }
  }

  if (requestId) {
    const v = verifications[requestId];
    if (!v || !v.verified || v.phoneNumber !== phoneNumber) {
      return res.status(400).json({ error: 'Phone not verified' });
    }
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
