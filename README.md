# 💰 Expense Tracker

A modern, high-performance expense tracking application built with **Next.js 16**, **PostgreSQL**, **Prisma**, and **Better Auth**. Effortlessly track your expenses, manage categories, and visualize your financial habits with beautiful interactive charts.

## ✨ Features

- 🔐 **Modern Authentication**: Secure sign-up/sign-in powered by **Better Auth** with email & password support.
- 💰 **Expense Management**: Full CRUD operations for expenses with descriptions, amounts, and dates.
- 📊 **Dynamic Categorization**: Organize spending with custom categories and color-coded labels.
- 📈 **Rich Visualizations**: Gain insights through interactive charts and graphs using **Recharts**.
- 🚀 **Next.js 16 App Router**: Leverages the latest React features for a lightning-fast user experience.
- 📱 **Premium UI**: Responsive and polished design built with **Tailwind CSS** and **Radix UI** components.
- 🛠️ **Full Type Safety**: End-to-end type safety with **TypeScript** and **Zod** validation.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/)

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.x or later
- **PostgreSQL**: A running instance (Local, Docker, or Cloud like Supabase/Neon)
- **Package Manager**: npm (recommended)

### Installation

1. **Clone & Navigate**:
   ```bash
   git clone <repository-url>
   cd ExpenseTracker
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://postgres:password@localhost:5432/expense_tracker?schema=public"

   # Better Auth
   NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
   # Generate a secret: openssl rand -base64 32
   BETTER_AUTH_SECRET="your-secret-key-here"
   ```

4. **Database Initialization**:
   ```bash
   # Generate Prisma Client
   npm run prisma:generate

   # Push schema to database
   npm run prisma:push
   ```

5. **Start Developing**:
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) to see it in action!

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run prisma:generate` - Regenerate Prisma Client
- `npm run prisma:push` - Sync schema changes to database
- `npm run prisma:studio` - Open Prisma visual database editor

## 📂 Project Structure

```text
├── app/                  # Next.js App Router (Pages & API)
│   ├── api/auth/         # Better Auth integration
│   ├── api/expenses/     # Expense operations
│   ├── dashboard/        # Main application dashboard
│   └── providers.tsx     # Context & Query providers
├── components/           # React components
│   └── ui/               # Reusable Radix/Tailwind components
├── lib/                  # Shared utilities and auth config
├── prisma/               # Database schema & migrations
└── public/               # Static assets
```

## 🤝 Contributing

Contributions make the open-source community an amazing place!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git checkout origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License.
