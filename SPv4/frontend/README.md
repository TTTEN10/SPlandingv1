# SafePsy Landing Frontend

A simple, privacy-first landing page for SafePsy built with React, TypeScript, and Tailwind CSS.

## Features

- **Privacy-First Design**: No tracking by default, optional Plausible Analytics
- **Responsive**: Mobile-first design that works on all devices
- **Accessible**: Built with accessibility best practices
- **Fast**: Optimized for performance with Vite
- **Modern**: Uses React 18, TypeScript, and modern CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Environment Variables

- `VITE_PLAUSIBLE_DOMAIN` - Domain for Plausible Analytics (optional)

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Vitest** - Testing
- **ESLint** - Linting
- **Prettier** - Code formatting

## Project Structure

```
src/
├── components/          # React components
│   ├── __tests__/      # Component tests
│   ├── EmailSignup.tsx # Email signup form
│   ├── Footer.tsx      # Footer component
│   ├── Hero.tsx        # Hero section
│   └── PlausibleAnalytics.tsx # Analytics component
├── test/               # Test setup
├── App.tsx            # Main app component
├── index.css          # Global styles
└── main.tsx           # App entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run tests and linting
6. Submit a pull request

## License

Private - SafePsy
