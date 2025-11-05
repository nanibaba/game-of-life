# Game of Life

An implementation of Conway's Game of Life using Angular and Node.js, with MongoDB for pattern storage.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 24.x or later (using Node 24-LTS is recommended)
- **npm**: Version 10.x or later (comes with Node.js)
- **Docker**: Version 24.x or later
- **Docker Compose**: Version 2.x or later (usually included with Docker Desktop)

## Quick Start with Docker

The easiest way to run the application is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/nanibaba/game-of-life.git
cd game-of-life

# Start the application using Docker Compose
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000

## Manual Development Setup

If you prefer to run the application without Docker for development:

### Frontend (Angular)

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The Angular development server will be available at http://localhost:4200

### Backend (Node.js)

```bash
# Navigate to server directory
cd src/server

# Install dependencies
npm install

# Start development server
npm run dev
```

The backend server will be available at http://localhost:3000

## Running Tests

To run the tests:

```bash
# Run frontend tests
npm test

# Run in headless mode (CI/CD)
npm test -- --watch=false --browsers=ChromeHeadless
```

## Project Structure

```
├── src/
│   ├── app/           # Angular application code
│   ├── server/        # Node.js backend
│   └── environments/  # Environment configurations
├── docker-compose.yml # Docker Compose configuration
├── Dockerfile         # Frontend Dockerfile
└── src/server/Dockerfile  # Backend Dockerfile
```

## Technologies Used

- Frontend:
  - Angular 20.3.0
  - TypeScript
  - Angular CLI
  - Karma & Jasmine for testing
- Backend:
  - Node.js
  - Express 5.1.0
  - MongoDB with Mongoose 8.19.3
- Infrastructure:
  - Docker
  - Nginx (for production builds)

## Development Notes

- The frontend runs on port 4200 by default
- The backend API runs on port 3000
- Hot reloading is enabled for both frontend and backend in development mode
- Tests use Chrome by default, but can be run headless for CI/CD
