# E-commerce Backend API

A Node.js + Express + MongoDB backend for the e-commerce application.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start MongoDB:**
   - Local: `mongod`
   - Or use MongoDB Atlas connection string

4. **Run the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product
- `GET /api/products/slug/:slug` - Get product by slug
- `POST /api/products` - Create product (admin)
- `PATCH /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/:id` - Get category
- `POST /api/categories` - Create category (admin)
- `PATCH /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Brands
- `GET /api/brands` - List brands
- `GET /api/brands/:id` - Get brand
- `POST /api/brands` - Create brand (admin)
- `PATCH /api/brands/:id` - Update brand (admin)
- `DELETE /api/brands/:id` - Delete brand (admin)

### Orders
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders` - List all orders (admin)
- `GET /api/orders/:id` - Get order
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update status (admin)
- `PATCH /api/orders/:id/payment` - Update payment status

### Sliders
- `GET /api/sliders` - List sliders
- `POST /api/sliders` - Create slider (admin)
- `PATCH /api/sliders/:id` - Update slider (admin)
- `DELETE /api/sliders/:id` - Delete slider (admin)

### Blog
- `GET /api/blog` - List posts
- `GET /api/blog/slug/:slug` - Get post by slug
- `POST /api/blog` - Create post (admin)
- `PATCH /api/blog/:id` - Update post (admin)
- `DELETE /api/blog/:id` - Delete post (admin)

### Addresses
- `GET /api/addresses` - List user's addresses
- `POST /api/addresses` - Create address
- `PATCH /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist
- `GET /api/wishlist/check/:productId` - Check if in wishlist

### Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `DELETE /api/upload/:filename` - Delete file (admin)

### Paystack
- `POST /api/paystack/initialize` - Initialize payment
- `GET /api/paystack/verify/:reference` - Verify payment
- `POST /api/paystack/webhook` - Webhook handler

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Token expiration (e.g., "7d") |
| `PORT` | Server port (default: 5000) |
| `PAYSTACK_SECRET_KEY` | Paystack secret key |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `UPLOAD_PATH` | File upload directory |
| `MAX_FILE_SIZE` | Max upload size in bytes |

## Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start src/server.js --name ecommerce-api
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
```

## Notes

- First registered user automatically becomes admin
- All admin routes require JWT token with admin role
- Uploaded files are stored in `/uploads` directory
- Paystack webhook needs to be configured in dashboard
