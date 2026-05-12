#!/bin/bash

# Start Delivery Optimizer Stack

echo -e "\n\033[0;36m Starting Delivery Optimizer Stack...\033[0m\n"

# Cleanup function
cleanup() {
    echo -e "\n\033[0;33mStopping servers...\033[0m"
    kill $BACKEND_PID $FRONTEND_PID
    exit
}

# Trap Ctrl+C (SIGINT)
trap cleanup SIGINT

# Start Backend
echo -e "\033[0;32m[1/2] Launching Backend (FastAPI)...\033[0m"
cd backend && python main.py &
BACKEND_PID=$!

# Start Frontend
cd ..
echo -e "\033[0;32m[2/2] Launching Frontend (Vite)...\033[0m"
cd frontend && npm run dev &
FRONTEND_PID=$!

echo -e "\n\033[0;33m✅ Both servers are running in background.\033[0m"
echo -e "Frontend: http://localhost:5173"
echo -e "Backend:  http://localhost:8000"
echo -e "Press Ctrl+C to stop both servers.\n"

# Keep the script running to catch the trap
wait
