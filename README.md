# DCPI - Data Centre Project Intelligence

DCPI is an AI-powered EPC (Engineering, Procurement, and Construction) project intelligence application, specifically tailored for data centre construction projects. It aims to streamline operations, assess schedule risks, manage non-conformance reports (NCR), and assist with requests for information (RFI) via an AI-powered chat interface.

## Tech Stack
* **Frontend**: React, Vite, Tailwind CSS, React Router.
* **Backend**: FastAPI (Python), SQLite (via sqlite3/custom wrappers), Uvicorn.
* **AI/Intelligence integration**: Anthropic Claude API for generating schedule mitigation plans and answering project RFIs, ChromaDB for vector storage.

## Features
* **Dashboard**: Provides a high-level overview and real-time statistics regarding project health.
* **Compliance Management**: Manage Quality and Compliance through an interface that tracks Non-Conformance Reports (NCR). Features file uploads for site image/documentation checking and severity mapping.
* **Schedule Risk Analysis**: An AI agent running in the backend evaluates tasks based on float days, predecessor risks, and procurement delays (tied to equipment NCRs) to calculate risk scores and delay probabilities. The agent leverages Claude to generate 3 actionable mitigation strategies for high-risk tasks.
* **RFI Chat Assistant**: An AI-powered chatbot that allows project stakeholders to quickly get answers to project-specific Requests For Information, utilizing uploaded documentation and project context.

## Running the Project

### Prerequisites
* Node.js and npm (for the frontend)
* Python 3.10+ (for the backend)

### Starting the Backend
1. Open a terminal and navigate to the `backend` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate the environment: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. Install dependencies: `pip install -r requirements.txt`
5. Start the server: `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
6. The API will be available at `http://localhost:8000`.

### Starting the Frontend
1. Open a terminal and navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Start the Vite dev server: `npm run dev`
4. The web application will be available at `http://localhost:5173`.
