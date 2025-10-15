# 🛒 Ecom.Api - E-commerce Backend API

ASP.NET Core 9 Web API với PostgreSQL, Supabase Auth, và Stripe Payments.

## 🚀 Features

- ✅ **Authentication**: Supabase Auth (Register, Login, Logout, Me)
- ✅ **Products**: CRUD operations với admin authorization
- ✅ **Cart**: Add/Update/Remove items, JSONB storage
- ✅ **Orders**: Create orders, payment integration
- ✅ **Payments**: Stripe Checkout + Webhook handling
- ✅ **Logging**: Serilog với structured logging
- ✅ **Validation**: FluentValidation
- ✅ **CORS**: Configurable policy
- ✅ **Rate Limiting**: IP-based throttling

## 📋 Prerequisites

- .NET 9 SDK
- PostgreSQL database
- Supabase account
- Stripe account

## 🔧 Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO/src/Ecom.Api
```

### 2. Configure Settings

Copy template and fill in your credentials:

```bash
cp appsettings.json.template appsettings.Development.json
```

Edit `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=ecom;Username=postgres;Password=your_password"
  },
  "SupabaseAuth": {
    "JwtIssuer": "https://YOUR_PROJECT_ID.supabase.co/auth/v1",
    "JwtAudience": "authenticated",
    "JwtSecret": "YOUR_JWT_SECRET"
  },
  "Supabase": {
    "Url": "https://YOUR_PROJECT_ID.supabase.co",
    "AnonKey": "YOUR_ANON_KEY"
  },
  "Stripe": {
    "SecretKey": "sk_test_...",
    "WebhookSecret": "whsec_...",
    "SuccessUrl": "http://localhost:3000/success",
    "CancelUrl": "http://localhost:3000/cancel"
  }
}
```

### 3. Run Migrations

```bash
dotnet ef database update
```

### 4. Run Application

```bash
dotnet run
```

API will be available at: `https://localhost:7188`

## 🌐 Deploy to Render

### 1. Create Render Account

Sign up at [render.com](https://render.com)

### 2. Create PostgreSQL Database

1. Dashboard → **New** → **PostgreSQL**
2. Name: `ecom-db`
3. Database: `ecom`
4. User: `ecom_user`
5. Region: Singapore (or closest to you)
6. Plan: **Free** (for development)
7. Click **Create Database**
8. Copy **Internal Database URL** (starts with `postgresql://`)

### 3. Create Web Service

1. Dashboard → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ecom-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `src/Ecom.Api` (if applicable)
   - **Runtime**: **.NET**
   - **Build Command**: `dotnet publish -c Release -o out`
   - **Start Command**: `cd out && dotnet Ecom.Api.dll`
   - **Plan**: **Free**

### 4. Add Environment Variables

In Render dashboard, add these environment variables:

```env
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:$PORT

# Database (use Internal Database URL from step 2)
ConnectionStrings__DefaultConnection=postgresql://ecom_user:password@host/ecom

# Supabase Auth
SupabaseAuth__JwtIssuer=https://YOUR_PROJECT_ID.supabase.co/auth/v1
SupabaseAuth__JwtAudience=authenticated
SupabaseAuth__JwtSecret=YOUR_JWT_SECRET

# Supabase
Supabase__Url=https://YOUR_PROJECT_ID.supabase.co
Supabase__AnonKey=YOUR_ANON_KEY

# Stripe
Stripe__SecretKey=sk_test_...
Stripe__WebhookSecret=whsec_...
Stripe__SuccessUrl=https://your-frontend.com/success
Stripe__CancelUrl=https://your-frontend.com/cancel

# CORS (your frontend URL)
FRONTEND_ORIGIN=https://your-frontend.com
```

### 5. Deploy

Click **Create Web Service** and wait for deployment to complete (~5 minutes).

Your API will be available at: `https://ecom-api.onrender.com`

### 6. Setup Stripe Webhook (Production)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Endpoint URL: `https://ecom-api.onrender.com/api/webhook`
4. Events: Select `checkout.session.completed` and `payment_intent.succeeded`
5. Copy **Signing secret** (starts with `whsec_`)
6. Update `Stripe__WebhookSecret` in Render environment variables
7. Click **Manual Deploy** → **Deploy latest commit**

## 📚 API Documentation

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Products

- `GET /api/v1/products` - List products (public)
- `GET /api/v1/products/{id}` - Get product (public)
- `POST /api/v1/products` - Create product (admin only)
- `PUT /api/v1/products/{id}` - Update product (admin only)
- `DELETE /api/v1/products/{id}` - Delete product (admin only)

### Cart

- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart/items` - Add item
- `PUT /api/v1/cart/items/{productId}` - Update quantity
- `DELETE /api/v1/cart/items/{productId}` - Remove item
- `DELETE /api/v1/cart` - Clear cart

### Orders

- `GET /api/v1/orders` - List user orders
- `GET /api/v1/orders/{id}` - Get order
- `POST /api/v1/orders` - Create order

### Payments

- `POST /api/v1/payments/create` - Create Stripe checkout session
- `POST /api/webhook` - Stripe webhook handler (internal)

### Health

- `GET /api/v1/health` - Health check

## 🧪 Testing

### Using HTTP Files

See [`auth-test.http`](auth-test.http) and [`Ecom.Api.http`](Ecom.Api.http) for example requests.

### Using curl

```bash
# Register
curl -X POST https://ecom-api.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","fullName":"Test User"}'

# Login
curl -X POST https://ecom-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'

# Get products
curl https://ecom-api.onrender.com/api/v1/products
```

## 📖 Documentation

See [`docs/`](docs/) folder for detailed documentation:

- [AUTH_API.md](docs/AUTH_API.md) - Authentication API reference
- [STRIPE_WEBHOOK_SETUP.md](docs/STRIPE_WEBHOOK_SETUP.md) - Stripe integration guide
- [PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) - Architecture overview

## 🔒 Security Notes

- **Never commit** `appsettings.Development.json` or `appsettings.Production.json`
- Use environment variables for secrets in production
- Rotate Stripe webhook secrets regularly
- Enable Supabase RLS (Row Level Security) for production

## 🐛 Troubleshooting

### Database Connection Failed

Check `ConnectionStrings__DefaultConnection` format:
```
Host=host;Port=5432;Database=db;Username=user;Password=pass;SSL Mode=Require
```

### Stripe Webhook 401

Verify `Stripe__WebhookSecret` matches the secret in Stripe Dashboard.

### CORS Errors

Ensure `FRONTEND_ORIGIN` is set to your frontend URL (without trailing slash).

## 📝 License

MIT

## 👤 Author

Your Name - [GitHub](https://github.com/YOUR_USERNAME)
