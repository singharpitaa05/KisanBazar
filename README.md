
# KisanBazar - Agricultural E-Commerce Platform
A comprehensive digital marketplace connecting farmers and buyers with seamless product discovery, secure transactions, and real-time communication.

[📖 Documentation](#-overview) | [🚀 Quick Start](#-installation) | [🎯 Features](#-features)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-latest-646CFF)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-brightgreen)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment-blue)](https://razorpay.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real%20Time-informational)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [How to Contribute](#how-to-contribute)
- [Screenshots](#-screenshots)
- [Author](#-author)
- [License](#-license)

## 🌟 Overview

**KisanBazar** is a modern agricultural e-commerce platform designed to bridge the gap between farmers and buyers. It provides a seamless marketplace experience with advanced product discovery, secure payment processing, real-time messaging, and comprehensive order management. Built with cutting-edge web technologies, KisanBazar empowers farmers to reach customers directly and enables buyers to access fresh agricultural products with confidence.

### 🎯 Key Highlights

- **Comprehensive Product Marketplace** with advanced search and filtering
- **Real-Time Chat System** using Socket.io for buyer-seller communication
- **Secure Payment Integration** with Razorpay payment gateway
- **Wishlist & Cart Management** for personalized shopping experience
- **Review & Rating System** for product transparency and trust
- **Order Management & Tracking** with real-time updates
- **Farmer Dashboard** for product management and sales analytics
- **Image Management** with Cloudinary integration
- **JWT-Based Secure Authentication** with role-based access
- **User Profile Management** and customization

## ✨ Features

### 🔐 Authentication & User Management

- JWT-based secure authentication with password encryption
- User registration and login with comprehensive validation
- Profile customization (username, bio, avatar)
- Role-based access control (Buyer/Farmer/Admin)
- Secure session management with token refresh
- OAuth integration with Google authentication (Passport.js)
- User preferences and account settings

### 🛍️ Product Management

#### For Buyers
- **Advanced Product Catalog**: Browse and search agricultural products
- **Filtering & Sorting**: Filter by category, price, ratings, and more
- **Product Details**: Comprehensive product information with images
- **Quick View**: Preview product details without navigation
- **Price Tracking**: Monitor product prices and availability
- **Stock Management**: Real-time inventory updates

#### For Farmers
- **Product Upload**: Add new products with images and descriptions
- **Inventory Management**: Update stock levels and product details
- **Sales Dashboard**: Track sales, revenue, and performance metrics
- **Product Analytics**: Analyze product performance and trends
- **Bulk Operations**: Manage multiple products efficiently
- **Product Images**: Upload and manage product images via Cloudinary

### 🛒 Shopping Features

- **Shopping Cart**: Add/remove products, adjust quantities
- **Wishlist Management**: Save favorite products for later
- **Cart Persistence**: Automatic cart saving across sessions
- **Quick Purchase**: Streamlined checkout process
- **Multiple Payment Options**: Razorpay integration for secure payments
- **Order Summary**: Detailed order review before checkout
- **Discount Management**: Promotional codes and offers (future feature)

### 💳 Payment & Orders

- **Secure Payments**: Razorpay integration for safe transactions
- **Order Management**: Create, track, and manage orders
- **Order History**: Complete order tracking and timeline
- **Order Status Updates**: Real-time order status notifications
- **Invoice Generation**: Automatic invoice creation for purchases
- **Order Cancellation**: Flexible order management options
- **Payment History**: Track all transactions and receipts

### 💬 Real-Time Communication

- **Live Chat System**: Real-time messaging between buyers and sellers
- **Chat History**: Persistent conversation history
- **Socket.io Integration**: Instant message delivery
- **Online Status**: See when users are online
- **Message Notifications**: Alerts for new messages
- **Chat Management**: Archive and manage conversations

### ⭐ Reviews & Ratings

- **Product Reviews**: Detailed reviews with ratings
- **Star Ratings**: 5-star rating system for products
- **Review Images**: Add images to your reviews
- **Review Management**: Edit or delete your reviews
- **Helpful Votes**: Mark reviews as helpful
- **Buyer Verification**: Show verified purchase badges
- **Review Moderation**: Admin tools to manage reviews

### 📊 Analytics & Dashboard

#### User Dashboard
- **Order Statistics**: View all past orders and status
- **Wishlist Overview**: Manage saved products
- **Account Activity**: Track user activity and preferences
- **Profile Analytics**: User engagement metrics

#### Farmer Dashboard
- **Sales Analytics**: Track revenue and sales trends
- **Product Performance**: Monitor product metrics
- **Customer Insights**: Understand buyer behavior
- **Income Reports**: Detailed financial reports
- **Top Products**: Identify best-selling items
- **Growth Metrics**: Track business growth

### 🖼️ Image Management

- **Cloudinary Integration**: Cloud-based image storage
- **Image Upload**: Easy product image uploads
- **Auto Optimization**: Automatic image compression
- **Multiple Formats**: Support for various image types
- **Responsive Images**: Auto-scaling for different devices

### 🎯 User Experience

- **Responsive Design**: Mobile-first responsive layout
- **Intuitive UI**: User-friendly interface with Tailwind CSS
- **Fast Loading**: Optimized performance with Vite
- **Error Handling**: Comprehensive error messages and validation
- **Loading States**: Smooth loading indicators
- **Toast Notifications**: Real-time user feedback

### 🔒 Security Features

- **Password Encryption**: Bcryptjs for secure passwords
- **JWT Tokens**: Secure token-based authentication
- **CORS Protection**: Cross-origin resource sharing control
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against brute force attacks
- **Secure Routes**: Protected endpoints with middleware

## ⚙️ Tech Stack

### Frontend

```
Framework: React 19.x 🛠️
Build Tool: Vite ⚙️
Styling: Tailwind CSS 🎨
Routing: React Router DOM 🗺️
HTTP Client: Axios 🌐
State Management: Zustand 📦
Icons: Lucide React 🌟
Real-Time: Socket.io Client 💬
```

### Backend

```
Runtime: Node.js 18+ 🟢
Framework: Express.js 5.x 🚀
Database: MongoDB + Mongoose 🗄️
Authentication: JWT + Passport.js 🔑
Payment Gateway: Razorpay 💳
Cloud Storage: Cloudinary ☁️
Real-Time: Socket.io 💬
File Upload: Multer 📁
Security: Bcryptjs, CORS, Express Validator 🔒
```

### DevOps & Deployment

```
Version Control: Git + GitHub 🧑‍💻
Frontend Hosting: Vercel 🌐
Backend Hosting: Render 🚀
Database: MongoDB Atlas 🗄️
Image Storage: Cloudinary ☁️
```

## 📁 Project Structure

```
KisanBazar/
├── backend/
│   ├── config/
│   │   ├── db.js                          # MongoDB connection
│   │   ├── cloudinary.js                  # Cloudinary configuration
│   │   ├── razorpay.js                    # Razorpay setup
│   │   ├── passport.js                    # Passport authentication
│   │   └── socket.js                      # Socket.io configuration
│   ├── controllers/
│   │   ├── authController.js              # Authentication logic
│   │   ├── productController.js           # Product management
│   │   ├── cartController.js              # Shopping cart operations
│   │   ├── orderController.js             # Order processing
│   │   ├── chatController.js              # Chat messaging
│   │   ├── reviewController.js            # Product reviews
│   │   ├── wishlistController.js          # Wishlist management
│   │   └── errorHandler.js                # Error handling middleware
│   ├── middleware/
│   │   ├── auth.js                        # JWT verification
│   │   ├── validation.js                  # Input validation
│   │   ├── upload.js                      # File upload handling
│   │   └── errorHandler.js                # Error handling
│   ├── models/
│   │   ├── User.js                        # User schema
│   │   ├── Product.js                     # Product schema
│   │   ├── Cart.js                        # Shopping cart schema
│   │   ├── Order.js                       # Order schema
│   │   ├── Review.js                      # Review schema
│   │   ├── Wishlist.js                    # Wishlist schema
│   │   ├── Conversation.js                # Chat schema
│   │   └── Token.js                       # Token schema
│   ├── routes/
│   │   ├── authRoutes.js                  # /api/auth/*
│   │   ├── productRoutes.js               # /api/products/*
│   │   ├── cartRoutes.js                  # /api/cart/*
│   │   ├── orderRoutes.js                 # /api/orders/*
│   │   ├── chatRoutes.js                  # /api/chat/*
│   │   ├── reviewRoutes.js                # /api/reviews/*
│   │   └── wishlistRoutes.js              # /api/wishlist/*
│   ├── services/
│   │   ├── authService.js                 # Authentication service
│   │   ├── productService.js              # Product operations
│   │   ├── cartService.js                 # Cart management
│   │   ├── orderService.js                # Order processing
│   │   ├── chatService.js                 # Chat operations
│   │   ├── reviewService.js               # Review operations
│   │   ├── wishlistService.js             # Wishlist operations
│   │   └── tokenService.js                # Token management
│   ├── utils/
│   │   └── constants.js                   # Application constants
│   ├── .env                               # Environment variables
│   ├── .env.example                       # Example environment file
│   ├── server.js                          # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/                            # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx         # Protected route wrapper
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx             # Reusable button component
│   │   │   │   ├── Input.jsx              # Reusable input component
│   │   │   │   ├── Loader.jsx             # Loading indicator
│   │   │   │   ├── ProductCard.jsx        # Product card display
│   │   │   │   ├── StarRating.jsx         # Star rating component
│   │   │   │   └── ImageUpload.jsx        # Image upload component
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx             # Navigation bar
│   │   │   │   └── Footer.jsx             # Footer component
│   │   │   └── reviews/
│   │   │       ├── ProductReviews.jsx     # Reviews display
│   │   │       └── WriteReviewModal.jsx   # Review creation modal
│   │   ├── pages/
│   │   │   ├── Home.jsx                   # Landing/home page
│   │   │   ├── Products.jsx               # Products listing page
│   │   │   ├── ProductDetail.jsx          # Single product details
│   │   │   ├── Cart.jsx                   # Shopping cart page
│   │   │   ├── Checkout.jsx               # Checkout page
│   │   │   ├── Orders.jsx                 # Order history page
│   │   │   ├── OrderDetails.jsx           # Single order details
│   │   │   ├── Wishlist.jsx               # Wishlist page
│   │   │   ├── Messages.jsx               # Chat/messaging page
│   │   │   ├── Dashboard.jsx              # User dashboard
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx              # Login page
│   │   │   │   ├── Register.jsx           # Registration page
│   │   │   │   └── GoogleCallback.jsx     # Google auth callback
│   │   │   └── farmer/
│   │   │       ├── AddProduct.jsx         # Add new product
│   │   │       └── MyProducts.jsx         # Farmer's product listing
│   │   ├── api/
│   │   │   ├── axios.js                   # Axios instance
│   │   │   ├── authApi.js                 # Authentication endpoints
│   │   │   ├── productApi.js              # Product endpoints
│   │   │   ├── cartApi.js                 # Cart endpoints
│   │   │   ├── orderApi.js                # Order endpoints
│   │   │   ├── chatApi.js                 # Chat endpoints
│   │   │   ├── reviewApi.js               # Review endpoints
│   │   │   └── wishlistApi.js             # Wishlist endpoints
│   │   ├── store/
│   │   │   ├── authStore.js               # Auth state management
│   │   │   ├── productStore.js            # Product state management
│   │   │   ├── cartStore.js               # Cart state management
│   │   │   ├── orderStore.js              # Order state management
│   │   │   ├── chatStore.js               # Chat state management
│   │   │   ├── reviewStore.js             # Review state management
│   │   │   └── wishlistStore.js           # Wishlist state management
│   │   ├── utils/
│   │   │   ├── constants.js               # App constants
│   │   │   └── socket.js                  # Socket.io setup
│   │   ├── App.jsx                        # Root component
│   │   ├── main.jsx                       # Entry point
│   │   └── index.css                      # Tailwind imports
│   ├── .env                               # Environment variables
│   ├── vite.config.js                     # Vite configuration
│   ├── eslint.config.js                   # ESLint configuration
│   ├── index.html                         # HTML template
│   └── package.json
│
├── .gitignore
├── README.md
└── LICENSE
```

## 🚀 Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB (Local or Atlas)
- Cloudinary Account (for image hosting)
- Razorpay Account (for payments)
- Git & GitHub
- Modern web browser

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/KisanBazar.git
cd KisanBazar
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kisanbazar

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# CORS
CLIENT_URL=http://localhost:5173
```

**Setup Cloudinary:**
1. Go to [Cloudinary Dashboard](https://cloudinary.com/)
2. Sign up or log in
3. Get your Cloud Name, API Key, and API Secret
4. Add to `.env`

**Setup Razorpay:**
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Create account and verify
3. Get your Key ID and Key Secret from API Settings
4. Add to `.env`

Start backend:

```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start frontend:

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 4. Access Application

Open your browser and navigate to: `http://localhost:5173`

## 🎮 Usage

### For Buyers

1. **Sign Up/Login**: Create an account or log in with credentials
2. **Browse Products**: Explore agricultural products in the marketplace
3. **Search & Filter**: Use filters to find specific products
4. **View Details**: Check product details, reviews, and seller info
5. **Add to Cart**: Add products to your shopping cart
6. **Wishlist**: Save products to your wishlist for later
7. **Checkout**: Proceed to secure payment via Razorpay
8. **Track Orders**: Monitor order status in real-time
9. **Message Seller**: Chat directly with farmers/sellers
10. **Leave Reviews**: Share your experience with a product

### For Farmers

1. **Sign Up**: Create a farmer account
2. **Dashboard**: Access your seller dashboard
3. **Add Products**: Upload agricultural products with images
4. **Manage Inventory**: Update stock and product details
5. **View Orders**: See incoming orders from buyers
6. **Analytics**: Track sales, revenue, and performance
7. **Communicate**: Message buyers directly via chat
8. **Manage Reviews**: Respond to customer reviews

## How to Contribute

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m "Add amazing feature"`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📸 Screenshots

### Landing Page & Product Catalog
![Homepage](./homepage.png)
![Product Listing](./products.png)

### Shopping Experience
![Product Details](./productdetail.png)
![Shopping Cart](./cart.png)
![Checkout](./checkout.png)

### User Dashboard & Orders
![User Dashboard](./dashboard.png)
![Order History](./orders.png)
![Order Details](./orderdetails.png)

### Farmer Features
![Farmer Dashboard](./farmer-dashboard.png)
![Add Product](./addproduct.png)
![My Products](./myproducts.png)

### Communication & Reviews
![Messages/Chat](./messages.png)
![Product Reviews](./reviews.png)

## 👤 Author

Designed and Developed with 💖 by **Your Name**

🔗 **Connect with me:**

- 📧 [Email](mailto:your.email@example.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/yourprofile/)
- 🐙 [GitHub](https://github.com/yourusername)

📬 Feel free to reach out for questions, suggestions, or collaboration!

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.