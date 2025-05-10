
# Lead Management and Distribution System

## Overview
This application provides a comprehensive system for managing and distributing leads to companies. It includes functionality for admins to manage leads, companies to receive and process leads, and users to submit new leads.

## Key Features

### Lead Distribution
- Automated distribution of leads to companies based on configurable strategies
- Support for multiple distribution algorithms (Round Robin, Category Matching)
- Budget management to control lead flow based on company settings
- Pause/resume functionality for controlling lead distribution

### User Roles
- **Admin**: Can manage all leads, companies, and system settings
- **Company**: Can view and process assigned leads, and manage their settings
- **User**: Can submit new leads and track their own submissions

### Reporting
- Comprehensive dashboard for admins to monitor system performance
- Charts and visualizations for lead status, categories, and time trends
- Company-specific reports for tracking performance

## Getting Started

1. **Installation**
   ```
   npm install
   ```

2. **Run Development Server**
   ```
   npm run dev
   ```

3. **Build for Production**
   ```
   npm run build
   ```

## Usage

### Admin Users
- Access the admin dashboard at `/`
- View and manage all leads
- Configure system settings
- Access detailed reports at `/leads/reports`

### Company Users
- View assigned leads at `/leads/company`
- Manage company settings for lead distribution
- Toggle lead reception on/off

### Regular Users
- Submit new leads through the form
- Track your submitted leads at `/leads/my`

## Technical Stack

- React with TypeScript
- Supabase for authentication and database
- Tailwind CSS and shadcn/ui for styling
- React Query for data fetching
- Recharts for data visualization

## Development Roadmap

See [DEV_NOTES.md](./DEV_NOTES.md) for current development status and roadmap.

