# Boxinator - Shipment Delivery Application

A comprehensive web application for managing shipment deliveries, built with React (frontend) and Node.js/Express (backend).

## 🚀 Features

### User Features
- **User Registration & Authentication** - Secure user registration and login system
- **Shipment Management** - Create, track, and manage shipments
- **Multiple Box Types** - Choose from various box sizes and types
- **Country-based Pricing** - Dynamic pricing based on destination country
- **Real-time Tracking** - Track shipments with detailed status updates
- **User Dashboard** - Personal dashboard with shipment statistics
- **Profile Management** - Update personal information and password

### Admin Features
- **Admin Dashboard** - Comprehensive analytics and statistics
- **User Management** - Manage user accounts and permissions
- **Shipment Management** - View and update all shipments
- **Country Management** - Manage countries and shipping multipliers
- **Box Management** - Manage box types and pricing
- **Analytics** - Detailed reports and analytics

### Core Functionality
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Real-time Updates** - Live status updates for shipments
- **Email Notifications** - Automated notifications for status changes
- **Search & Filtering** - Advanced search and filtering capabilities
- **Pagination** - Efficient data loading with pagination
- **Security** - JWT authentication and rate limiting

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Database (via Supabase)
- **Prisma** - Database ORM and query builder
- **JWT** - Bearer token authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation and sanitization
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API abuse prevention and authentication rate limiting

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **Recharts** - Charts and graphs
- **Axios** - HTTP client

## 📁 Project Structure

```
shipment-delivery-app/
├── backend/
│   ├── controllers/         # Route controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middlewares/        # Custom middlewares
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration files
│   ├── .env.example        # Environment variables template
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── .env.example        # Environment variables template
│   └── package.json        # Frontend dependencies
├── .gitignore              # Git ignore rules
├── README.md               # This file
└── LICENSE                 # License file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (Supabase recommended)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shipment-delivery-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment file and configure
   cp .env.example .env
   # Edit .env with your Supabase PostgreSQL configuration
   
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Seed the database (optional)
   npm run seed
   
   # Start the server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Copy environment file and configure
   cp .env.example .env
   # Edit .env with your configuration
   
   # Start the development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Default Admin Credentials
After running the database seed:
- **Email:** admin@boxinator.com
- **Password:** admin123

### Sample User Credentials
- **Email:** john.doe@example.com
- **Password:** admin123

## 🔧 Configuration

### Backend Environment Variables
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase PostgreSQL Configuration
DATABASE_URL="postgresql://username:password@db.supabaseproject.co:5432/postgres"
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Rate Limiting Configuration
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15
AUTH_RATE_LIMIT_MAX=5
AUTH_RATE_LIMIT_WINDOW=15

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Security Configuration
BCRYPT_ROUNDS=12
```

### Frontend Environment Variables
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Boxinator
VITE_APP_VERSION=1.0.0
```

## 📊 Database Schema

### User Model
- Personal information (name, email, contact, address)
- Authentication data (password, tokens)
- Role-based access (user/admin)
- Account status and verification

### Shipment Model
- Sender and receiver information
- Box type and contents
- Shipping cost and payment status
- Tracking history and status updates
- Delivery information

### Country Model
- Country details (name, code, currency)
- Shipping multipliers and zones
- Continental grouping

### Box Model
- Box specifications (dimensions, weight)
- Pricing information
- Color and description

## 🔐 API Endpoints

### Authentication
- `POST /login` - User authentication with Bearer token (API-02)
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/updatedetails` - Update user profile
- `PUT /api/auth/updatepassword` - Update password

### Shipments (API-03)
- `GET /shipments` - Get shipments for authenticated user
- `GET /shipments/complete` - Get completed shipments
- `GET /shipments/cancelled` - Get cancelled shipments
- `POST /shipments` - Create new shipment
- `GET /shipments/:shipment_id` - Get shipment details
- `GET /shipments/customer/:customer_id` - Get customer shipments (Admin)
- `PUT /shipments/:shipment_id` - Update shipment (cancel for users, any status for admin)
- `DELETE /shipments/:shipment_id` - Delete shipment (Admin only, extreme situations)

### Account Management (API-04)
- `GET /account/:account_id` - Get account information
- `PUT /account/:account_id` - Update account information
- `POST /account` - Create new account
- `DELETE /account/:account_id` - Delete account (Admin only, extreme situations)

### Settings (API-05)
- `GET /settings/countries` - Get country multiplier information
- `POST /settings/countries/:country_id` - Add new country (Admin only)
- `PUT /settings/countries/:country_id` - Update country information (Admin only)

### Additional Endpoints
- `GET /api/countries` - Get all countries
- `GET /api/boxes` - Get all box types
- `POST /api/boxes/calculate-cost` - Calculate shipping cost

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build and deploy to your hosting platform
3. Ensure MongoDB connection is configured
4. Set up SSL certificates

### Frontend Deployment
1. Update API URL in environment variables
2. Build the production version:
   ```bash
   npm run build
   ```
3. Deploy the `dist` folder to your hosting platform

## 📈 Performance Optimization

- **Database Indexing** - Optimized queries with proper indexes
- **API Rate Limiting** - Prevents abuse and ensures stability
- **Frontend Caching** - React Query for efficient data management
- **Code Splitting** - Lazy loading for optimal bundle size
- **Image Optimization** - Compressed and optimized assets

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Input Validation** - Express Validator for API security
- **CORS Protection** - Configured for specific origins
- **Helmet.js** - Security headers protection
- **Rate Limiting** - API abuse prevention

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎯 Future Enhancements

- [ ] Mobile application
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Integration with shipping carriers
- [ ] Multi-language support
- [ ] API documentation with Swagger
- [ ] Automated testing suite
- [ ] Docker containerization

---

**Made with ❤️ by the Boxinator Team**
