# Frontend Page Overview

This document outlines the structure of the DCPI React frontend and explains what each page contains.

### 1. Global Layout (`/components/Navbar.jsx`)
* **Role:** The main navigation shell of the application.
* **Contains:** The logo ("DCPI") and navigation links mapping to the main pages (Dashboard, Compliance, Schedule, and RFI). 
* **Design:** Uses a common background layout (`bg-slate-100`) where the navbar sits at the top and injects page content dynamically in the main view below.

### 2. Dashboard (`/` -> `Dashboard.jsx`)
* **Role:** An overview of the project's health and intelligence.
* **Contains:**
  * High-level statistics and summary metric cards.
  * Recent activity feeds or critical alerts.
  * Charts or visual summaries reflecting the project's overall state.

### 3. Compliance & Quality (`/compliance` -> `Compliance.jsx`)
* **Role:** Central hub for managing Non-Conformance Reports (NCRs) and quality checks.
* **Contains:**
  * A file upload section to upload site images or compliance documents.
  * A comprehensive list/table of existing Non-Conformance Reports (NCRs) indicating their severity, status, date, and title.
  * A link/button attached to each NCR row to navigate to its detailed view.

### 4. NCR Detail (`/ncr/:ncrId` -> `NCRDetail.jsx`)
* **Role:** A dedicated view for inspecting a single Non-Conformance Report in depth.
* **Contains:**
  * Full details of the quality issue (description, severity level, specific equipment/location).
  * Uploaded photos, forms, or documents associated with the issue.
  * AI-generated suggestions or recommended remediation steps sourced from the backend.

### 5. Schedule & Planning (`/schedule` -> `Schedule.jsx`)
* **Role:** Intelligence interface for project timeline and schedule tracking.
* **Contains:**
  * Options to upload or connect schedule documents (like PDFs or MS Project files).
  * A view of tasks, highlighting upcoming milestones, bottlenecks, or procurement delays.
  * An AI analysis section predicting schedule impacts and offering mitigation strategies for at-risk tasks.

### 6. RFI Assistant / Chat (`/rfi` -> `RFIChat.jsx`)
* **Role:** An AI chatbot for submitting and answering Requests For Information (RFI).
* **Contains:**
  * A chat-like interface (similar to ChatGPT or Claude).
  * A message history view showing prior questions and the AI's provided answers.
  * A text input box at the bottom to send new questions and optionally attach contextual files.

## To Do Next:

### 1. Layout Page
* **Contains:** Header, Project Explanation, and Footer.

### 2. Overview Page
* **Contains:** Details about the whole project explanation, visualized using a graphical and arrow flow.
