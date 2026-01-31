# Project Management App - Frontend

A modern project management application built with React, Redux, and Tailwind CSS. This application provides workspace management, project tracking, and task assignment features with real-time collaboration.

## Tech Stack

- React - UI Library
- Redux Toolkit - State Management
- React Router - Routing
- Clerk - Authentication & User Management
- Axios - HTTP Client
- Tailwind CSS - Styling
- Lucide React - Icons
- Vite - Build Tool

## Features

- 🏢 Multi-workspace support
- 👥 Team collaboration with role-based access
- 📋 Project and task management
- 🔔 Real-time notifications
- 🌓 Dark mode support
- 📧 Email notifications for task assignments
- 🔄 Webhook integration with Clerk and Inngest

## Project Structure
```
frontend/
├── src/
│   ├── app/           # Redux store configuration
│   ├── components/    # Reusable React components
│   ├── config/        # Axios instance and API configuration
│   ├── features/      # Redux slices (workspace, theme, etc.)
│   ├── pages/         # Application pages/routes
│   └── App.jsx        # Main application component
```

## Prerequisites

- Node.js (v16 or higher)
- npm or pnpm
- Git

## Environment Variables

Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## Installation
```bash
# Clone repository
git clone https://github.com/ahmadammarm/project-management-frontend.git
cd project-management-frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy