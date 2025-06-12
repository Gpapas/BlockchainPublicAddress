# Backend Service

This simple Express server implements the PoC API for managing blockchain public addresses associated with phone numbers.

## Endpoints
- `POST /nonce` – generate a challenge nonce for a blockchain address.
- `POST /blockchain-public-addresses` – bind a blockchain address to a phone number.
- `POST /blockchain-public-addresses/retrieve-blockchains` – retrieve addresses linked to a phone number.
- `DELETE /blockchain-public-addresses/:id` – remove a previously bound address.

## Running Locally
```
npm install
node server.js
```

## Docker
```
docker buildx build --platform linux/arm64 -t bpa-backend .
```
This will create an arm64-compatible image.
