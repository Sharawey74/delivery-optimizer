import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel

from state import SIMULATION_STATE, reset_state
from graph import NODE_POSITIONS, ROAD_GRAPH
from simulator import run_simulator, fire_disruption, BROADCAST_CALLBACK
import simulator

app = FastAPI(title="Delivery Optimizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

active_connections = []

async def broadcast_state(state):
    dead_connections = []
    for connection in active_connections:
        try:
            await connection.send_json(state)
        except Exception:
            dead_connections.append(connection)
    
    for c in dead_connections:
        if c in active_connections:
            active_connections.remove(c)

simulator.BROADCAST_CALLBACK = broadcast_state
simulation_task = None

@app.on_event("startup")
async def startup_event():
    reset_state()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        await websocket.send_json(SIMULATION_STATE)
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in active_connections:
            active_connections.remove(websocket)

@app.get("/api/state")
def get_state():
    return SIMULATION_STATE

@app.get("/api/nodes")
def get_nodes():
    return [{"id": k, "lat": v[0], "lng": v[1]} for k, v in NODE_POSITIONS.items()]

@app.get("/api/edges")
def get_edges():
    edges = []
    for u, v, data in ROAD_GRAPH.edges(data=True):
        edges.append({"u": u, "v": v, "closed": data.get("closed", False)})
    return edges

@app.get("/api/map")
def get_map():
    nodes = [{"id": k, "lat": v[0], "lng": v[1]} for k, v in NODE_POSITIONS.items()]
    edges = []
    for u, v, data in ROAD_GRAPH.edges(data=True):
        edges.append({"u": u, "v": v, "closed": data.get("closed", False)})
    return {"nodes": nodes, "edges": edges}

@app.post("/api/simulation/start")
async def start_simulation():
    global simulation_task
    if not SIMULATION_STATE["running"]:
        reset_state()
        simulation_task = asyncio.create_task(run_simulator())
    return {"status": "started"}

@app.post("/api/simulation/stop")
async def stop_simulation():
    global simulation_task
    SIMULATION_STATE["running"] = False
    if simulation_task:
        simulation_task.cancel()
        simulation_task = None
    reset_state()
    await broadcast_state(SIMULATION_STATE)
    return {"status": "stopped"}

class ModeRequest(BaseModel):
    mode: str

@app.post("/api/mode")
async def set_mode(req: ModeRequest):
    if req.mode in ["simulation", "demo"]:
        SIMULATION_STATE["mode"] = req.mode
        await broadcast_state(SIMULATION_STATE)
        return {"status": "success", "mode": req.mode}
    return {"status": "error", "message": "Invalid mode"}

@app.post("/api/trigger/{disruption_type}")
async def trigger_disruption(disruption_type: str):
    if not SIMULATION_STATE["running"]:
        return {"status": "error", "message": "Simulation not running"}
    
    if disruption_type in ["new_order", "road_closure", "breakdown", "priority_escalation"]:
        # We fire the disruption manually using the active future events dictionary.
        simulator.fire_disruption(SIMULATION_STATE["tick"], simulator.FUTURE_EVENTS, dtype=disruption_type)
        await broadcast_state(SIMULATION_STATE)
        return {"status": "success", "triggered": disruption_type}
    return {"status": "error", "message": "Invalid disruption type"}

@app.post("/api/simulation/step")
async def step_simulation():
    """C1: Advance exactly one tick in demo mode. No-op in simulation mode."""
    if not SIMULATION_STATE["running"]:
        return {"status": "error", "message": "Simulation not running"}
    if SIMULATION_STATE["mode"] != "demo":
        return {"status": "error", "message": "Only available in demo mode"}
    simulator.DEMO_STEP_REQUESTED = True
    return {"status": "stepped", "tick": SIMULATION_STATE["tick"]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
