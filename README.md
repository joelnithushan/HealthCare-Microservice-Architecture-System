# 🏥 MediConnect: Enterprise-Grade Microservices Healthcare Platform

MediConnect is a cutting-edge, cloud-native healthcare ecosystem designed to bridge the gap between patients and specialized medical care. Built with a robust **Microservices Architecture**, the platform provides a seamless end-to-end experience for appointments, secure telemedicine consultations, and clinical data management.

---

## 🏗️ Architecture & Services

The platform utilizes a **distributed microservices architecture**, ensuring high availability, independent scalability, and fault tolerance.

### **The Service Map**
- 🛡️ **API Gateway**: Single entry point handling secure routing and cross-origin policies.
- 👤 **User Service**: Manages complex identity lifecycle, JWT authentication, and role-based permissions.
- 👨‍⚕️ **Doctor Service**: Handles professional verification, specialized scheduling, and profile management.
- 📅 **Appointment Service**: Orchestrates the booking lifecycle with automated status transitions.
- 💳 **Payment Service**: Secure financial engine integrated with **PayHere**, featuring server-side hash verification.
- 📹 **Telemedicine Service**: Encrypted video consultation rooms powered by **Jitsi Meet**.
- 🔔 **Notification Service**: Real-time patient engagement via **SMTP (Email)** and **Notify.lk (SMS)**.
- 🧠 **AI Symptom Checker**: Intelligent preliminary analysis powered by **Google Gemini AI**.

---

## ✨ Key Features

### **For Patients**
- **Smart Discovery**: Find verified doctors based on specialty, rating, and availability.
- **Secure Checkout**: Seamless card payments with PayHere sandbox integration.
- **Clinical History**: Upload and manage medical reports with secure doctor-patient previews.
- **Premium UI**: A glassmorphism-inspired interface with custom branded dialogs and smooth transitions.

### **For Doctors**
- **Request Management**: Streamlined dashboard to approve or reschedule appointment requests.
- **Virtual Clinic**: One-click video consultations directly from the dashboard.
- **Professional Verification**: Automated registration workflow with administrative oversight.

### **For Administrators**
- **Operational Oversight**: Monitor platform-wide transactions and user growth.
- **Doctor Verification**: Secure audit trail for professional credential approval.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Spring Boot 3, Spring Security, Spring Data JPA |
| **Frontend** | React 18, Vanilla CSS3 (Custom Design System) |
| **Database** | PostgreSQL (Per-service Schema Isolation) |
| **Security** | JWT, PayHere MD5 Hashing, CORS Gateway Filters |
| **Infrastructure** | Docker, Docker Compose, Nginx |

---

## 🚀 Getting Started

### **Prerequisites**
- **Docker & Docker Compose** (Recommended)
- **Java 17 & Node.js 18+** (For local development)

### **One-Command Deployment**
1. **Clone the project**:
   ```bash
   git clone https://github.com/joelnithushan/Healthcare-Microservices-Platform.git
   cd Healthcare-Microservices-Platform
   ```
2. **Environment Setup**:
   - Create a `.env` file in the root directory.
   - Populate it with your `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET`, and `GEMINI_API_KEY`.
3. **Launch the Ecosystem**:
   ```bash
   docker compose up -d --build
   ```
4. **Access the Portals**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Gateway/API**: [http://localhost:8080](http://localhost:8080)

---

## 🔒 Security & Performance
- **Signature Integrity**: All payments are protected by a server-side MD5 hash signature.
- **JWT Protection**: Stateless authentication ensures secure communication between services.
- **Optimized UI**: High-performance React components with lazy loading and optimized asset delivery.

---
*Developed with ❤️ as a modern healthcare solution.*
