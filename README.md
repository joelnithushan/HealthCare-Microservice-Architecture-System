# Clinexa — Healthcare Microservices Platform

> **SE3020 Distributed Systems** | University Project  
> A production-grade, cloud-native healthcare platform built on a distributed microservices architecture, deployed on **AWS EC2**.

---

## Overview

**Clinexa** bridges the gap between patients and healthcare providers through a fully distributed system. Patients discover and book verified doctors, consult via live video, pay securely, and manage their clinical history — all within a single platform. Doctors manage appointments and issue digital prescriptions. Administrators oversee the entire ecosystem in real time.

---

## Architecture

Eight independently deployable Spring Boot microservices communicate through a single API Gateway. Each service owns its own PostgreSQL database (per-service schema isolation), ensuring loose coupling and independent scalability.

```
                        ┌─────────────────────────────┐
                        │        React Frontend        │
                        │      (Nginx + Docker)        │
                        └──────────────┬──────────────┘
                                       │ HTTP / WebSocket
                        ┌──────────────▼──────────────┐
                        │          API Gateway         │
                        │   JWT Auth · CORS · Routing  │
                        └──┬───┬───┬───┬───┬───┬───┬──┘
                           │   │   │   │   │   │   │
              ┌────────────┘   │   │   │   │   │   └────────────┐
              ▼               ▼   ▼   ▼   ▼   ▼                ▼
        User Service    Doctor  Appt  Pay  Notif  Tele     Symptom
        Port 8081      Service  Svc   Svc   Svc   Svc      Checker
                       8082    8083  8085  8084  8086       8087
              │          │      │     │     │     │            │
              ▼          ▼      ▼     ▼     ▼     ▼            ▼
           user_db   doctor_db appt  pay  notif  tele      symptom
                              _db   _db   _db    _db      _checker_db
```

---

## Services

| Service | Port | Responsibility |
|---|---|---|
| **API Gateway** | 8080 | Single entry point — JWT validation, CORS, WebSocket routing |
| **User Service** | 8081 | Identity management, JWT auth, Google SSO, role-based access |
| **Doctor Service** | 8082 | Doctor profiles, specialization, scheduling, digital prescriptions |
| **Appointment Service** | 8083 | Full booking lifecycle, real-time WebSocket notifications, reminders |
| **Notification Service** | 8084 | Email (SMTP/Gmail) + SMS (Notify.lk) delivery |
| **Payment Service** | 8085 | PayHere checkout with server-side HMAC hash verification |
| **Telemedicine Service** | 8086 | Encrypted video sessions via Jitsi Meet |
| **Symptom Checker** | 8087 | AI-powered diagnostic suggestions via Google Gemini |

---

## Features

### Patient Portal
- Browse and search verified doctors by specialty, hospital, and consultation type
- Book in-person or online appointments with real-time slot availability
- Secure PayHere checkout — server-side hash prevents payment forgery
- Manage and track appointment history (Upcoming / Pending / Confirmed / Completed)
- View digital prescriptions issued by doctors — printable PDF format
- AI Diagnostic Assistant — describe symptoms, get specialist recommendations
- Upload and manage medical reports (PDF/image, max 10 MB)
- Live video consultations via Jitsi Meet
- Real-time appointment status notifications (WebSocket + toast alerts)
- Past consultation history with prescription links

### Doctor Portal
- Dashboard overview with appointment request queue
- Accept, reject, or reschedule appointment requests
- View full patient records and consultation history
- Issue and manage digital prescriptions
- One-click video consultation launch
- Schedule management and availability configuration
- Profile with verification status and professional credentials

### Admin Portal
- Platform-wide dashboard (user counts, doctor counts, revenue)
- User and doctor management with role assignment
- Doctor verification workflow — approve or reject credentials
- Full transaction and payment audit log
- Appointment oversight across all doctors and patients
- System logs for operational monitoring

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Spring Boot 3.2.4, Spring Security 6, Spring Data JPA, Hibernate |
| **Frontend** | React 19.2.4, React Router 6, SockJS + STOMP (WebSocket) |
| **Database** | PostgreSQL 16 — one database per service |
| **Authentication** | JWT (HS256), Google Sign-In (OAuth2) |
| **Payments** | PayHere (LKR) — server-side SHA-256 hash verification |
| **Real-time** | Spring WebSocket, STOMP protocol |
| **Video** | Jitsi Meet embedded SDK |
| **AI** | Google Gemini API (symptom analysis) |
| **Notifications** | JavaMailSender (SMTP/Gmail) + Notify.lk (SMS) |
| **Containerization** | Docker, Docker Compose |
| **Orchestration** | Kubernetes (manifests included) |
| **Reverse Proxy** | Nginx (frontend container) |
| **Cloud** | AWS EC2 |

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Java 17+ and Node.js 18+ (for local development without Docker)

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# JWT — must be >= 32 characters
JWT_SECRET=your_32_char_minimum_secret_key

# Google Sign-In (optional — leave empty to disable SSO)
GOOGLE_CLIENT_ID=

# PayHere
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_merchant_secret

# Email (Gmail SMTP)
EMAIL_USERNAME=your@gmail.com
EMAIL_PASSWORD=your_app_password

# Notify.lk SMS (optional)
NOTIFYLK_USER_ID=
NOTIFYLK_API_KEY=

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Seed account passwords (change before production)
SEED_ADMIN_PASSWORD=Admin@123
SEED_DOCTOR_PASSWORD=Doctor@123
SEED_PATIENT_PASSWORD=Patient@123
```

### Docker Compose (Recommended)

```bash
# Clone
git clone https://github.com/joelnithushan/Healthcare-Microservices-Platform.git
cd Healthcare-Microservices-Platform

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start all services
docker compose up -d --build

# Check logs
docker compose logs -f
```

| Portal | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:8080 |

### Default Seed Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@gmail.com | Admin@123 |
| Doctor | anura@mediconnect.com | Doctor@123 |
| Patient | patient@gmail.com | Patient@123 |

> Override passwords via `SEED_ADMIN_PASSWORD`, `SEED_DOCTOR_PASSWORD`, `SEED_PATIENT_PASSWORD` environment variables.

---

## Kubernetes Deployment

Kubernetes manifests are in the `k8s/` directory.

```bash
# Create namespace and secrets
kubectl apply -f k8s/secrets.yaml      # Fill REPLACE_WITH_* values first
kubectl apply -f k8s/configmap.yaml

# Storage
kubectl apply -f k8s/postgres-pvc.yaml

# Database
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml

# Microservices
kubectl apply -f k8s/

# Verify
kubectl get pods
kubectl get services
```

---

## AWS EC2 Deployment

The platform is deployed on **AWS EC2** (Ubuntu, t2.medium or larger).

```bash
# Install Docker on EC2
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker ubuntu

# Clone and deploy
git clone https://github.com/joelnithushan/Healthcare-Microservices-Platform.git
cd Healthcare-Microservices-Platform
cp .env.example .env   # populate credentials
docker compose up -d --build
```

Configure your EC2 Security Group to open inbound ports:
- `3000` — Frontend
- `8080` — API Gateway
- `80` / `443` — If behind a load balancer or Nginx reverse proxy

---

## Project Structure

```
Healthcare-Microservices-Platform/
├── api-gateway/               # Spring Cloud Gateway
├── user-service/              # Auth, profiles, Google SSO
├── doctor-service/            # Doctor management, prescriptions
├── appointment-service/       # Booking, WebSocket, reminders
├── payment-service/           # PayHere checkout + webhook
├── notification-service/      # Email + SMS dispatch
├── telemedicine-service/      # Jitsi video sessions
├── symptom-checker-service/   # Gemini AI integration
├── healthcare-frontend/       # React 19 SPA
├── k8s/                       # Kubernetes manifests
├── docker-compose.yml
└── .env.example
```

---

## Security

- All inter-service routes are JWT-validated at the API Gateway
- PayHere webhook endpoint verifies HMAC signature before processing any payment status change
- Passwords hashed with BCrypt (server-side only)
- CORS locked to configured frontend origin in production
- Secrets injected via environment variables — no credentials committed to source
- File uploads validated by type and size (5 MB per file, 10 MB per request)

---

## Academic Context

Developed for **SE3020 — Distributed Systems** as a full-stack, production-quality demonstration of:
- Microservices design patterns (API Gateway, per-service databases, service discovery)
- Asynchronous communication (WebSocket / STOMP)
- Containerisation and cloud deployment (Docker, Kubernetes, AWS EC2)
- Distributed security (stateless JWT, OAuth2, HMAC payment verification)

---

*Built with dedication as a modern, distributed healthcare solution.*
