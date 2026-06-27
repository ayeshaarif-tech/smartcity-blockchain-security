# Sustainable and Secure Smart City using Blockchain

**Final Year Project — BS Cybersecurity, Air University (2025)**
**Project Lead:** Ayesha Arif

> Awarded **Best Project** at Air University Open House 2025

---

## My Role & Contributions

I led this project end-to-end as project lead, responsible for:

- **System Architecture** : Designed the full pipeline from IoT sensor 
  node through encryption, decentralized storage, blockchain logging, 
  and frontend dashboard
- **Encryption Implementation** : Designed and implemented the custom 
  XOR+AES hybrid encryption/decryption service in Python
- **Frontend Development** : Built the complete React/Vite dashboard 
  including protected routes, real-time data visualization, alerts, 
  and asset viewer
- **Backend Integration** : Developed FastAPI backend connecting the 
  Raspberry Pi sensor pipeline to IPFS storage, blockchain, and DL
  inference endpoints
- **Security Testing & Validation** : Conducted live MITM attack 
  simulation using Ettercap (ARP poisoning) on Kali Linux against the 
  Raspberry Pi-to-backend pipeline. Wireshark packet capture confirmed 
  encrypted payload was not intercepted despite active attack — 
  validating the encryption implementation under real attack conditions
- **Project Management** : Coordinated team tasks, managed integration 
  milestones, and led final testing and demonstration

---

## Security Relevance

This project demonstrates applied cybersecurity concepts across 
multiple domains:

- **Encryption at rest** : Custom XOR+AES hybrid cipher designed and 
  implemented from scratch, applied before any data reaches storage
- **MITM Attack Validation** : Live ARP poisoning attack executed 
  using Ettercap on Kali Linux. Wireshark confirmed no plaintext 
  exposure during active interception
- **Decentralized storage** : IPFS eliminates central storage as an 
  attack surface; no single point of failure
- **Immutable audit trail** : Private Ethereum blockchain provides 
  tamper-proof transaction logging
- **Access control** : Protected frontend routes with unauthenticated 
  redirect
---

## Project Overview

A full-stack Smart City security platform that:

1. Collects IoT sensor data from a **Raspberry Pi**
2. Encrypts it using a **custom XOR+AES cipher** before storage
3. Stores encrypted data on **IPFS** (decentralized, content-addressed)
4. Logs every transaction on a **private Ethereum blockchain** for 
   tamper-proof audit trail
5. Runs **DL-based air quality prediction** on incoming sensor data
6. Serves everything through a **FastAPI backend** and 
   **React/Vite frontend dashboard**

---

## Problem Statement

Smart City infrastructures generate continuous streams of sensitive 
sensor data. Centralized storage creates critical vulnerabilities: 
single points of failure, data tampering, and unauthorized access. 
This system addresses these risks by combining decentralized 
blockchain ledgering, IPFS file storage, custom AES encryption, 
and deep learning air quality prediction into one unified platform.

---

## System Architecture

```
Raspberry Pi (IoT Sensor Node)
        │
        │  Wi-Fi (same network)
        ▼
FastAPI Backend (Python 3.10)
        │
   ┌────┴────────────────────────┐
   │                             │
   ▼                             ▼
AES + XOR Encryption          DL Models (trained)
   │                             │
   ▼                             ▼
IPFS Storage            Air Quality Prediction
(decentralized)          (predict_airquality route)
   │
   ▼
Private Ethereum Blockchain
  ├── BNode  (bootnode :30301)
  ├── Node1  (miner, port :30303, RPC :8547)
  └── Node2  (port :30304, RPC :8548)
        │
        ▼
React / Vite Frontend (localhost:5173)
  ├── Protected Routes
  ├── Real-time Dashboard
  ├── Alert System
  └── Asset Viewer
```
---
## Key Features

| Feature | Implementation |
|---|---|
| IoT Data Collection | Raspberry Pi running Python sensor script |
| Encryption at Rest | Custom XOR+AES cipher before any storage |
| MITM Validation | Live Ettercap ARP poisoning + Wireshark verification |
| Decentralized Storage | IPFS — content-addressed, no central server |
| Immutable Audit Trail | Private Ethereum blockchain (Geth, network ID 14333) |
| Air Quality Detection | Trained DL models via FastAPI `/predict_latest` |
| Data Retrieval | FastAPI `/fetch_data` with decryption layer |
| Access Control | Protected routes — unauthenticated redirect |

---

## Tech Stack

| Layer | Technology |
|---|---|
| IoT Node | Raspberry Pi + Python |
| Security Testing | Kali Linux, Ettercap, Wireshark |
| Backend | FastAPI (Python 3.10), Uvicorn |
| Blockchain | Private Ethereum (Go-Ethereum / Geth) |
| Decentralized Storage | IPFS |
| Encryption | Custom XOR+AES encryption/decryption service |
| DL Models | Trained models in `/backend/DL/` |
| Frontend | React.js + Vite |

---

## Project Structure

```
SmartCity/
│
├── Private Blockchain For Data Storage/
│   ├── BNode/           # Ethereum bootnode
│   ├── Node1/           # Mining node
│   ├── Node2/           # Peer node
│   └── IPFS/            # IPFS node configuration
│
├── backend/
│   ├── main.py          # FastAPI entry point
│   ├── routes/
│   │   ├── fetch_data.py      # Retrieve + decrypt stored data
│   │   └── predict_latest.py  # DL air quality prediction endpoint
│   ├── services/
│   │   └── decryption.py      # AES decryption logic
│   ├── DL/              # Trained DL models + training scripts
│   └── encrypted_data/  # Encrypted files + IPFS hash log
│
└── smart-city/          # React/Vite frontend
    └── src/
        ├── App.jsx       # Route definitions + ProtectedRoute
        ├── assets/       # Static files
        └── components/   # All page components (.jsx + .css)
```

---

## Setup & Running

### Prerequisites

- Raspberry Pi and host PC on the same Wi-Fi network
- [Go-Ethereum (Geth)](https://geth.ethereum.org/downloads)
- Python 3.10
- Node.js v18+
- IPFS daemon running

### Step 1 — Raspberry Pi

```bash
python3 sensor_script.py
```
Update the IP address in the script to your PC's local IP before running.

### Step 2 — Blockchain (run terminals in order)

**Terminal 1 — Bootnode**
```bash
cd "Private Blockchain For Data Storage/BNode"
bootnode -nodekey "./boot.key" -verbosity 7 -addr "127.0.0.1:30301"
```

**Terminal 2 — Node1 (Miner)**
```bash
cd "Private Blockchain For Data Storage/Node1"
geth --networkid 14333 --datadir "./data" \
  --bootnodes "enode://<BOOTNODE_KEY>@127.0.0.1:30301" \
  --port 30303 --http --http.port 8547 \
  --http.api "eth,web3,net,personal,miner" \
  --unlock <NODE1_ADDRESS> --password Password.txt \
  --mine --miner.etherbase <MINER_ADDRESS> console
```

**Terminal 3 — Node2**
```bash
cd "Private Blockchain For Data Storage/Node2"
geth --networkid 14333 --datadir "./data" \
  --bootnodes "enode://<BOOTNODE_KEY>@127.0.0.1:30301" \
  --port 30304 --http --http.port 8548 \
  --ipcdisable --authrpc.port 8552 \
  --unlock <NODE2_ADDRESS> --password Password.txt console
```

### Step 3 — Backend

```bash
cd backend
py -3.10 -m uvicorn main:app --reload
```
API runs at `http://127.0.0.1:8000` — docs at `/docs`

### Step 4 — Frontend

```bash
cd smart-city
npm install
npm run dev
```
Frontend at `http://localhost:5173`

---

## API Endpoints

| Method |       Route       |             Description                    |
|--------|-------------------|--------------------------------------------|
| GET    | `/fetch_data`     | Retrieve and decrypt sensor data from IPFS |
| GET    | `/predict_latest` | Run DL air quality prediction on latest reading |

---

## Screenshots & Demo

Live UI walkthrough: https://youtu.be/dWo2CXZZZnA

---

## Important Notes

- `Password.txt` and wallet keys excluded from repo
- `node_modules/` excluded — run `npm install` first
- Python dependencies: `requirements.txt` in `/backend/`
- All wallet addresses are placeholders — generate your own
---

## Author

**Ayesha Arif** — Project Lead   
BS Cybersecurity, Air University   
LinkedIn: https://www.linkedin.com/in/aa-ayeshaarif   
Email: aa.ayeshaarif@gmail.com   

---

## License

Academic and portfolio use only. Not for production deployment.
