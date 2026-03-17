# Farmer Payment Assurance System

Blockchain-based escrow platform guaranteeing crop payments to farmers via Algorand smart contracts.

## Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | AlgoKit + ARC4 (Python) |
| Backend | Python — FastAPI + Motor (async MongoDB) |
| Frontend | React + Vite + Tailwind CSS |
| Wallet | Pera Wallet (TestNet) |
| File Storage | IPFS via Pinata |

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js v18+
- Docker Desktop (for AlgoKit sandbox)

### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # fill in MONGO_URI and JWT_SECRET
uvicorn main:app --reload     # → http://localhost:4000
# Auto-generated API docs at: http://localhost:4000/docs
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                   # → http://localhost:5173
```

### 3. Contracts (Day 1+)
```bash
pip install algokit
cd contracts
algokit sandbox start         # requires Docker
algokit project run test
algokit project deploy testnet
# Paste the printed App ID into backend/.env → CONTRACT_APP_ID=<id>
```

## Environment Variables (backend/.env)
| Variable | Description |
|----------|-------------|
| MONGO_URI | MongoDB Atlas connection string |
| JWT_SECRET | Long random string — `python -c "import secrets; print(secrets.token_hex(32))"` |
| CONTRACT_APP_ID | Fill after contract deploy on Day 3 |
| PINATA_API_KEY / PINATA_SECRET | From pinata.cloud — fill on Day 3 |
| FRONTEND_URL | Defaults to http://localhost:5173 |

## Folder Structure
```
farmer-pay/
├── contracts/          AlgoKit ARC4 contract (Dev 1 + Dev 2)
├── backend/            FastAPI app (Dev 3 + Dev 4)
│   ├── main.py         Entry point — uvicorn main:app --reload
│   ├── config.py       Settings loaded from .env
│   ├── database.py     Async MongoDB via Motor
│   ├── routes/         auth.py, users.py, trades.py, verifiers.py
│   ├── services/       algorand.py, ipfs.py, auth.py
│   └── models/         schemas.py (Pydantic models)
└── frontend/           React + Vite (Dev 5 + Dev 6)
```

## API Docs
FastAPI auto-generates interactive docs at `http://localhost:4000/docs` when the backend is running.

## Contract State Machine
| Value | State | Meaning |
|-------|-------|---------|
| 0 | CREATED | Contract deployed, no funds |
| 1 | FUNDED | Buyer deposited ALGO into escrow |
| 2 | DELIVERED | Farmer marked delivery, awaiting verifier |
| 3 | RELEASED | Verifier confirmed — payment sent to farmer |
| 4 | DISPUTED | Dispute raised — validator vote pending |
| 5 | EXPIRED | Deadline passed — buyer may claim refund |
| 6 | CANCELLED | Cancelled before funding |
