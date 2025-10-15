# 🛍️ E-commerce Clothing Store - Frontend

A modern, responsive e-commerce application built with React, TypeScript, Vite, and Tailwind CSS.

## ✨ Features

- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 🔐 **Authentication**: Secure login/register with Supabase
- 🛒 **Shopping Cart**: Full-featured cart with quantity management
- 📦 **Product Management**: Browse, filter, and search products
- 📱 **Responsive Design**: Works perfectly on all devices
- 🔒 **Protected Routes**: Secure pages requiring authentication
- 👨‍💼 **Admin Dashboard**: Admin-only features and statistics
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development

## 🚀 Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **Routing**: React Router DOM 7
- **State Management**: React Query (TanStack Query)
- **Authentication**: Supabase Auth
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── api/              # API client and endpoints
│   ├── client.ts     # Axios instance with interceptors
│   ├── products.ts   # Product API
│   ├── cart.ts       # Cart API
│   └── orders.ts     # Orders API
├── components/       # Reusable components
│   ├── common/       # Common UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Loading.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── products/     # Product-related components
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   ├── ProductDetail.tsx
│   │   └── ProductFilter.tsx
│   ├── cart/         # Cart components
│   └── orders/       # Order components
├── contexts/         # React contexts
│   └── AuthContext.tsx
├── hooks/            # Custom hooks
│   └── useAuth.ts
├── lib/              # Library configurations
│   └── supabase.ts
├── pages/            # Page components
│   ├── HomePage.tsx
│   ├── ProductsPage.tsx
│   ├── ProductDetailPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── CartPage.tsx
│   ├── OrdersPage.tsx
│   └── admin/
│       └── AdminDashboard.tsx
├── routes/           # Routing configuration
│   ├── AppRouter.tsx
│   └── ProtectedRoute.tsx
├── types/            # TypeScript type definitions
│   └── index.ts
├── App.tsx           # Main App component
└── main.tsx          # Entry point
```

## 🔐 Authentication

The app uses Supabase for authentication. Protected routes require users to be logged in:

- `/cart` - Shopping cart (requires login)
- `/orders` - Order history (requires login)
- `/admin` - Admin dashboard (requires admin role)

## 🎨 Available Pages

- **Home** (`/`) - Landing page with features
- **Products** (`/products`) - Browse all products with filters
- **Product Detail** (`/products/:id`) - View single product details
- **Login** (`/login`) - User login page
- **Register** (`/register`) - User registration page
- **Cart** (`/cart`) - Shopping cart (protected)
- **Orders** (`/orders`) - Order history (protected)
- **Admin Dashboard** (`/admin`) - Admin panel (protected, admin only)

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. **Create API endpoint** in `src/api/`
2. **Define types** in `src/types/index.ts`
3. **Create components** in appropriate folder
4. **Add page** in `src/pages/`
5. **Update router** in `src/routes/AppRouter.tsx`

## 🚢 Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting service (Vercel, Netlify, etc.)

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_API_BASE_URL` | Backend API URL | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created as part of PRN232 course project - FPT University

---

Built with ❤️ using React + TypeScript + Vite

      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
