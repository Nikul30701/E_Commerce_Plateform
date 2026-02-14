# 🛒 NextGen E-Commerce Platform

A feature-rich, full-stack E-Commerce application built with **Django REST Framework** and **React**. This platform offers a seamless shopping experience with secure authentication, real-time cart updates, comprehensive address management, and order tracking.

---

## ✨ Key Features

### 👤 User Authentication & Profile
- **JWT Authentication**: Secure login and signup using SimpleJWT (Access & Refresh tokens).
- **Profile Management**: Update personal info, phone number, and profile picture.
- **Secure Password**: Support for changing passwords within the app.

### 🛍️ Product Catalog
- **Dynamic Browsing**: Filter products by category and search by name.
- **Real-time Stock**: Automatic stock management that prevents overselling.
- **Detailed Views**: Comprehensive product information including pricing, discounts, and ratings.

### 🛒 Shopping Experience
- **Smart Cart**: Persistent shopping cart managed via Zustand.
- **Checkout Workflow**: Smooth multi-step checkout with address selection and order summary.
- **Tax Calculation**: Automated tax (10%) and shipping fee calculations.

### 📍 Address & Order Management
- **Address Book**: Add, edit, delete, and set default shipping addresses.
- **Order Tracking**: Visual status tracker (Pending → Processing → Shipped → Delivered).
- **Order History**: Full record of past orders with item details and status updates.
- **Order Cancellation**: Ability to cancel orders that are still pending/processing.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 5.2+ & Django REST Framework
- **Auth**: SimpleJWT (JSON Web Tokens)
- **Database**: PostgreSQL / SQLite
- **Image Handling**: Pillow (Media storage)
- **Filtering**: Django-filter

### Frontend
- **Framework**: React 19 (Vite)
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **API Client**: Axios (with centralized interceptors for token management)

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/Nikul30701/E_Commerce_Plateform.git
cd E_Commerce_Plateform

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create a superuser (for Admin Dashboard)
python manage.py createsuperuser

# Start the server
python manage.py runserver
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd Fronend_ECOM

# Install dependencies
npm install

# Start development server
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 📁 Project Structure

```text
E-Commerce_Platform/
├── Backend/              # Django App (Models, Views, Serializers)
├── Ecommerce/            # Django Project Settings
├── Fronend_ECOM/         # React Frontend
│   ├── src/
│   │   ├── components/   # Reusable UI elements
│   │   ├── pages/        # Main route components (Home, Cart, Orders, etc.)
│   │   ├── services/     # API configuration (axios)
│   │   └── store/        # Zustand state stores
├── media/                # Uploaded product and profile images
└── manage.py             # Django entry point
```

---

## 🛡️ API Endpoints

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/login/` | POST | User login & token generation |
| **Auth** | `/api/register/` | POST | New user registration |
| **Products**| `/api/products/` | GET | List all products with filters |
| **Cart** | `/api/cart/` | GET | View current user's cart |
| **Orders** | `/api/checkout/` | POST | Place a new order |
| **Orders** | `/api/orders/` | GET | View order history |
| **Address** | `/api/addresses/` | GET/POST | Manage shipping addresses |

---

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.

---
**Developed with ❤️ by Nikul**
