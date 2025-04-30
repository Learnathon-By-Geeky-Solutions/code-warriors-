# MetaHive

MetaHive is a real-time, multiplayer virtual office platform designed to facilitate collaboration among distributed teams. Users navigate a 2D workspace, engage in document sharing, collaborate on whiteboards, and communicate via integrated voice and video channels. The system is composed of modular microservices and a React-based frontend, orchestrated for scalability and ease of deployment.

---

## Table of Contents

1. [Project Overview](#project-overview)  
2. [Team Members](#team-members)  
3. [Architecture & Technology Stack](#architecture--technology-stack)  
4. [Prerequisites](#prerequisites)  
5. [Installation & Setup](#installation--setup)  
   1. [Repository Cloning](#repository-cloning)  
   2. [Environment Configuration](#environment-configuration)  
6. [Backend Services](#backend-services)  
7. [Frontend Application](#frontend-application)  
8. [Auxiliary Components](#auxiliary-components)  
9. [Testing](#testing)  
10. [Deployment](#deployment)  
12. [License](#license)  
 

---

## Project Overview

MetaHive simulates a shared virtual office in which team members control avatars, move between collaborative zones, and access integrated productivity tools. Its microservices architecture ensures that each domain (authentication, mapping, project management, document handling, user management, etc.) remains decoupled and independently deployable.

---
## Team Members
1. MD Saidur Rahman(Team Leader)  
2. Nafis Fuad Shahid  
3. Md Abdul Muqtadir
4. Md Abdullah Al Noman(Mentor)
---

## Architecture & Technology Stack

### Architecture Overview

The MetaHive platform is organized into six distinct layers and components, each with a well-defined responsibility and clear separation of concerns.

---

### 1. Presentation Layer
- **Next.js Frontend**  
  - Single-page React application delivered to the browser  
  - Communicates with the API Gateway over HTTPS for all create, read, update, delete operations  
  - Maintains a persistent WebSocket connection to the Multiplayer Map Server for real-time avatar synchronization  
- **Python Chat Bot**  
  - Authenticates via Keycloak (OpenID Connect)  
  - Issues operational commands to backend services through the API Gateway  
  - Performs audit logging and analytics by direct access to the MySQL database  

---

### 2. Orchestration Layer
- **Spring Boot API Gateway**  
  - Serves as the single ingress point for all client traffic  
  - Delegates authentication and token validation to Keycloak  
  - Routes requests to downstream microservices based on path and service registry  
  - Applies cross-cutting concerns (rate limiting, central logging, metrics)  

---

### 3. Domain Microservices
Each microservice exposes a narrowly scoped REST API and maintains its own schema within the shared MySQL instance.
- **User Service**  
  Manages user profiles, credentials, and role assignments  
- **Office Service**  
  Stores office layouts, room definitions, and occupancy status  
- **Document Service**  
  Handles versioned storage and retrieval of shared documents and whiteboards  
- **Project Manager Service**  
  Coordinates projects, tasks, and associated metadata  
- **Multiplayer Map Server**  
  Dedicated WebSocket server for real-time avatar position updates and broadcast events  

---

### 4. Identity & Access Management
- **Keycloak**  
  - Acts as the OpenID Connect provider for end-users and service-to-service tokens  
  - Issues and validates JSON Web Tokens (JWTs)  
  - Enforces role-based access control policies across all services  

---

### 5. Persistence Layer
- **Remote MySQL Database**  
  - Central relational store for all domain entities  
  - Each service owns its own schema within the same database instance  
- **Redis (optional)**  
  - Caching layer for session data, rate-limit counters, and ephemeral state  

---

### 6. External Integrations
- **Discord Integration**  
  - Listens for events from the Frontend and Map Server  
  - Sends alerts and notifications to configured Discord channels  
- **Local Raag Service**  
  - Python-based workflow automation component  
  - Invoked by the Chat Bot or scheduled tasks  

---

This layered, microservices-driven topology ensures that each component can be developed, tested, deployed, and scaled independently, while the API Gateway centralizes authentication, routing, and observability.  

### Tech Stack

| Component         | Technology                                 |
|-------------------|--------------------------------------------|
| API Gateway       | Spring Boot, Spring Cloud Gateway          |
| Authentication    | Keycloak (OpenID Connect)                  |
| Microservices     | Spring Boot (Gradle), WebSocket messaging  |
| Frontend          | Next.js (React), TypeScript, Tailwind CSS  |
| Voice & Video     | AgoraRTC                                   |
| 2D Engine         | Kaboom.js                                  |
| Data Stores       | MySQL, MongoDB, Firebase, Redis            |
| Containerization  | Docker, Docker Compose                     |
| CI/CD             | GitHub Actions                             |

---

## Prerequisites

- **Java 21**  
- **Node.js ≥ 18** and **npm** (or **Yarn**)  
- **Docker** & **Docker Compose**  
- **Keycloak** instance (realm: `meta`, client: `metahive`)  
- **PostgreSQL** (or **MongoDB**) & **Redis**  
- **Python 3.8+** (for the Local Raag component)  

---

## Installation & Setup

### Repository Cloning

```bash
git clone https://github.com/your-org/code-warriors-.git
cd code-warriors-
```
### Environment Configuration

```bash
cp backend/api-gateway/.env.example backend/api-gateway/.env
cp backend/doc-server/.env.example backend/doc-server/.env
cp backend/office-service/.env.example backend/office-service/.env
cp backend/project-manager/.env.example backend/project-manager/.env
cp backend/user-service/.env.example backend/user-service/.env
cp frontend/.env.example frontend/.env
```
## Backend Services

1. **Navigate to the backend directory**  
   ```bash
   cd backend
  
   ./gradlew build
2. **Launch infrastructure containers**
   ```bash
    docker compose up -d
   ```
3. **Compile all services**
   ```bash
   ./gradlew build
   ```
4. **Start each service**

   - **API Gateway**
     ```bash
     ./gradlew :api-gateway:bootRun
     ```
   
   - **Document Server**
     ```bash
     ./gradlew :doc-server:bootRun
     ```
   
   - **Office Service**
     ```bash
     ./gradlew :office-service:bootRun
     ```
   
   - **Project Manager**
     ```bash
     ./gradlew :project-manager:bootRun
     ```
   - **Map Service**
     ```bash
     ./gradlew :map-service:bootRun
     ```
## Frontend Application

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start development server**
   ```bash
   npm run dev
   ```
4. **Access the application**
   ```bash
   Open http://localhost:3000 in your web browser.
   ```
## Auxiliary Components
1. **Discord Bot**
   ```bash
   cd ../discord-backend
   node index.js
   ```
2. **Local Raag Service**
   ```bash
   source venv/bin/activate
   python app.py
   ```

## Testing
**Backend Unit Tests**
  ```bash
  cd backend
  ./gradlew test
  ```

## Deployment

Our application is publicly accessible at:  
```bash
[https://meta-hive-frontend.vercel.app/](https://meta-hive-frontend.vercel.app/)
```



## License
This project is licensed under the MIT License. See LICENSE for details.
