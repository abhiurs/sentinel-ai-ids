# AI-Driven Intrusion Detection System Using Machine Learning

An intelligent network intrusion detection system that uses machine learning algorithms to detect and classify malicious network traffic.

## 📌 Overview

Traditional intrusion detection systems often depend on signature-based detection, which is effective for known attacks but can be limited when dealing with new or evolving attack patterns.

This project presents an AI-driven Intrusion Detection System (IDS) that applies machine learning techniques to network traffic analysis. The system processes network traffic, extracts relevant features, applies dataset-specific preprocessing, and uses trained machine learning models to classify traffic as normal or malicious.

The project also provides a web-based interface for analysing network traffic, viewing detection results, monitoring threats, and generating reports.

## 🎯 Objectives

- Develop a machine-learning-based network intrusion detection system.
- Detect malicious network activities from network traffic.
- Classify different types of network attacks.
- Support multiple cybersecurity benchmark datasets.
- Compare different machine learning algorithms.
- Provide an interactive web dashboard for security analysis.
- Support CSV-based traffic analysis.
- Provide functionality for live network traffic monitoring.
- Maintain detection history and generate security reports.

## 🚀 Key Features

### 🔐 User Authentication

- User registration and login
- Password hashing
- JWT-based authentication
- Protected routes
- Input validation

### 🤖 Machine Learning Detection

The system supports the following machine learning algorithms:

- Decision Tree
- Random Forest
- Extra Trees
- K-Nearest Neighbors (KNN)
- XGBoost

### 📊 Supported Datasets

The project supports multiple benchmark intrusion detection datasets:

- CICIDS2017
- CSE-CIC-IDS2018
- NSL-KDD
- UNSW-NB15

Each dataset has its own preprocessing pipeline and trained model artifacts.

### 📁 Network Traffic Analysis

Users can upload network traffic data for analysis.

The system performs:

1. Dataset detection
2. Feature preparation
3. Data preprocessing
4. Feature alignment
5. Feature scaling
6. Machine learning prediction
7. Attack classification
8. Detection result generation

### 🛰️ Live Network Monitoring

The backend contains a live traffic processing pipeline with components for:

- Packet capture
- Packet parsing
- Flow construction
- Feature extraction
- Feature mapping
- Packet storage
- Live prediction

### 🚨 Threat Detection

The dashboard provides information related to:

- Detected threats
- Attack classifications
- Threat severity
- Traffic statistics
- Recent detections
- Attack distribution
- Security recommendations
- Threat intelligence

### 📈 Reports and Analytics

The system provides:

- Network traffic charts
- Attack distribution
- Detection statistics
- Model performance information
- Historical analysis
- Report generation
- CSV export
- PDF report generation

---

# 🧠 System Architecture

```text
                    Network Traffic
                           │
                           ▼
                 ┌───────────────────┐
                 │ Dataset Detection │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ Data Preprocessing│
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ Feature Extraction│
                 │   & Preparation   │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ Feature Scaling   │
                 └─────────┬─────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │   Machine Learning       │
              │          Models          │
              ├──────────────────────────┤
              │ Decision Tree            │
              │ Random Forest            │
              │ Extra Trees              │
              │ KNN                      │
              │ XGBoost                  │
              └────────────┬─────────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ Attack Prediction │
                 └─────────┬─────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ Detection & Analysis   │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ Dashboard / Reports /  │
              │ Threat Monitoring      │
              └────────────────────────┘
