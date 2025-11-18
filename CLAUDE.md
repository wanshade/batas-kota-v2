# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a mini soccer field booking application called "Batas Kota – The Town Space" built with Next.js 16, TypeScript, and PostgreSQL. The application allows users to book mini soccer fields in Selong, Lombok Timur, NTB, Indonesia.

### Core Features
- User authentication and registration with role-based access (USER/ADMIN)
- Time-slot based booking system using jadwal.json for dynamic pricing
- Multi-date booking support with persistent state management
- Team name and WhatsApp number collection for bookings
- Payment proof upload functionality
- Admin dashboard for managing fields, bookings, and users
- Indonesian language interface

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI components
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with credentials provider
- **File Storage**: Vercel Blob
- **Form Handling**: React Hook Form with Zod validation
- **Date/Time**: date-fns with timezone support
- **State Management**: Zustand for booking state
- **Time Slot System**: Custom pricing based on jadwal.json with weekday/weekend variations

## Development Commands

### Essential Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Database Commands
```bash
# Generate database migrations
npm run db:generate

# Run database migrations
npm run db:migrate

# Push schema changes directly to database
npm run db:push

# Seed database with sample data (if script exists)
npm run db:seed
```

## Project Architecture

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth.js authentication
│   │   ├── bookings/      # Booking CRUD operations
│   │   ├── fields/        # Field management
│   │   ├── upload/        # File upload to Vercel Blob
│   │   └── admin/         # Admin-only endpoints
│   ├── admin/             # Admin dashboard pages
│   ├── bookings/          # Booking detail pages
│   ├── fields/            # Field listing page
│   └── (auth)/            # Authentication pages
├── components/
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   ├── admin/            # Admin-specific components
│   ├── layout/           # Layout components (navbar, footer)
│   └── *.tsx             # Feature-specific components
├── lib/
│   ├── auth.ts           # NextAuth.js configuration
│   ├── utils.ts          # Utility functions
│   ├── currency.ts       # Currency formatting
│   └── timezone.ts       # Timezone utilities
├── db/
│   ├── index.ts          # Database connection
│   └── schema.ts         # Drizzle ORM schema
└── middleware.ts         # Next.js middleware for auth
```

### Database Schema
The application uses three main tables:
- **users**: User authentication and role management
- **fields**: Soccer field information with pricing
- **bookings**: Booking records with payment tracking, team names, and WhatsApp numbers

**Key Booking Fields**:
- `namaTim`: Team name for booking identification
- `noWhatsapp`: WhatsApp number for customer contact
- `paymentType`: FULL or DEPOSIT payment options
- `status`: Booking status tracking through lifecycle
- `amountPaid`: Payment amount with deposit calculations

### Authentication Flow
- Uses NextAuth.js with credentials provider
- Password hashing with bcryptjs
- Role-based access control (USER/ADMIN)
- Session management with JWT strategy
- Protected routes via middleware

### Admin System
- Comprehensive dashboard at `/admin`
- Field management (CRUD operations)
- Booking approval and management
- User management
- Analytics and reporting
- Enhanced UI components for admin operations

### Time Slot Booking System
- **Dynamic Pricing**: Uses `public/jadwal.json` for time-based pricing with different rates for weekdays/weekends
- **Time Format**: jadwal.json uses dot format (e.g., "16.00 - 18.00") which gets converted to colon format for Date compatibility
- **Multi-Date Support**: Users can book slots across multiple dates using Zustand state management
- **State Management**: Global booking state stored in `src/stores/booking-store.ts`
- **Validation**: Indonesian WhatsApp number format validation (08xxx or 62xxx)
- **Grid UI**: Time slot selection grid with availability status and pricing display

### Booking System Architecture
- **Form Data**: Team name (namaTim) and WhatsApp number (noWhatsapp) collection
- **Slot Selection**: Toggle-based time slot selection with visual feedback
- **Price Calculation**: Server-side price calculation using `calculateBookingPriceServer`
- **Overlap Detection**: Prevents double-booking with comprehensive time overlap checking
- **Status Tracking**: PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED
- **Payment Types**: FULL and DEPOSIT with 30% deposit calculation

## Key Implementation Details

### Database Configuration
- Drizzle ORM with PostgreSQL
- Migration files stored in `drizzle/migrations/`
- Schema defined in `src/db/schema.ts`
- Connection configured via `drizzle.config.ts`

### Authentication Configuration
- NextAuth.js configured in `src/lib/auth.ts`
- Custom middleware for route protection
- Role-based session management
- Custom sign-in page at `/login`

### File Upload System
- Vercel Blob for image storage
- Separate API routes for different upload types
- Support for payment proof images and field images

### Component Architecture
- Uses shadcn/ui components for consistent design
- Custom components for complex features
- Client-only components for dynamic content
- Layout components for navigation and footer

## Environment Variables Required
```
DATABASE_URL=           # PostgreSQL connection string
NEXTAUTH_SECRET=        # NextAuth.js secret
NEXTAUTH_URL=           # NextAuth.js URL
BLOB_READ_WRITE_TOKEN=  # Vercel Blob storage token
```

## Critical Implementation Details

### Time Slot System Architecture
- **jadwal.json Structure**: Contains time slots with pricing for different day types (Senin_sd_Kamis, Jumat, Sabtu, Minggu)
- **Time Format Conversion**: Dot format ("16.00") converted to colon format ("16:00") for Date object compatibility
- **Price Calculation**: Server-side calculation in `src/lib/schedule-server.ts` with weekday/weekend pricing
- **Slot Parsing**: `parseTimeSlot()` function handles time format conversion and validation

### Zustand State Management
- **Global State**: `src/stores/booking-store.ts` manages multi-date booking selections
- **Data Structure**: `selectedSlotsByDate: Record<string, string[]>` stores slots by date
- **Form Data**: Persistent form state across date navigation
- **Actions**: addSlotToDate, removeSlotFromDate, clearAllSlots for state manipulation

### Form Validation
- **WhatsApp Numbers**: Indonesian format validation (08xxx or 62xxx) with regex pattern
- **Required Fields**: Team name and WhatsApp number are mandatory for booking
- **Time Slot Validation**: Prevents selection of booked or passed time slots

### API Integration
- **Booking Creation**: `/api/bookings` POST handles multi-date booking creation
- **Admin Bookings**: `/api/admin/bookings` supports walk-in customer booking
- **Price Calculation**: Server-side validation prevents client-side price manipulation

## Development Notes

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent component structure with React hooks
- Zod for runtime validation

### UI/UX Considerations
- Indonesian language throughout the application
- Mobile-responsive design
- Modern UI with Tailwind CSS
- Loading states and error handling
- Accessibility considerations with Radix UI

### Database Management
Always use Drizzle migrations for schema changes. The `db:push` command is available for development but prefer migrations for production deployments.

### Time Slot Development
When working with the booking system:
1. Always use `parseTimeSlot()` to convert jadwal.json time formats
2. Use server-side price calculation for security
3. Validate time overlaps using comprehensive date/time comparison
4. Maintain Zustand state consistency across date navigation
5. Handle Indonesian phone number formatting properly