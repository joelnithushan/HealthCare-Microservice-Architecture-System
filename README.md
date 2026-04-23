# Smart Healthcare Appointment and Telemedicine Platform

This project is a cloud-native healthcare ecosystem built using a microservices architecture. It enables patients to book appointments, consult with doctors via video, and manage their medical history, while providing doctors and administrators with robust management tools.

## Architecture Overview

The system is composed of several independent microservices, orchestrated via an API Gateway and a centralized PostgreSQL database (using schema-per-service isolation).

- **User Service**: Manages patient and doctor profiles, authentication (JWT), and role-based access control.
- **Doctor Service**: Handles doctor schedules, specializations, and digital prescriptions.
- **Appointment Service**: Orchestrates the booking lifecycle, including status tracking and reminders.
- **Telemedicine Service**: Provides secure video consultation rooms integrated with Jitsi Meet.
- **Payment Service**: Handles secure financial transactions using Stripe.
- **Notification Service**: Manages multi-channel communication via Email (SMTP) and SMS (Notify.lk).
- **AI Symptom Checker**: An optional service integrated with Google Gemini AI to provide preliminary health suggestions.
- **API Gateway**: The entry point for the frontend, handling routing and security.

## Core Features

- **Patient Portal**: Browse verified doctors, book appointments, attend video sessions, and upload medical reports.
- **Doctor Dashboard**: Manage availability, accept/reject requests, conduct consultations, and issue digital prescriptions.
- **Admin Panel**: Verify doctor registrations, manage users, and oversee platform transactions.
- **AI Integration**: AI-powered symptom analysis to suggest relevant medical specialties.
- **Real-time Notifications**: Automated SMS and Email reminders for upcoming consultations and status updates.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Java 17+ (for local development)
- Node.js (for frontend development)

### Deployment with Docker

The easiest way to run the entire platform is using Docker Compose.

1. Clone the repository.
2. Create a `.env` file in the root directory based on `.env.example`.
3. Run the following command:
   ```bash
   docker-compose up -d --build
   ```
4. Access the application:
   - Frontend: `http://localhost:3000`
   - API Gateway: `http://localhost:8080`

## Tech Stack

- **Backend**: Spring Boot, Spring Cloud Gateway, PostgreSQL
- **Frontend**: React.js, Vanilla CSS
- **Infrastructure**: Docker, Kubernetes (ready)
- **Third-party Integrations**: Stripe (Payments), Notify.lk (SMS), Jitsi Meet (Video), Gemini AI (Symptom Analysis)

## Development

Each service is located in its own directory and contains its own `Dockerfile` and `pom.xml`. To run a specific service locally, ensure the database and gateway are active and configure the service to point to `localhost`.
