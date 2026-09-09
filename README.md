# AccountBud

AccountBud is an integrated double-entry accounting web platform designed for Small and Medium-Sized Enterprises (SMEs) operating under Romanian financial regulations. Implemented in accordance with the OMFP 1802/2014 accounting guidelines, the platform automates journal entries, supports multi-company management, and integrates a Machine Learning microservice for automated account code predictions and transaction anomaly detection.

## Dashboard preview

<a id="fig-dashboard"></a>
<img width="1919" height="915" alt="Dashboard preview" src="https://github.com/user-attachments/assets/dc8fa7b6-4c1d-49b2-91c6-56f64e91075c" />

*Figure 1: Main dashboard.*

---

## Core Features

* **Double-Entry Bookkeeping:** Automatically generates balanced journal entries compliant with OMFP 1802/2014 for issued/received invoices, bank transactions, and month-end closing routines.
* **AI-Assisted Account Prediction:** Uses a Machine Learning model trained on Romanian accounting data to suggest appropriate accounting account codes based on transaction descriptions in real time (see [Figure 2](#fig-ai-prediction)).
* **Active Learning Feedback Loop:** Dynamically updates and retrains the AI model based on user validation and corrections.
* **Anomaly Detection:** Applies an Isolation Forest algorithm to flag irregular accounting entries and potential data input errors (see [Figure 3](#fig-anomaly)).
* **Multi-Company Management:** Provides centralized administrative capabilities across multiple business entities with strict database isolation (see [Figure 4](#fig-company-switcher)).
* **Role-Based Access Control (RBAC):** Secures application access via JSON Web Tokens (JWT) across three distinct privilege levels: `Admin`, `Accountant`, and `Viewer`.
* **Financial Reporting Suite:** Generates key standardized financial documents:
  * **Financial Statements:** Profit & Loss Statement, Balance Sheet
  * **Accounting Registers:** Trial Balance (Balanță de verificare), Account Ledger (Fișă de cont), General Journal (see [Figure 5](#fig-journal))
  * **VAT Registers:** Sales Journal, Purchase Journal
  * **Partner Statements:** Client Statements, Supplier Statements
* **Bank Journal Automation:** Streamlines recording for bank fees, client payments, and supplier settlements.

---

## Tech Stack

### Backend
* **Language/Framework:** Java 17+, Spring Boot
* **Security:** Spring Security, JWT, Google OAuth2
* **Data Access & Migration:** Spring Data JPA, Hibernate, Flyway DB
* **Database Management System:** Microsoft SQL Server

### Frontend
* **Framework:** React, Vite
* **State & Theme Management:** React Hooks, Context API (`ThemeContext`, `CompanyContext`) — see the [dark/light mode showcase](#fig-theme) below.

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

---

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
```

---

## AI Assistance

### Suggested account code with confidence score

<a id="fig-ai-prediction"></a>
<img width="849" height="769" alt="AI account prediction" src="https://github.com/user-attachments/assets/132f8486-fce4-4abb-99c2-a544623eb42d" />

*Figure 2: The AI suggests an account code as the user enters a transaction description.*

### Anomaly detection (example of a flagged entry)

<a id="fig-anomaly"></a>
<img width="1857" height="347" alt="Anomaly detection flag" src="https://github.com/user-attachments/assets/641d639e-61ce-47e1-936b-64c837cd65ee" />

*Figure 3: An irregular entry flagged by the Isolation Forest model.*

---

## AccountBud Features

### Company switcher

<a id="fig-company-switcher"></a>
<img width="522" height="349" alt="Company switcher" src="https://github.com/user-attachments/assets/173987c2-d47a-4d55-8570-3fcd9b00ce15" />

*Figure 4: Switching between managed companies.*

### Generated Journal Register for a specific period

<a id="fig-journal"></a>
<img width="1861" height="786" alt="Generated journal register" src="https://github.com/user-attachments/assets/ee7f4dfe-cd16-4aa9-b305-41b13a9ede35" />

*Figure 5: General Journal report generated for a chosen period.*

### Dark vs. Light mode showcase

<a id="fig-theme"></a>


https://github.com/user-attachments/assets/e9c95a24-2b70-4653-83c7-1543d2cd0c2f


*Figure 6: Theme toggle demo.*
