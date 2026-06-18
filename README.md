# AcademiX

A full-stack Machine Learning project.

## Setup Instructions

### 1. Clone the GitHub repository
```bash
git clone <your-repo-url>
cd AcademiX
```

### 2. Install frontend dependencies
```bash
cd frontend
npm install
cd ..
```

### 3. Install backend dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Setup ML environment
```bash
cd ml_service
pip install uv
uv venv
uv pip install -r requirements.txt
cd ..
```

### 5. Run the complete system
Make sure you install the root dependencies first (for `concurrently`):
```bash
npm install
```
Then run the entire system:
```bash
npm run dev
```

## Architecture
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **ML Service**: Flask API (Python)
