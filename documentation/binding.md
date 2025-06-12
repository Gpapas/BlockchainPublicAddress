# Binding Process

This document explains how the PoC binds a blockchain address to a phone number using a nonce challenge and Vonage verification.

1. **Nonce generation**
   - The phone app calls `POST /nonce` with the blockchain public address.
   - The backend returns a unique nonce which the app must sign with the user's wallet (e.g., via MetaMask).

2. **Phone number verification**
   - The app starts verification by calling `POST /verify/start` with the phone number.
   - Vonage sends an OTP to the number and returns a `requestId`.
   - The user enters the OTP which the app submits to `POST /verify/check` along with the `requestId`.
   - On success the backend records the phone number as verified for that `requestId`.

3. **Bind request**
   - The app sends `POST /blockchain-public-addresses` with:
     - `phoneNumber`
     - `blockchainPublicAddress`
     - `blockchainNetworkId`
     - `nonce` and `signature` from the wallet (optional but recommended)
     - `requestId` from the phone verification
   - The backend verifies the signature matches the nonce, checks the phone verification, and stores the association.
   - A unique binding identifier is returned.

4. **Retrieval and unbinding**
   - Wallet addresses can later be listed with `POST /blockchain-public-addresses/retrieve-blockchains`.
   - `DELETE /blockchain-public-addresses/{id}` removes a binding when requested.

This flow ensures only the phone owner can bind a wallet address and that they control the address by signing a backend-provided nonce.
