<div align="center">

# 🚚 Delivery Optimizer
**Real-Time Algorithmic Logistics Simulation Platform**

[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](#)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](#)

</div>

---

## 📖 Project Overview

**Delivery Optimizer** is a full-stack, real-time logistics simulation designed to visualize how complex routing algorithms behave under dynamic, unpredictable conditions. 

It simulates a fleet of couriers operating in a metropolitan grid, continuously assigning new orders, recalculating optimal routes, and reacting to real-time disruptions such as **Road Closures**, **Vehicle Breakdowns**, and **VIP Priority Escalations**. The entire state is broadcasted over WebSockets to a React dashboard that renders the action live.

---

## ✨ Core Features

- **🔴 Live Algorithm Visualization:** Watch traditional computer science algorithms (Dijkstra, Greedy Insertion, TSP/DP, Bin Packing) interact in a single continuous system.
- **⚡ Real-Time WebSocket Architecture:** The backend pushes 100% of the simulation state to the frontend every tick. No polling, no page reloads.
- **🌪️ Dynamic Disruptions Engine:** 
  - 🚧 **Road Closures:** Roads block dynamically, forcing couriers to instantly reroute.
  - 💥 **Breakdowns:** Couriers fail, forcing emergency cargo redistribution.
  - ⭐ **Priority Escalations:** VIP packages jump to the front of the queue.
- **🎮 Dual Operation Modes:**
  - **Simulation Mode:** Fully autonomous. The system runs at 1 tick per second, firing random disruptions and balancing loads.
  - **Demo Mode:** Fully manual. Step through the simulation exactly one tick at a time and trigger disruptions manually via the dashboard controls.

---

## 🛠️ Technology Stack

### Backend Engine
- **[Python 3](https://www.python.org/)** — Core simulation logic.
- **[FastAPI](https://fastapi.tiangolo.com/)** — High-performance REST and WebSocket server.
- **[Uvicorn](https://www.uvicorn.org/)** — ASGI web server for asynchronous execution.
- **[NetworkX](https://networkx.org/)** — Graph theory library managing the city grid and edge distances.
- **Asyncio** — Non-blocking event loop for the simulation engine.

### Frontend Dashboard
- **[React](https://react.dev/) 18** — Component-based UI.
- **[TypeScript](https://www.typescriptlang.org/)** — Strict typing for complex WebSocket payloads.
- **[Vite](https://vitejs.dev/)** — Lightning-fast build tool and dev server.
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first styling for the dark-mode aesthetic.
- **[Lucide React](https://lucide.dev/)** — Clean, consistent iconography.

---

## 🧠 The Algorithms Under the Hood

1. **Dijkstra's Algorithm (Incremental Routing)**
   Every tick, every courier asks: *"What is the shortest path to my next stop?"* Dijkstra evaluates the road graph, actively avoiding any roads currently marked in the `CLOSED_EDGES` list.
2. **Greedy Insertion (Order Assignment)**
   When a new order arrives, the system attempts to insert `[pickup → delivery]` at every possible position across all active couriers. It greedily selects the courier and insertion index that adds the least extra distance.
3. **Bitmask Dynamic Programming (TSP Re-Optimization)**
   During "quiet periods" (no disruptions for 6 ticks), the system takes each courier's route and solves the Travelling Salesman Problem to find the mathematically optimal visiting order, bypassing the limitations of the Greedy approach.
4. **Bin Packing (Load Balancing)**
   If a courier exceeds its 50kg capacity limit (usually after inheriting cargo from a broken-down peer), the system offloads the lightest packages one by one and reassigns them to the fleet.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Quick Start (Recommended)
You can launch both the backend and frontend simultaneously using the provided scripts:

**Windows (PowerShell):**
```powershell
./run_dev.ps1
```

**macOS / Linux:**
```bash
chmod +x run_dev.sh
./run_dev.sh
```

### Manual Setup

**1. Start the Backend**
```bash
# Navigate to the root directory
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
cd backend
python main.py
```
*The backend will run on `http://localhost:8000`*

**2. Start the Frontend**
```bash
# Open a new terminal
cd frontend
npm install
npm run dev
```
*The frontend will be available at `http://localhost:5173`*

---

## 📡 API Reference

While the system is primarily driven by WebSockets (`ws://localhost:8000/ws`), the backend exposes several REST endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/api/state` | `GET` | Returns the complete current simulation state. |
| `/api/map` | `GET` | Returns all nodes and edge configurations for the grid. |
| `/api/simulation/start` | `POST` | Resets state and starts the simulation loop. |
| `/api/simulation/stop` | `POST` | Halts the simulation and resets the state. |
| `/api/mode` | `POST` | Toggles between `simulation` and `demo` mode. |
| `/api/trigger/{type}` | `POST` | Manually triggers `new_order`, `road_closure`, `breakdown`, or `priority_escalation`. |
| `/api/simulation/step` | `POST` | Advances the engine by exactly one tick (Demo Mode only). |

*(Interactive Swagger docs available at `http://localhost:8000/docs` when the backend is running)*

---

<div align="center">
  <sub>Built with ❤️ by the Delivery Optimizer Team.</sub>
</div>
