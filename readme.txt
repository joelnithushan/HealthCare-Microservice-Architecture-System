# Clinexa Healthcare Microservices Platform

## Deployment Instructions

### 1. Prerequisites
- Docker & Docker Compose
- Kubernetes (Minikube or similar)
- Java 17+ (for local development)
- Node.js/NPM (for frontend)

### 2. Run with Docker Compose (Recommended for local dev)
1. Navigate to the project root.
2. Build and start all services:
   ```bash
   docker-compose up --build -d
   ```
3. Access the Frontend at: `http://localhost:3000`
4. Access the API Gateway at: `http://localhost:8080/api/v1`

### 3. Run with Kubernetes
1. Ensure your Kubernetes cluster is running (e.g., `minikube start`).
2. Build local images if using Minikube:
   ```bash
   minikube image build -t user-service:latest ./user-service
   # Repeat for other services...
   ```
3. Apply all manifests:
   ```bash
   kubectl apply -f k8s/
   ```
4. Access the services:
   ```bash
   minikube service healthcare-frontend
   minikube service api-gateway
   ```

### 4. Port Mappings
| Service | Internal Port | External Port (Docker) | K8s NodePort |
| :--- | :--- | :--- | :--- |
| Frontend | 80 | 3000 | 30704 |
| API Gateway | 8080 | 8080 | 30080 |
| User Service | 8081 | 8081 | N/A (ClusterIP) |
| Doctor Service | 8082 | 8082 | N/A (ClusterIP) |
| Appointment Service | 8083 | 8083 | N/A (ClusterIP) |
| Notification Service | 8084 | 8084 | N/A (ClusterIP) |
| Payment Service | 8085 | 8085 | N/A (ClusterIP) |
| Telemedicine | 8086 | 8086 | N/A (ClusterIP) |
| Symptom Checker | 8087 | 8087 | N/A (ClusterIP) |

### 5. Access Credentials
- **Admin**: admin@gmail.com / Admin@123
- **Doctor**: anura@clinexa.com / Doctor@123
- **Patient**: patient@gmail.com / Patient@123
