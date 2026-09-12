# AccountBud

AccountBud is an integrated double-entry accounting web platform designed for Small and Medium-Sized Enterprises (SMEs) operating under Romanian financial regulations. Implemented in accordance with the OMFP 1802/2014 accounting guidelines, the platform automates journal entries, supports multi-company management, and integrates a Machine Learning microservice for automated account code predictions and transaction anomaly detection. For a high-level view of how the pieces fit together, see the [General Architecture](#fig-general-architecture) diagram.

## Dashboard preview

<a id="fig-dashboard"></a>
<img width="1919" height="915" alt="Dashboard preview" src="https://github.com/user-attachments/assets/dc8fa7b6-4c1d-49b2-91c6-56f64e91075c" />

*Figure 1: Main dashboard.*

---

## Core Features

* **Double-Entry Bookkeeping:** Automatically generates balanced journal entries compliant with OMFP 1802/2014 for issued/received invoices, bank transactions, and month-end closing routines.
* **AI-Assisted Account Prediction:** Uses a Machine Learning model trained on Romanian accounting data to suggest appropriate accounting account codes based on transaction descriptions in real time (see [Figure 2](#fig-ai-prediction)).
* **Active Learning Feedback Loop:** Dynamically updates and retrains the AI model based on user validation and corrections (implementation shown in [Listing 3.2](#listing-3-2)).
* **Anomaly Detection:** Applies an Isolation Forest algorithm to flag irregular accounting entries and potential data input errors (see [Figure 3](#fig-anomaly)).
* **Multi-Company Management:** Provides centralized administrative capabilities across multiple business entities with strict database isolation (see [Figure 4](#fig-company-switcher)).
* **Role-Based Access Control (RBAC):** Secures application access via JSON Web Tokens (JWT) across three distinct privilege levels: `Admin`, `Accountant`, and `Viewer` (see the [authentication flow](#fig-auth-flow)).
* **Financial Reporting Suite:** Generates key standardized financial documents:
  * **Financial Statements:** Profit & Loss Statement, Balance Sheet
  * **Accounting Registers:** Trial Balance (Balanță de verificare), Account Ledger (Fișă de cont), General Journal (see [Figure 5](#fig-journal))
  * **VAT Registers:** Sales Journal, Purchase Journal
  * **Partner Statements:** Client Statements, Supplier Statements
* **Bank Journal Automation:** Streamlines recording for bank fees, client payments, and supplier settlements.

---

## Tech Stack

The overall system follows a layered design across frontend, backend, database, and ML service — see [Figure 7](#fig-general-architecture) for the general architecture and [Figure 8](#fig-app-layers) for how the application layers are organized.

### Backend
* **Language/Framework:** Java 17+, Spring Boot
* **Security:** Spring Security, JWT, Google OAuth2 (see the [authentication flow](#fig-auth-flow) in Figure 9)
* **Data Access & Migration:** Spring Data JPA, Hibernate, Flyway DB
* **Database Management System:** Microsoft SQL Server (see the [database schema](#fig-db-schema) in Figure 11)

### Frontend
* **Framework:** React, Vite
* **State & Theme Management:** React Hooks, Context API (`ThemeContext`, `CompanyContext`) — see the [dark/light mode showcase](#fig-theme) below.

### Machine Learning Microservice
* **Environment:** Python 3.9+, Flask
* **Machine Learning Algorithms:**
  * `RandomForestClassifier` (200 estimators) for account classification
  * `IsolationForest` for anomaly detection
* **NLP / Feature Processing:** TF-IDF Vectorizer and Keyword Analysis
* **Architecture:** see [Figure 10](#fig-ml-architecture) for the microservice architecture and [Listing 3.2](#listing-3-2) for the feedback/retraining endpoint.

---

## Account classification - rate of success evaluation

The classifier was evaluated using repeated stratified 5-fold
cross-validation (100 train/test cycles) across 143 transactions
spanning 30 account codes drawn from the Romanian Chart of Accounts
(OMFP 1802/2014).

On the 17 account codes with sufficient samples for stratified CV, the
model achieved a mean accuracy of 89.73% (± 5.89 percentage points) and
a macro F1-score of 0.88, indicating balanced performance rather than
skew toward frequent classes.

High-frequency, well-separated categories were classified
near-perfectly:

-   Utilities (6051): 100%
-   Local taxes (635): 100%
-   Depreciation (6811): 98.3%
-   Fuel expenses (6022): 98.7%

  Main source of error: Semantic overlap between adjacent
  bank/client/supplier movements (5121, 4111) and general third-party
  services (628), which acts as a catch-all category the model sometimes
  over-predicts.

For the 13 account codes with fewer than 5 training samples,
leave-one-out evaluation showed markedly lower reliability (48.3%). This
is expected given the limited data and highlights an area for future
data collection rather than a modeling flaw.

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

This structure maps directly onto the [application layers](#fig-app-layers) shown in Figure 8.

---

## Installation and Deployment

### Prerequisites
* Java JDK 17 or higher
* Node.js 18 or higher and npm
* Python 3.9 or higher
* Microsoft SQL Server instance running on port `1433`

### 1. Database Configuration
Create a database instance named `AccountBud` in MS SQL Server. Schema migrations will be executed automatically by Flyway upon backend initialization. See [Figure 11](#fig-db-schema) for the full database schema.

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

---

## System Architecture

This section details the overall system design: how the frontend, backend, database, and ML service communicate, how the application is layered, how authentication flows through the system, the ML microservice's internal architecture, and the underlying database schema.

### General Architecture

An overview diagram showing the frontend, backend, SQL database, and ML component, and how they communicate with one another.

<a id="fig-general-architecture"></a>
<img width="867" height="370" alt="General architecture diagram" src="https://github.com/user-attachments/assets/6dee3d0a-c967-4089-847d-e8a375046228" />

*Figure 7: General architecture — frontend, backend, database, and ML service interaction.*

### Application Layers

<a id="fig-app-layers"></a>
<img width="939" height="251" alt="Application layers" src="https://github.com/user-attachments/assets/7820b41e-63b3-434b-85ec-75ad848de246" />

*Figure 8: Application layers.*

### Authentication Flow

<a id="fig-auth-flow"></a>
<img width="789" height="965" alt="Authentication flow" src="https://github.com/user-attachments/assets/66c7178b-7c01-4821-b74f-39e3ee6ed68b" />

*Figure 9: Authentication flow.*


### ML Microservice Architecture for Account Code Prediction

<a id="fig-ml-architecture"></a>
<img width="941" height="272" alt="ML microservice architecture" src="https://github.com/user-attachments/assets/c971a93b-87d4-4ff3-9fbe-f1b48f79a083" />

*Figure 10: ML microservice architecture for account code prediction.*

<a id="listing-3-2"></a>
**Listing :** Feedback endpoint and automatic retraining of the ML model

```python
@app.route("/feedback", methods=["POST"])
def feedback():
    global classifier

    body            = request.get_json(force=True)
    description     = body.get("description", "")
    amount          = float(body.get("amount", 0))
    correct_account = body.get("correct_account", "")
    row = pd.DataFrame([{
        "description":     description,
        "amount":          amount,
        "correct_account": correct_account,
    }])
    header = not os.path.exists(FEEDBACK_CSV)
    row.to_csv(FEEDBACK_CSV, mode="a", header=header, index=False)
    X_before, y_before = build_training_set()
    acc_before = round(accuracy_score(y_before,
                       classifier.predict(X_before)), 4)
    classifier = train_classifier()

    X_after, y_after = build_training_set()
    acc_after = round(accuracy_score(y_after,
                      classifier.predict(X_after)), 4)

    return jsonify({
        "retrained":        True,
        "accuracy_before":  acc_before,
        "accuracy_after":   acc_after,
        "training_samples": len(y_after),
    })
```


### Database Schema ( Simplified )

<a id="fig-db-schema"></a>
<img width="939" height="1017" alt="Database schema" src="https://github.com/user-attachments/assets/be6de0ea-7bb5-4a80-b522-ffdb0895c249" />

*Figure 11: Database schema.*
