# Delivery Optimizer - Run Stack

This directory contains scripts to launch both the **FastAPI Backend** and the **React Frontend** simultaneously.

## Prerequisites

1. **Python 3.10+**: Ensure `python` is in your PATH.
2. **Node.js 18+**: Ensure `npm` is in your PATH.
3. **Backend Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
4. **Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

---

## Launching the Application

### 🪟 Windows (PowerShell)
Run the PowerShell script:
```powershell
./run_dev.ps1
```
*This will open two new terminal windows—one for the backend and one for the frontend.*

### 🐧 Linux / macOS (Shell)
Make the script executable and run it:
```bash
chmod +x run_dev.sh
./run_dev.sh
```
*This will run both processes in the background of your current terminal. Press `Ctrl+C` to stop both.*

---

## Service URLs
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
