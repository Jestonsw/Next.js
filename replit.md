# Edirne Events - Event Management Platform

## Overview

Edirne Events is a comprehensive event discovery and management platform designed specifically for Edirne, Turkey. The platform enables users to discover local events, explore venues, and submit their own events and venues. Built with Next.js 14 and React 18, it features a modern responsive design with multi-language support (Turkish, English, Bulgarian) and offline capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router and React 18
- **Styling**: Tailwind CSS with custom Edirne-themed color palette and design system
- **State Management**: React hooks and Context API for language switching and user management
- **Components**: Modular component architecture with lazy loading for performance optimization
- **Maps Integration**: Leaflet for interactive maps and location-based features
- **PWA Features**: Service worker implementation with offline support and local caching
- **Image Optimization**: Next.js Image component with unoptimized setting for Replit compatibility

### Backend Architecture
- **API**: Next.js API routes providing RESTful endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **File Storage**: Local file system storage in `/public/uploads/` directory
- **Authentication**: Session-based user authentication without complex OAuth
- **Email Service**: Nodemailer integration for notifications

### Data Storage
- **Primary Database**: PostgreSQL with the following main tables:
  - `events` - Event information with location coordinates
  - `categories` - Event categorization system (12+ categories)
  - `venues` - Venue/location management with ratings
  - `venue_categories` - Venue categorization
  - `users` - User profiles and authentication
  - `favorites` - User favorite events
  - `reviews` - Event and venue rating system

## Key Components

### Event Management
- **Event Discovery**: Category-based browsing with 12+ event categories
- **Event Submission**: User-submitted events with admin approval workflow
- **Image Support**: Multiple image uploads per event (up to 3 images)
- **Location Integration**: GPS coordinates and interactive map integration
- **Rating System**: User reviews and ratings for events

### Venue Management
- **Venue Directory**: Comprehensive venue database with categorization
- **Venue Submission**: User-contributed venue information
- **Interactive Maps**: Leaflet-based location services
- **Amenities Tracking**: Venue facilities and services information
- **Rating System**: User reviews and ratings for venues

### Multi-language Support
- **Internationalization**: Full support for Turkish, English, and Bulgarian
- **Language Context**: React Context API for seamless language switching
- **Localized Content**: Date formatting and UI text in multiple languages

### Offline Capabilities
- **Service Worker**: Background sync and offline data access
- **Local Caching**: Event and venue data caching for offline viewing
- **Offline Indicator**: Status indicator for connection state
- **Progressive Enhancement**: Graceful degradation when offline

## Data Flow

1. **Event Discovery Flow**:
   - User browses events by category or location
   - Real-time filtering and search functionality
   - Location-based distance calculations
   - Favorite events management

2. **Submission Flow**:
   - User registration and authentication
   - Event/venue form submission with validation
   - Image upload and processing
   - Admin approval workflow

3. **Data Synchronization**:
   - Real-time data updates via API endpoints
   - Offline data caching and sync
   - Background updates when connection restored

## External Dependencies

### Core Dependencies
- **Next.js 14.0.4**: React framework with App Router
- **React 18**: Frontend library
- **Drizzle ORM 0.29.1**: Type-safe database ORM
- **PostgreSQL**: Primary database via `postgres` package
- **Tailwind CSS 3.3.6**: Utility-first CSS framework

### Map and Location Services
- **Leaflet 1.9.4**: Interactive maps
- **@types/leaflet**: TypeScript definitions

### UI and Animation
- **Lucide React 0.294.0**: Icon library
- **Framer Motion 10.16.16**: Animation library
- **Date-fns 2.30.0**: Date manipulation and formatting

### Communication
- **Nodemailer 6.9.7**: Email service integration
- **@types/nodemailer**: TypeScript support

### Development Tools
- **TypeScript 5**: Type safety
- **ESLint**: Code linting
- **Drizzle Kit 0.20.6**: Database migration tools
- **TSX 4.6.2**: TypeScript execution

## Deployment Strategy

### Replit Deployment
- **Platform**: Currently deployed on Replit with custom domain
- **Port Configuration**: Runs on port 3000 for development, port 5000 for production
- **Environment Variables**: Database URL, email credentials, admin password
- **Image Configuration**: Unoptimized images for Replit compatibility
- **Build Configuration**: Standalone output disabled for Replit

### Vercel Compatibility
- **Build System**: Compatible with Vercel deployment
- **Environment Variables**: Same variables required (DATABASE_URL, EMAIL_USER, EMAIL_PASS, ADMIN_PASSWORD)
- **Static Assets**: Public directory with proper routing
- **API Routes**: Next.js API routes fully compatible

### Database Configuration
- **Connection**: PostgreSQL via connection string
- **Migrations**: Drizzle Kit for schema management
- **Connection Pooling**: Optimized for serverless environments

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
- June 29, 2025. Fixed interactive map display issue - added dynamic Leaflet CSS loading, optimized container sizing, resolved tile rendering problems in modals
- June 29, 2025. Completed admin approval system overhaul - simplified workflow with single "İncele ve Onayla" button, fixed API date handling, resolved image rendering for approved events
- June 29, 2025. GitHub repository fully synchronized - all admin approval system updates uploaded, including API fixes, EventCard improvements, and documentation updates
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```