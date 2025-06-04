# Knova - Prediction Markets Mini-App

A decentralized prediction markets platform built as a World Mini-App, allowing verified humans to create and participate in prediction markets using World ID authentication.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- World ID app credentials

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/jcruzfff/world-knova.git
   cd world-knova
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   # Update .env with your configuration
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Access the app**
   - Local: http://localhost:3000
   - With ngrok: https://your-ngrok-url.ngrok-free.app

## 📱 World Mini-App Integration

This app is designed to run within the World App ecosystem:

- **World ID Verification**: Users authenticate using World ID
- **MiniKit Commands**: Native integration with World App features
- **Mobile-First**: Optimized for mobile World App experience

## 🗄️ Database Management

Access Prisma Studio for database management:

```bash
npx prisma studio
# Opens at http://localhost:5555
```

## 📦 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (protected)/       # Protected routes
│   └── api/               # API endpoints
├── components/            # React components
│   ├── Markets/          # Market-related components
│   ├── ProfileCompletion/ # User onboarding
│   └── ...               # Other UI components
└── lib/                  # Utilities and configurations
```

## 🔧 Development

- **Task Management**: Uses Task Master AI for project planning
- **Linting**: ESLint with TypeScript support
- **Styling**: Tailwind CSS with mobile-first approach
- **Type Safety**: Full TypeScript coverage

## 📄 License

This project is licensed under the MIT License.

---

_Built with ❤️ for the World ecosystem_
