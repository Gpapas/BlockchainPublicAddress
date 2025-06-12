# AGENT Instructions

This repository contains a simple PoC backend (`backend/`) and a React Native example (`phone-app/`). When modifying any file under these directories the following steps must be run:

1. Install dependencies and update lock files:
   ```bash
   cd backend && npm install --package-lock-only
   cd ../phone-app && npm install --package-lock-only
   cd ..
   ```
2. Check the backend for syntax errors:
   ```bash
   node --check backend/server.js
   ```

There are no automated tests yet; these commands ensure dependencies are in sync and the backend starts correctly.
