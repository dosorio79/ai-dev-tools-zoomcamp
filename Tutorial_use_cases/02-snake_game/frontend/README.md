# Cyber Snake 🐍

A modern Snake game with retro-futuristic neon aesthetics, built with React, TypeScript, and Vite.

## Features

- 🎮 **Two Game Modes**
  - Pass-Through Mode: Wrap around edges
  - Walls Mode: Hit the wall, game over
  
- 👤 **User System**
  - Sign up and login
  - Personalized username display
  
- 🏆 **Global Leaderboard**
  - View top scores across all modes
  - Filter by game mode
  - See your personal ranking
  
- 👀 **Live Game Watching**
  - Watch other players in real-time
  - Animated game simulation
  - Multiple active games

- ✨ **Modern Design**
  - Neon cyber aesthetic
  - Smooth animations
  - Responsive layout

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom design system
- **UI Components**: Shadcn/ui
- **Testing**: Vitest + React Testing Library
- **Routing**: React Router v6
- **State Management**: React Context + Hooks

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to project directory
cd cyber-snake

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Testing
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:watch   # Run tests in watch mode

# Build
npm run build        # Build for production
npm run preview      # Preview production build
```

## Project Structure

```
src/
├── api/              # Mock API layer (centralized backend calls)
│   └── mockApi.ts
├── components/       # Reusable components
│   ├── GameCanvas.tsx
│   ├── Header.tsx
│   └── ui/           # Shadcn UI components
├── contexts/         # React contexts
│   └── AuthContext.tsx
├── hooks/            # Custom React hooks
│   └── useSnakeGame.ts
├── pages/            # Page components
│   ├── Home.tsx
│   ├── Game.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Leaderboard.tsx
│   └── Watch.tsx
├── __tests__/        # Test files
│   ├── mockApi.test.ts
│   ├── useSnakeGame.test.ts
│   ├── GameCanvas.test.tsx
│   └── AuthContext.test.tsx
└── test/             # Test configuration
    └── setup.ts
```

## Game Controls

- **Movement**: WASD or Arrow Keys
- **Pause**: Spacebar
- **New Game**: Click "New Game" button

## Backend Integration

All backend interactions are mocked and centralized in `src/api/mockApi.ts`. This makes it easy to integrate with a real backend later:

1. Replace mock functions with real API calls
2. Add your backend URL configuration
3. Update authentication token handling
4. All components will work without modification

### Mock API Structure

```typescript
mockApi.auth.login(email, password)
mockApi.auth.signup(email, username, password)
mockApi.auth.logout()
mockApi.auth.getCurrentUser()

mockApi.leaderboard.getTopScores(mode?)
mockApi.leaderboard.getUserScore(userId)
mockApi.leaderboard.submitScore(score, mode)

mockApi.liveGames.getLiveGames()
mockApi.liveGames.getGameById(gameId)
```

## Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Mock API, game logic hook
- **Component Tests**: GameCanvas, Auth context
- **Integration Tests**: Full user flows

Run tests with:

```bash
npm run test        # Run all tests
npm run test:ui     # Interactive test UI
```

## Design System

The design system uses semantic tokens defined in `src/index.css` and `tailwind.config.ts`:

- **Colors**: Neon green primary, cyan secondary, purple accents
- **Typography**: Bold headings with neon glow effects
- **Shadows**: Custom neon glow and intense shadows
- **Animations**: Smooth transitions and hover effects

### Key Design Tokens

```css
--game-snake: Neon green for snake
--game-food: Purple for food
--game-grid: Dark grid background
--game-glow: Glow effect color
```

## Deployment

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

### Deploy to GitHub Pages

```bash
# Build the project
npm run build

# Deploy dist/ folder to your hosting service
```

## Future Enhancements

- [ ] Real backend integration with Supabase/Firebase
- [ ] Multiplayer mode
- [ ] Power-ups and special items
- [ ] Mobile touch controls
- [ ] More game modes
- [ ] Achievement system
- [ ] Social features (friend challenges)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
