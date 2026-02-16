# TrailKreweSer - Frontend Application

A modern, responsive React application for discovering and managing off-road 4x4 trail adventures across the United States.

## Description

TrailKreweSer Frontend is a multi-page application (MPA) that provides off-road enthusiasts with an intuitive platform to explore trails, manage their profiles, plan trips, and connect with the off-road community. Built with React 19 and React Router 7, it offers a seamless user experience with JWT-based authentication and real-time interaction with the backend API.

## Problem Statement

Off-road enthusiasts encounter several challenges when planning and tracking their trail adventures:

- **Discovery Gap**: Difficulty finding comprehensive, detailed trail information with photos and specifications
- **Profile Management**: No centralized place to showcase vehicle type, bio, and off-road experience
- **Trip Organization**: Lack of tools to plan, track, and manage upcoming and completed trail adventures
- **Search Limitations**: Hard to filter trails by location, difficulty, or name quickly
- **User Experience**: Many existing platforms have outdated interfaces and poor mobile responsiveness

TrailKreweSer Frontend solves these problems by providing:

- An intuitive, modern interface with responsive design
- Comprehensive trail details with photo galleries
- Personalized user profiles with editable information
- Trip planning and tracking with status management
- Real-time search and filtering capabilities
- Secure authentication flow with JWT tokens

## Core Distinguishing Features

### 1. **Immersive Trail Discovery**

- **Interactive Trail Cards**: Visual grid layout with trail photos, difficulty badges, and location information
- **Real-Time Search**: Instant filtering by trail name, location, or difficulty level
- **Quick Join**: One-click trip assignment directly from the home page
- **Detailed Views**: Dedicated trail detail pages with comprehensive information

### 2. **Dynamic Photo Gallery**

- **Multi-Image Support**: Each trail features multiple high-quality photos
- **Interactive Viewer**: Large main image with thumbnail navigation
- **Smooth Transitions**: Click thumbnails to switch between trail photos
- **Responsive Design**: Optimized for desktop and mobile viewing

### 3. **Comprehensive Profile Management**

- **Editable Profiles**: In-place editing with form validation
- **Rich Information**: Name, bio, vehicle type, and profile photo
- **Trip Dashboard**: View all planned, in-progress, and completed trips
- **Photo Preview**: Real-time preview when entering photo URLs
- **Trip Management**: Add and remove trips directly from profile

### 4. **Secure Authentication System**

- **JWT Token Management**: Secure token storage in sessionStorage
- **Protected Routes**: Authentication guards on sensitive pages
- **Automatic Profile Creation**: Profiles auto-generated on first access
- **Token Decoding**: Client-side JWT decoding for user identification
- **Seamless Login/Register**: Smooth authentication flow with redirects

### 5. **Modern User Experience**

- **React**: Latest React features for optimal performance
- **React Router**: Advanced routing with nested layouts
- **Responsive Design**: Mobile-first approach with flexible layouts
- **Loading States**: User feedback during data fetching
- **Error Handling**: Graceful error messages and user alerts
- **Context API**: Global state management for authentication

### 6. **Trail Detail Pages**

- **Comprehensive Information**: Difficulty, terrain type, location, length, and estimated time
- **Photo Galleries**: Multiple trail photos with interactive navigation
- **Statistics Display**: Visual presentation of trail specifications
- **Join from Details**: Direct trip assignment from detail view
- **Breadcrumb Navigation**: Easy return to trail listings

### 7. **Smart API Integration**

- **Centralized API Client**: Single source of truth for all API calls
- **Token Injection**: Automatic authorization header management
- **Error Handling**: Consistent error processing across all requests
- **Environment Configuration**: API URL management via environment variables

## Technology Stack

### Core Framework & Libraries

- **React** - Modern UI library with latest features
- **React Router** - Advanced client-side routing
- **Vite** - Lightning-fast build tool and dev server

### Authentication & Security

- **jwt-decode** - Client-side JWT token decoding
- **sessionStorage** - Secure token persistence

### Development Tools

- **ESLint** - Code linting and quality
  - `eslint-plugin-react` - React-specific linting rules
  - `eslint-plugin-react-hooks` - Hooks linting
  - `eslint-plugin-react-refresh` - Fast refresh support
- **@vitejs/plugin-react-swc** - Fast refresh using SWC compiler

### Additional Dependencies

- **CORS** - Cross-origin request handling
- **Express** - API communication utilities

### Browser APIs

- **Fetch API** - HTTP requests to backend
- **sessionStorage** - Client-side token storage

## Project Structure

```
capstone-frontend/
│
├── public/                       # Static assets
│
├── src/                          # Source code
│   ├── api/                      # API integration layer
│   │   └── api.js                # Centralized API client (auth, trips, profile)
│   │
│   ├── auth/                     # Authentication system
│   │   ├── AuthContext.jsx       # Auth provider with login/register/logout
│   │   ├── AuthContextDef.js     # Context definition and types
│   │   ├── Login.jsx             # Login page component
│   │   ├── Register.jsx          # Registration page component
│   │   └── useAuth.js            # Custom hook for auth context
│   │
│   ├── layout/                   # Layout components
│   │   ├── Layout.jsx            # Root layout with Outlet for nested routes
│   │   └── Navbar.jsx            # Navigation bar with auth-aware links
│   │
│   ├── pages/                    # Page components (routes)
│   │   ├── Home.jsx              # Trail listing with search and filters
│   │   ├── About.jsx             # About page with mission and info
│   │   ├── Profile.jsx           # User profile with editable info and trips
│   │   └── TrailDetails.jsx      # Individual trail detail with gallery
│   │
│   ├── App.jsx                   # Route configuration
│   ├── main.jsx                  # Application entry point
│   └── index.css                 # Global styles
│
├── index.html                    # HTML template
├── vite.config.js                # Vite configuration
├── eslint.config.js              # ESLint configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## Component Architecture

### Pages

- **Home** - Trail listing page with search, filtering, and join functionality
- **TrailDetails** - Detailed trail view with photo gallery and specifications
- **Profile** - User profile management with trip dashboard and editable fields
- **About** - Static informational page about Trail Kreweser
- **Login** - Authentication form for existing users
- **Register** - New user registration form

### Layout

- **Layout** - Root layout component providing consistent structure
- **Navbar** - Navigation component with conditional rendering based on auth state

### API Layer

- **authAPI** - Registration and login endpoints
- **tripsAPI** - Trail retrieval operations (getAll, getById, getByUserId)
- **userProfileAPI** - Profile management and trip assignments

### Authentication

- **AuthContext** - Global authentication state management
- **AuthProvider** - Context provider with login, register, and logout methods
- **useAuth** - Custom hook for consuming auth context

## Key Features by Page

### Home Page

- Grid display of all available trails
- Search bar with real-time filtering
- Difficulty badges (Easy, Moderate, Difficult)
- Quick join trip functionality
- Responsive card layout
- Loading and error states

### Trail Details Page

- Hero image with photo gallery
- Thumbnail navigation
- Trail statistics (difficulty, terrain, location, length, time)
- Join trip button
- Breadcrumb navigation
- Detailed description

### Profile Page

- Editable profile information (name, bio, vehicle type, photo)
- Photo URL preview
- Trip dashboard showing all user trips
- Remove trip functionality
- Edit/Save/Cancel workflow
- Auto-creation of profiles on first visit

## Getting Started

### Prerequisites

- Node.js v22.0.0 or higher
- npm or equivalent package manager
- Running instance of TrailKreweSer Backend API

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables in `.env`:

```env
VITE_API=http://localhost:5000
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in terminal).

## Available Scripts

- `npm run dev` - Start Vite development server with hot module replacement
- `npm run build` - Build production-ready bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Environment Variables

| Variable   | Description          | Required | Example                 |
| ---------- | -------------------- | -------- | ----------------------- |
| `VITE_API` | Backend API base URL | Yes      | `http://localhost:5000` |

**Note**: All environment variables must be prefixed with `VITE_` to be accessible in the application.

## Routing Structure

```
/ (Layout)
├── / (Home) - Trail listing and search
├── /about - About page
├── /trail/:id - Trail detail page
├── /register - User registration
├── /login - User login
└── /profile - User profile (protected)
```

## Authentication Flow

1. User registers or logs in via forms
2. Backend returns JWT token
3. Token stored in sessionStorage
4. Token included in Authorization header for protected requests
5. AuthContext provides token and auth methods globally
6. Protected routes redirect to login if no token

## API Integration

### Base Configuration

```javascript
const API = import.meta.env.VITE_API;
```

### Request Pattern

```javascript
const fetchWithAuth = async (url, options = {}) => {
  const token = sessionStorage.getItem("token");
  // Add Authorization header if token exists
  // Handle responses and errors consistently
};
```

### Error Handling

- Network errors caught and displayed to user
- Unauthorized requests redirect to login
- Duplicate trip assignments prevented with user-friendly messages

## Design Philosophy

### User-Centric

- Clear, intuitive navigation
- Consistent design language
- Immediate feedback on user actions
- Mobile-responsive layouts

### Performance-Focused

- Vite for fast development and builds
- React 19's optimized rendering
- Lazy loading where appropriate
- Minimal bundle size

### Developer-Friendly

- Clean component structure
- Centralized API client
- Consistent error handling
- ESLint for code quality
- Clear separation of concerns

## Browser Support

- Modern browsers support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Notes

- Uses React 19 features (latest stable)
- ES Modules (`type: "module"` in package.json)
- SWC compiler for faster builds via Vite plugin
- sessionStorage for token persistence (clears on browser close)
- jwt-decode for client-side token inspection (does not validate signature)
- Environment variables accessed via `import.meta.env.VITE_*`
