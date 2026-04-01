# Status Shop - Admin Dashboard

A modern, role-based admin dashboard for the Status Shop e-commerce platform built with Next.js 14 and Tailwind CSS.

## Features

- **Role-Based Access Control**: Three access levels (Owner, Director, Manager)
- **Dashboard Analytics**: Real-time statistics and charts
- **Order Management**: Full order lifecycle management
- **Product Management**: CRUD operations for products
- **Category Management**: Organize products by category
- **Customer Management**: View customer details and order history
- **Branch Management**: Manage multiple shop locations
- **Support Chat**: Handle customer support tickets
- **Reports**: Financial reports and analytics
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Authentication**: JWT with localStorage

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:3000`

### Installation

```bash
# Navigate to the admin dashboard directory
cd admin-dashboard

# Install dependencies
npm install

# Start the development server
npm run dev
```

The dashboard will be available at `http://localhost:3001`.

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@status.uz | Status_shop_owner123 |
| Director | director@status.uz | Status_shop_director123 |
| Manager | manager@status.uz | Status_shop_manager123 |

## Project Structure

```
admin-dashboard/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── login/              # Login page
│   │   ├── dashboard/          # Protected dashboard routes
│   │   │   ├── orders/         # Order management
│   │   │   ├── products/       # Product management
│   │   │   ├── categories/     # Category management
│   │   │   ├── customers/      # Customer management
│   │   │   ├── branches/       # Branch management
│   │   │   ├── reports/        # Reports & analytics
│   │   │   ├── support/        # Support chat
│   │   │   └── settings/       # System settings
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── layout/             # Layout components (Sidebar, Topbar)
│   │   ├── charts/             # Chart components
│   │   └── guards/             # Route guards
│   ├── hooks/                  # Custom React hooks
│   └── lib/                    # Utilities & API client
└── public/                     # Static assets
```

## Role-Based Features

### Owner (Full Access)
- Dashboard & Analytics
- Order Management
- Product Management (CRUD)
- Category Management (CRUD)
- Customer Management (View & Edit)
- Branch Management (CRUD)
- Financial Reports
- Support Chat
- Settings

### Director (Branch-level Access)
- Dashboard (Branch stats)
- Order Management (Branch orders)
- Product Management (View & Edit)
- Customer Management (View only)
- Branch Management (View only)
- Financial Reports (Branch only)
- Support Chat

### Manager (Limited Access)
- Dashboard (Order stats only)
- Order Management (View & Update status only)

## API Integration

The dashboard connects to the NestJS backend API. All API calls are made through the custom `api` client in `src/lib/api.ts` which handles:

- JWT token management
- Automatic token refresh
- Request/response interception
- Error handling

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Building for Production

```bash
npm run build
npm start
```

## License

Private - Status Shop Internal Use
