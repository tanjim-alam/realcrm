# Real Estate CRM - MERN Stack SaaS

A comprehensive Real Estate Customer Relationship Management (CRM) system built with the MERN stack, featuring multi-tenancy, role-based access control, and subscription management.

## 🚀 Features

### Core Features
- **Multi-tenant Architecture**: Each company has isolated data
- **Role-based Access Control**: Admin and Agent roles with different permissions
- **Lead Management**: Track leads from initial contact to closing
- **Property Management**: Manage property listings with detailed information
- **Team Management**: Add and manage team members (Admin only)
- **Subscription Management**: Free, Basic, and Premium plans with usage limits

### Technical Features
- **JWT Authentication**: Secure token-based authentication
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live data updates across the application
- **Data Validation**: Comprehensive input validation on both frontend and backend
- **Error Handling**: Graceful error handling with user-friendly messages

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **React 18** with functional components and hooks
- **React Router** for client-side routing
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hook Form** for form management
- **React Hot Toast** for notifications

## 📁 Project Structure

```
real-estate-crm/
├── backend/                 # Backend API
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── server.js          # Express server
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── config/        # API configuration
│   │   └── App.jsx        # Main app component
│   └── public/            # Static assets
├── docker-compose.yml     # Docker configuration
├── Dockerfile            # Docker build file
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-estate-crm
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Create `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/realestate_crm
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   NODE_ENV=development
   ```

   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7
   ```

5. **Run the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or run separately
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. **Clone and navigate to the project**
   ```bash
   git clone <repository-url>
   cd real-estate-crm
   ```

2. **Start the services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Application: http://localhost:5000
   - MongoDB: localhost:27017

### Using Docker

1. **Build the image**
   ```bash
   docker build -t real-estate-crm .
   ```

2. **Run the container**
   ```bash
   docker run -p 5000:5000 \
     -e MONGO_URI=mongodb://host.docker.internal:27017/realestate_crm \
     -e JWT_SECRET=your_secret_key \
     real-estate-crm
   ```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new company and admin
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Leads
- `GET /api/leads` - Get all leads (with pagination and filters)
- `POST /api/leads` - Create new lead
- `GET /api/leads/:id` - Get single lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `GET /api/leads/stats/summary` - Get leads statistics

### Properties
- `GET /api/properties` - Get all properties (with pagination and filters)
- `POST /api/properties` - Create new property
- `GET /api/properties/:id` - Get single property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `GET /api/properties/stats/summary` - Get properties statistics

### Admin (Admin only)
- `GET /api/admin/users` - Get all team members
- `POST /api/admin/users` - Create new team member
- `PUT /api/admin/users/:id` - Update team member
- `DELETE /api/admin/users/:id` - Delete team member
- `GET /api/admin/dashboard` - Get admin dashboard data

### Subscription
- `GET /api/subscription/status` - Get current subscription
- `POST /api/subscription/activate` - Activate/upgrade plan
- `GET /api/subscription/plans` - Get available plans
- `GET /api/subscription/usage` - Get usage statistics

## 🔐 User Roles

### Admin
- Full access to all features
- Can manage team members
- Can manage subscription
- Can view all company data

### Agent
- Can manage leads and properties
- Cannot access admin features
- Cannot manage team members

## 💳 Subscription Plans

### Free Plan
- 50 leads maximum
- 10 properties maximum
- 2 users maximum
- Basic features only

### Basic Plan ($29/month)
- 500 leads maximum
- 100 properties maximum
- 5 users maximum
- Analytics included

### Premium Plan ($99/month)
- Unlimited leads
- Unlimited properties
- Unlimited users
- Analytics and custom branding

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

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000                                    # Server port
MONGO_URI=mongodb://localhost:27017/realestate_crm  # MongoDB connection string
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production  # JWT secret key
NODE_ENV=development                         # Environment (development/production)
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api      # Backend API URL
```

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Use a production MongoDB instance
4. Set up proper CORS settings
5. Use HTTPS in production

### Security Considerations
- Change default JWT secret
- Use environment variables for sensitive data
- Implement rate limiting
- Use HTTPS in production
- Regular security updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with core CRM features
- Multi-tenant architecture
- Lead and property management
- Team management
- Subscription system

---

**Built with ❤️ using the MERN stack**
