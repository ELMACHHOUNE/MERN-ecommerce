# Keni Sweet Flowers 🌸

A beautiful, floral-themed e-commerce platform for "Keni Sweet Flowers", a floral cupcake business in Kenitra. Built with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS.

## Repository

- GitHub: https://github.com/ELMACHHOUNE/buy-brisk-boutique

## Features ✨

- **Floral UI Design**: Custom "Petal" shapes, soft gradients, and a `blush-pop` color palette.
- **Multi-language Support**: Full localization in English, French, and Arabic (`i18n`).
- **Performance Optimized**: Lazy loading for pages and images to ensure fast load times.
- **Wishlist**: Save your favorite floral arrangements locally.
- **WhatsApp Checkout**: Seamless ordering process via WhatsApp integration.
- **Admin Dashboard**: Manage products, categories, and users.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.

## Tech Stack 🛠️

### Frontend

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **State Management**: React Context API (Cart, Wishlist, Auth)
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router DOM (with Lazy Loading)
- **Internationalization**: react-i18next
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer

## Project Structure 📂

- `/src` — Frontend application source code
  - `/pages` — Lazy-loaded route components
  - `/components` — Reusable UI components
  - `/context` — Global state providers
  - `/lib` — Utilities and API configuration
  - `/locales` — Translation files (EN, FR, AR)
- `/server` — Express API backend
- `/public` — Static assets

## Prerequisites

- Node.js 18+ and npm
- MongoDB connection string

## Setup & Installation 🚀

1. **Clone the repository**

   ```sh
   git clone https://github.com/ELMACHHOUNE/buy-brisk-boutique.git
   cd buy-brisk-boutique
   ```

2. **Install Frontend Dependencies**

   ```sh
   npm install
   ```

3. **Install Backend Dependencies**

   ```sh
   cd server
   npm install
   ```

4. **Environment Configuration**

   Create a `.env` file in the root directory:

   ```env
   VITE_API_URL=http://localhost:5000
   ```

   Create a `.env` file in the `server` directory:

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CORS_ORIGIN=http://localhost:8080
   ```

## Running the Application ▶️

**Frontend** (from root):

```sh
npm run dev
```

**Backend** (from `/server`):

```sh
npm run dev
```

## Contributing 🤝

1. Fork the repository.
2. Create a feature branch.
3. Commit with clear messages.
4. Open a Pull Request.

## License 📄

All rights reserved.

---

_Developed by ELMACHHOUNE_
