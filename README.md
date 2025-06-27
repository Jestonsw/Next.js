# Edirne Events - Event Management Platform

## Overview

Edirne Events is a comprehensive event management and discovery platform built specifically for Edirne, Turkey. The platform allows users to discover local events, venues, and submit their own events for community engagement. It features a modern web interface with multilingual support (Turkish/English/Bulgarian) and both online and offline capabilities.

## Features

### Event Management
- Event creation and submission by users
- Admin approval workflow for user-submitted events
- Category-based event organization (12+ categories)
- Image upload support (up to 3 images per event)
- Location-based event discovery with coordinates
- Rating and review system

### Venue Management
- Venue directory with detailed information
- Category-based venue classification
- Interactive map integration for venue locations
- Comprehensive venue submission system

### User Experience
- Multi-language support (Turkish, English, Bulgarian)
- PWA features with offline support
- Mobile-first responsive design
- Real-time filtering and search
- Interactive maps with location services

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom Edirne-themed color palette
- **UI Components**: Custom component library with responsive design
- **State Management**: React hooks and Context API
- **Maps**: Leaflet for interactive maps and location services
- **Animations**: Framer Motion for smooth transitions

### Backend
- **API**: Next.js API routes providing RESTful endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations
- **File Storage**: Local file system for image uploads
- **Authentication**: User registration and admin panel system

### Database Schema
- `events` - Event information with location data
- `categories` - Event categorization system
- `venues` - Venue/location management
- `users` - User profiles and preferences
- `favorites` - User favorite events
- `reviews` - Event ratings and comments

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
