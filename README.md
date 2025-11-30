# 🎫 Ticketing App

A modern ticket management system built with Next.js 15, Tailwind CSS, and TanStack Query.

## ✨ Features

- **Next.js 15** - Latest version with App Router and React Server Components
- **Tailwind CSS** - Beautiful, responsive design with utility-first CSS
- **TanStack Query** - Powerful data fetching and state management
- **TypeScript** - Full type safety throughout the application
- **Auto-commit Script** - Automated git commits every 3 seconds

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd /Users/mac/development/ticketing-app
```

2. Install dependencies (already done):
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🤖 Auto-Commit Script

This project includes an auto-commit script that automatically commits changes every 3 seconds.

### Running the Auto-Commit Script

```bash
./auto-commit.sh
```

The script will:
- Monitor file changes every 3 seconds
- Automatically stage and commit changes
- Use commit messages in the format: `feat: updated (filename)`
- Display status messages with timestamps

### Stopping the Auto-Commit Script

Press `Ctrl+C` to stop the auto-commit script.

## 📁 Project Structure

```
ticketing-app/
├── app/
│   ├── layout.tsx          # Root layout with TanStack Query provider
│   ├── page.tsx            # Home page
│   ├── providers.tsx       # TanStack Query client provider
│   └── globals.css         # Global styles
├── public/                 # Static assets
├── auto-commit.sh          # Auto-commit script
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

## 🛠️ Technology Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Package Manager**: npm

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `./auto-commit.sh` - Run auto-commit script

## 🎨 Customization

### Modifying the Home Page

Edit `app/page.tsx` to customize the home page content and layout.

### Adding New Pages

Create new files in the `app/` directory to add new routes.

### Styling

This project uses Tailwind CSS. Modify `tailwind.config.ts` for custom theme configuration.

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🚢 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📄 License

This project is open source and available under the MIT License.
