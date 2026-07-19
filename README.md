# Parth Nautiyal - Full-Stack Developer Portfolio

This project has been fully migrated to a robust, enterprise-grade tech stack:
- **Frontend**: **Angular 21** (Standalone Components, RxJS Signals, Tailwind CSS v4)
- **Backend**: **Spring Boot 3.4.x** (Java 21, REST APIs, WebClient, JavaMailSender)

---

## 📂 Project Structure

- `portfolio-frontend/`: The Angular application.
- `portfolio-backend/`: The Spring Boot application.
- `react-backup/`: Contains archived files from the previous React setup.

---

## 🛠️ Prerequisites

Before launching the application, ensure you have:
1. **Java Development Kit (JDK) 21** or higher.
2. **Node.js v20.x** or higher.
3. **Maven** (optional; the backend includes `./mvnw` script).
4. **Ollama** (optional; for local offline LLM features).

---

## 🚀 How to Start the Application

To run the full stack locally, you need to spin up both the backend and the frontend servers.

### 1. Start the Spring Boot Backend

1. Navigate to the backend directory:
   ```bash
   cd portfolio-backend
   ```
2. Configure your environment keys. Create a `.env` file or set environment variables:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key
   SPRING_MAIL_HOST=smtp.gmail.com
   SPRING_MAIL_PORT=587
   SPRING_MAIL_USERNAME=your_email@gmail.com
   SPRING_MAIL_PASSWORD=your_app_password
   PORTFOLIO_CONTACT_TO_EMAIL=parthnautiyal2002@gmail.com
   ```
   *Note: If no Gemini key is provided, the backend falls back automatically to local Ollama (`llama3`) or static responses.*
3. Run the Spring Boot application using the Maven wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend server will launch on `http://localhost:8080`.

---

### 2. Start the Angular Frontend

1. Navigate to the frontend directory:
   ```bash
   cd portfolio-frontend
   ```
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
   The Angular application will launch on `http://localhost:4200`.

---

## 🔄 API Proxy & Communication

The Angular development server is configured with a local reverse proxy (`proxy.conf.json`). Any frontend call to `/api/...` is automatically forwarded to the backend running at `http://localhost:8080`. This prevents CORS errors and mirrors production route rules.

---

## 🤖 Local Offline AI Setup (Ollama)

If you'd like to run chatbot queries and resume parsing offline:
1. Download **[ollama.com](https://ollama.com)**.
2. Pull your model of choice:
   ```bash
   ollama pull llama3
   ```
3. Start the Ollama server with CORS enabled:
   - **macOS**:
     ```bash
     OLLAMA_ORIGINS="*" ollama serve
     ```
   - **Windows (PowerShell)**:
     ```powershell
     $env:OLLAMA_ORIGINS="*"
     ollama serve
     ```
