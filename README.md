# AccountBud

AccountBud is an integrated double-entry accounting web platform designed specifically for Small and Medium-Sized Enterprises (SMEs) operating under Romanian financial regulations. Implemented in accordance with the OMFP 1802/2014 accounting guidelines[cite: 1], the platform automates journal entries, supports multi-company management[cite: 1], and integrates a Machine Learning microservice for automated account code predictions and transaction anomaly detection.

---

## Core Features

* **Double-Entry Bookkeeping:** Automatically generates balanced journal entries compliant with OMFP 1802/2014 for issued/received invoices, bank transactions, and month-end closing routines[cite: 1].
* **AI-Assisted Account Prediction:** Uses a Machine Learning model trained on Romanian accounting data to suggest appropriate accounting account codes based on transaction descriptions in real time.
* **Active Learning Feedback Loop:** Dynamically updates and retrains the AI model based on user validation and corrections[cite: 1].
* **Anomaly Detection:** Applies an Isolation Forest algorithm to flag irregular accounting entries and potential data input errors.
* **Multi-Company Management:** Provides centralized administrative capabilities across multiple business entities with strict database isolation[cite: 1].
* **Role-Based Access Control (RBAC):** Secures application access via JSON Web Tokens (JWT) across three distinct privilege levels: `Admin`, `Accountant`, and `Viewer`.
* **Financial Reporting Suite:** Generates key standardized financial documents:
  * **Financial Statements:** Profit & Loss Statement, Balance Sheet[cite: 1].
  * **Accounting Registers:** Trial Balance (Balanță de verificare), Account Ledger (Fișă de cont), General Journal[cite: 1].
  * **VAT Registers:** Sales Journal, Purchase Journal[cite: 1].
  * **Partner Statements:** Client Statements, Supplier Statements[cite: 1].
* **Bank Journal Automation:** Streamlines recording for bank fees, client payments, and supplier settlements.

---

### Backend
* **Language/Framework:** Java 17+, Spring Boot
* **Security:** Spring Security, JWT, Google OAuth2
* **Data Access & Migration:** Spring Data JPA, Hibernate, Flyway DB
* **Database Management System:** Microsoft SQL Server

### Frontend
* **Framework:** React, Vite
* **State & Theme Management:** React Hooks, Context API (`ThemeContext`, `CompanyContext`)

### Machine Learning Microservice
* **Environment:** Python 3.9+, Flask
* **Machine Learning Algorithms:**
  * `RandomForestClassifier` (200 estimators) for account classification
  * `IsolationForest` for anomaly detection
* **NLP / Feature Processing:** TF-IDF Vectorizer and Keyword Analysis

---

## Repository Structure
```
├── src/                          # Spring Boot Backend Codebase
│   └── main/java/com/Accountancy/app/
│       ├── ai/                   # AI integration components
│       ├── config/               # Application & Security configurations
│       ├── controllers/          # REST API endpoints
│       ├── dto/                  # Data Transfer Objects
│       ├── entities/             # Database ORM entities
│       ├── repositories/         # JPA data access layers
│       ├── security/             # Authentication & Authorization logic
│       └── services/             # Core business and accounting logic
│
├── frontend/                     # React User Interface
│   ├── src/                      # UI components, pages, and context providers
│   ├── package.json
│   └── vite.config.js
│
└── ml_service/                   # Python Flask ML Microservice
├── app.py                    # REST service entry point
├── feedback_data.csv         # Active learning feedback store
├── model.pkl                 # Classification model instance
├── anomaly.pkl               # Anomaly detection model instance
└── scaler.pkl                # Feature scaling model instance
```
## Installation and Deployment

### Prerequisites
* Java JDK 17 or higher
* Node.js 18 or higher and npm
* Python 3.9 or higher
* Microsoft SQL Server instance running on port `1433`

### 1. Database Configuration
Create a database instance named `AccountBud` in MS SQL Server. Schema migrations will be executed automatically by Flyway upon backend initialization.

### 2. Machine Learning Microservice Setup
```bash
cd ml_service

# Create and activate virtual environment
python -m venv ml_venv
source ml_venv/bin/activate  # On Windows: ml_venv\Scripts\activate

# Install required dependencies
pip install flask scikit-learn pandas

# Launch the microservice
python app.py
