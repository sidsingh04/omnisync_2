# OmniSync 2

## Overview

OmniSync 2 is a modern, real-time ticketing and support agent management system designed to streamline operations between Support Agents and Supervisors. Built with a robust full-stack architecture, it ensures seamless communication, efficient ticket resolution workflows, and comprehensive oversight capabilities.

## Key Features

- **Role-Based Access Control**: Secure JWT-based authentication for both Agents and Supervisors ensuring protected API layers.
- **Agent Dashboard**: Dedicated dashboard for agents to manage their availability, view assigned tickets, and handle multi-stage approvals.
- **Supervisor Management**: Dedicated capabilities for supervisors to monitor online/offline agents, view detailed metrics, and perform administrative actions like forced logouts.
- **Advanced Ticket Workflow**: End-to-end ticket lifecycle management, including creation, approval routing, and tracking.
- **Data Visualization**: Extensible charting modules utilizing Recharts to track global metrics and operational performance.

## Tech Stack

### Frontend
- **Framework**: React 19 (TypeScript), Vite
- **Styling**: Tailwind CSS v4, implementation of Radix UI components (Shadcn)
- **Routing**: React Router DOM
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **HTTP/API Client**: Axios

### Backend
- **Runtime**: Node.js
- **API Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **WebSockets**: `ws` for real-time duplex communication
- **Authentication Pipeline**: Passport.js (JWT Strategy), bcrypt

## Getting Started

### Prerequisites

- Node.js (v18+ or higher recommended)
- Running MongoDB instance (Local or Atlas)

### Installation

1. Navigate to the project directory:
   ```bash
   cd omnisync_2
   ```

2. **Backend Setup**:
   ```bash
   cd Backend
   npm install
   ```
   *Create a `.env` file in the `Backend` directory and define the required environment variables (e.g., `PORT`, `MONGO_URI`, `JWT_SECRET`).*

3. **Frontend Setup**:
   ```bash
   cd Frontend
   npm install
   ```
   *Create a `.env` file in the `Frontend` directory if there are client-side variables needed (e.g., `VITE_API_BASE_URL`).*

### Running the Application

To run the application locally, you will need to start both the frontend and backend servers.

1. **Start the Backend Server**:
   ```bash
   cd Backend
   npx nodemon index.js
   ```
   *This starts the server on your configured port (typically 5000 or 8080) using nodemon.*

2. **Start the Frontend Development Server**:
   ```bash
   cd Frontend
   npm run dev
   ```



