# Buy Brisk Boutique

Modern e-commerce frontend (Vite + React + TypeScript + Tailwind) with a Node/Express API.

## Repository

- GitHub: https://github.com/ELMACHHOUNE/buy-brisk-boutique

## Tech Stack

- Vite, React, TypeScript
- Tailwind CSS
- Node.js, Express (server)
- MongoDB (via Mongoose)
- JWT auth

## Project Structure

- /src — frontend application
- /server — Express API (package.json, nodemon, etc.)
- /public — static assets
- /scripts — maintenance scripts

## Prerequisites

- Node.js 18+ and npm
- MongoDB connection string (for the server)

## Setup

Clone and install:

```sh
git clone https://github.com/ELMACHHOUNE/buy-brisk-boutique.git
cd buy-brisk-boutique

# Frontend deps
npm i

# API deps
cd server && npm i
```

## Environment Variables

Create the following files:

- Frontend: .env (at project root)

  - VITE_API_URL=http://localhost:5000

- Server: server/.env
  - PORT=5000
  - MONGO_URI=<your_mongo_connection_string>
  - JWT_SECRET=<your_secret>
  - CORS_ORIGIN=http://localhost:8080

## Scripts

Frontend (run in project root):

```sh
# Dev server (Vite)
npm run dev

# Production build
npm run build

# Preview built app
npm run preview
```

Server (run in ./server):

```sh
# Start in dev (nodemon)
npm run dev

# Start in prod
npm start
```

## Development

- Start API first (server/.env configured), then run the frontend.
- Update VITE_API_URL if the API runs on a different host/port.

## Contributing

1. Fork the repo on GitHub (ELMACHHOUNE/buy-brisk-boutique).
2. Create a feature branch.
3. Commit with clear messages.
4. Open a Pull Request.

## License

Add your license of choice (e.g., MIT) or specify “All rights reserved”.

by ELMACHHOUNE 