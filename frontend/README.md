# LNMIIT Degree Audit System - Frontend

React-based frontend application for the LNMIIT Degree Audit System.

## Technology Stack

- React 18
- Vite (build tool)
- React Router (navigation)
- Tailwind CSS (styling)
- shadcn/ui (component library)
- Axios (HTTP client)
- PapaParse (CSV parsing)
- Lucide React (icons)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Application will run on `http://localhost:5173`

## Build

```bash
npm run build
```

Build output in `dist/` directory.

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   └── Layout.jsx       # Main layout wrapper
├── pages/
│   ├── Login.jsx        # Login page
│   ├── student/         # Student pages
│   ├── advisor/         # Advisor pages
│   └── registrar/       # Registrar pages
├── services/
│   ├── api.js          # Axios instance
│   ├── authService.js  # Authentication
│   ├── studentService.js
│   ├── advisorService.js
│   └── registrarService.js
├── contexts/
│   └── AuthContext.jsx  # Auth state management
├── utils/
│   └── cn.js           # Class name utility
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Features

### Authentication
- JWT-based authentication
- Role-based access control
- Protected routes
- Automatic token refresh

### Student Dashboard
- Degree audit display
- CGPA and credit tracking
- Progress visualization
- Completed courses table
- Remaining requirements

### Advisor Dashboard
- Advisee list
- At-risk student identification
- Risk level indicators
- Detailed student audit view

### Registrar Dashboard
- CSV file upload
- Data validation
- Import preview
- Bulk transcript import
- Error reporting

## Components

### shadcn/ui Components Used
- Button - Interactive buttons with variants
- Card - Content containers
- Badge - Status indicators
- Input - Form inputs
- Table - Data tables

### Custom Components
- Layout - Page wrapper with header/footer
- Login - Authentication page

## API Integration

Base URL: `http://localhost:5000/api`

API requests automatically include JWT token from localStorage.

### Error Handling
- 401 responses trigger logout
- Error messages displayed to user
- Network errors handled gracefully

## Styling

### Tailwind Configuration
- Custom color scheme matching LNMIIT branding
- Responsive breakpoints
- shadcn/ui theme variables

### Design System
- Primary color: Blue (#3B82F6)
- Success: Green
- Warning: Orange/Yellow
- Danger: Red
- Neutral: Gray scale

## Environment

### Development
- Hot module replacement (HMR)
- React Fast Refresh
- Proxy to backend API

### Production
- Optimized build
- Code splitting
- Asset optimization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Team

Team T030 - LNMIIT
