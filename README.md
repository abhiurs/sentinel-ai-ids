Sentinel AI IDS

AI-Driven Network Intrusion Detection System Using Machine Learning

Sentinel AI IDS is a machine-learning-based Network Intrusion Detection System (NIDS) designed to identify and classify potentially malicious network traffic.

The system combines machine learning models, dataset-specific preprocessing, network traffic analysis, historical analysis, threat monitoring, and a web-based dashboard to provide an integrated environment for network intrusion detection.

📌 Project Overview

Traditional intrusion detection systems commonly rely on predefined signatures to identify known attacks. This approach can become less effective when network traffic patterns change or when previously unseen attack variations occur.

Sentinel AI IDS explores a machine-learning-based approach to network intrusion detection. The system supports multiple benchmark cybersecurity datasets and provides several machine learning algorithms for traffic classification.

The project is developed as an academic cybersecurity and machine learning project with a focus on:

Network intrusion detection

Machine learning-based attack classification

Dataset-specific preprocessing

Live network traffic analysis

Threat monitoring

Security analytics

Detection history and reporting

✨ Key Features

🔐 Authentication

User registration

User login

Password hashing

JWT-based authentication

Protected application routes

Input validation

🤖 Machine Learning Detection

The system currently supports:

Decision Tree

Random Forest

Extra Trees

K-Nearest Neighbors (KNN)

XGBoost

The models are trained for supported cybersecurity datasets and stored as reusable model artifacts.

📊 Supported Datasets

Sentinel AI IDS includes support for:

CICIDS2017

CSE-CIC-IDS2018

NSL-KDD

UNSW-NB15

Each dataset has its own preprocessing and model artifacts to account for differences in feature structures.

📁 CSV-Based Analysis

The application provides functionality for analysing uploaded network traffic datasets.

The analysis pipeline can:

Accept network traffic data

Detect the dataset format

Prepare the input features

Apply the appropriate preprocessing

Run the selected machine learning model

Generate predictions

Present detection results through the web interface

🛰️ Live Monitoring

The project includes a live traffic analysis pipeline containing components for:

Packet capture

Packet parsing

Flow construction

Feature extraction

Feature mapping

Packet storage

Live prediction

This functionality is intended for experimental and academic network monitoring.

🚨 Threat Monitoring

The dashboard provides interfaces for:

Threat detection

Threat severity

Attack distribution

Traffic statistics

Recent detections

Security recommendations

Threat details

Threat intelligence

📈 Analytics & Reports

The application provides:

Network traffic charts

Attack distribution charts

Detection statistics

Model performance information

Historical analysis

Report generation

CSV export

PDF report generation

🧠 Machine Learning Architecture

The general detection pipeline is:

                Network Traffic / CSV
                         │
                         ▼
                Dataset Detection
                         │
                         ▼
                 Data Preprocessing
                         │
                         ▼
                Feature Preparation
                         │
                         ▼
              Feature Scaling / Mapping
                         │
                         ▼
              ┌─────────────────────┐
              │ Machine Learning    │
              │      Models         │
              ├─────────────────────┤
              │ Decision Tree       │
              │ Random Forest       │
              │ Extra Trees         │
              │ KNN                 │
              │ XGBoost             │
              └─────────────────────┘
                         │
                         ▼
                 Attack Prediction
                         │
                         ▼
              Detection & Classification
                         │
                         ▼
              Dashboard / Reports

🧪 Machine Learning Models

Decision Tree

A tree-based supervised learning algorithm that makes predictions through a sequence of feature-based decisions.

Random Forest

An ensemble learning algorithm that combines multiple decision trees to improve classification performance and generalization.

Extra Trees

An ensemble tree-based algorithm that introduces additional randomization when constructing decision trees.

K-Nearest Neighbors

A distance-based classification algorithm that determines the class of a sample based on neighbouring training samples.

XGBoost

A gradient-boosting algorithm designed for efficient and powerful classification and regression tasks.

📂 Project Structure

sentinel-ai-ids/
│
├── backend/
│   ├── database/
│   │   └── mongodb.py
│   ├── ml/
│   │   ├── live/
│   │   ├── models/
│   │   │   ├── CICIDS2017/
│   │   │   ├── CSE-CIC-IDS2018/
│   │   │   ├── NSL-KDD/
│   │   │   └── UNSW-NB15/
│   │   ├── prediction/
│   │   ├── preprocessing/
│   │   ├── training/
│   │   ├── predict.py
│   │   └── prepare_dataset.py
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   ├── app.py
│   ├── config.py
│   └── requirements.txt
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── simulation/
│       ├── utils/
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
│
├── .gitattributes
├── .gitignore
└── README.md

🛠️ Technology Stack

Frontend

React

Vite

JavaScript

HTML5

CSS

Charting components

Backend

Python

Flask

REST APIs

PyMongo / MongoDB integration

Machine Learning

Scikit-learn

XGBoost

NumPy

Pandas

Joblib

Network Analysis

Scapy

Network packet and flow processing

Database

MongoDB

Authentication & Security

JWT

Password hashing

Input validation

Protected routes

Environment-based configuration

Development Tools

Visual Studio Code

Git

GitHub

Git LFS

Python virtual environment

Node.js / npm

⚙️ Installation

1. Clone the Repository

git clone https://github.com/abhiurs/sentinel-ai-ids.git
cd sentinel-ai-ids

🐍 Backend Setup

Navigate to the backend directory:

cd backend

Create a Python virtual environment:

python -m venv .venv

Activate it on Windows:

.\.venv\Scripts\Activate.ps1

Install the required Python packages:

pip install -r requirements.txt

🔑 Environment Configuration

Create a .env file inside the backend directory.

Example:

SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret
MONGO_URI=your_mongodb_connection_string
DATABASE_NAME=sentinel_ai

Important

Never commit the .env file to GitHub.

The repository's .gitignore is configured to exclude environment files containing secrets.

🚀 Start the Backend

From the backend directory:

python app.py

The backend will normally be available at:

http://127.0.0.1:5000

⚛️ Frontend Setup

Open another terminal and navigate to the client directory:

cd client

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173

🔄 Application Flow

User
 │
 ▼
React Web Interface
 │
 ├── Login / Registration
 │
 ▼
Protected Dashboard
 │
 ├── Upload Traffic
 │
 ├── Live Monitoring
 │
 ├── Threat Intelligence
 │
 ├── History
 │
 └── Reports
 │
 ▼
Backend REST API
 │
 ├── Authentication
 ├── Dataset Detection
 ├── Preprocessing
 ├── ML Prediction
 ├── Threat Management
 └── Report Generation
 │
 ▼
Machine Learning Layer
 │
 ├── Decision Tree
 ├── Random Forest
 ├── Extra Trees
 ├── KNN
 └── XGBoost
 │
 ▼
Prediction
 │
 ▼
Dashboard / History / Reports

📊 Model Artifacts

Trained machine learning models are maintained separately for the supported datasets.

Each dataset can contain artifacts such as:

model.pkl
scaler.pkl
feature_names.pkl
label_encoder.pkl
metrics.json

The project uses Git LFS for large machine-learning model files.

This avoids storing large binary model files directly as normal Git objects.

🔬 Prediction Pipeline

The prediction module prepares incoming traffic features according to the feature structure expected by the selected dataset/model combination.

The general process is:

Input Features
      │
      ▼
Feature Validation
      │
      ▼
Feature Alignment
      │
      ▼
Numeric Conversion
      │
      ▼
Missing Value Handling
      │
      ▼
Feature Scaling
      │
      ▼
ML Model
      │
      ▼
Encoded Prediction
      │
      ▼
Decoded Attack Label

For models supporting probability estimation, the system can also obtain a prediction confidence value.

🛡️ Security Considerations

The project includes several application-level security mechanisms:

Password hashing

JWT authentication

Protected routes

Environment-based secrets

Input validation

Separation of frontend and backend

.env exclusion through .gitignore

However, this project is primarily an academic and research-oriented implementation and should undergo additional security testing before being used in a production SOC or enterprise environment.

⚠️ Limitations

Machine-learning-based intrusion detection has several practical limitations.

These include:

Performance depends on the quality and distribution of the training data.

Dataset-specific feature structures require appropriate preprocessing.

Models trained on benchmark datasets may not generalize perfectly to real-world traffic.

Live packet analysis depends on correct packet capture and feature extraction.

Detection accuracy can change when network traffic characteristics differ significantly from the training data.

The system should not be considered a replacement for a complete enterprise IDS/SIEM/security monitoring platform.

🔮 Future Enhancements

Possible future improvements include:

Continuous model retraining

Additional real-world datasets

Improved unknown/novel attack detection

Online learning

Advanced anomaly detection

Automated incident response

SIEM integration

Alert notifications

WebSocket-based live updates

Containerized deployment

Cloud deployment

Role-based access control

Improved model explainability

Advanced threat intelligence integration

Production-grade monitoring and logging

🎓 Academic Project

This project was developed as an academic cybersecurity and machine learning project with the objective of studying the application of artificial intelligence and machine learning techniques to network intrusion detection.

Project Domain

Cybersecurity + Machine Learning + Network Intrusion Detection

Project Type

Academic / Engineering Project

👨‍💻 Author

Abhinandan Urs

Computer Science Engineering

East West College of Engineering

📜 Disclaimer

Sentinel AI IDS is intended for educational, research, and authorized security-testing purposes.

The system should only be used on networks, systems, and datasets for which the user has appropriate authorization.

The predictions generated by machine-learning models should be treated as analytical outputs and should not be considered a guaranteed determination of malicious activity.

⭐ Acknowledgements

The project makes use of publicly available cybersecurity benchmark datasets and open-source machine-learning and software-development technologies.

Datasets used by the project include:

CICIDS2017

CSE-CIC-IDS2018

NSL-KDD

UNSW-NB15

📌 Project Status

Development Status: Active Development

The project continues to undergo development, testing, model evaluation, and feature improvements.
