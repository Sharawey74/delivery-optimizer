# Start Delivery Optimizer Stack

Write-Host "`n Starting Delivery Optimizer Stack...`n" -ForegroundColor Cyan

# Check for backend folder
if (Test-Path "backend") {
    Write-Host "[1/2] Launching Backend (FastAPI) in new window..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python main.py"
} else {
    Write-Host "Error: 'backend' directory not found." -ForegroundColor Red
}

# Check for frontend folder
if (Test-Path "frontend") {
    Write-Host "[2/2] Launching Frontend (Vite) in new window..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
} else {
    Write-Host "Error: 'frontend' directory not found." -ForegroundColor Red
}

Write-Host "`n✅ Both servers are initializing." -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Gray
