# Ball Shooter Game

A browser-based arcade game where you shoot balls to break tiles. Similar to brick breaker games but with a unique twist - collect more balls and strategically clear the board before tiles reach the bottom!

## How to Play

1. Click anywhere on the screen to shoot balls in that direction
2. Balls will bounce off walls and hit tiles
3. Each tile has a number indicating how many hits it needs to break
4. Black circular tiles are power-ups that give you extra balls
5. Use the "2x Speed" button to speed up ball movement
6. Clear tiles before they reach the bottom of the screen

## Features

- Progressive difficulty system with increasing levels
- Physics-based ball movement and collision detection
- Power-up system with collectable extra balls
- Speed control for faster gameplay
- Aim assist with dotted line preview
- Responsive canvas-based rendering

## Technical Details

Built using vanilla JavaScript and HTML5 Canvas, the game features:
- Object-oriented design with a main `Game` class
- Collision detection system for balls and tiles
- Dynamic difficulty scaling
- Persistent game state management
- Responsive controls

## Design

The game features a minimalist, modern design with:
- Clean black and white color scheme
- Space Mono font for a modern, technical feel
- Pixel-perfect box shadows for depth
- Responsive layout that centers in the viewport
- Non-selectable UI elements for better gameplay
- Hover effects on interactive elements
- Sleek game-over overlay with stats

## Getting Started

1. Clone this repository
2. Open `index.html` in a web browser
3. Click to aim and shoot!

## Files

- `index.html` - Main game page and structure
- `game.js` - Core game logic and mechanics
- `styles.css` - Game styling and layout using modern CSS features

## Browser Compatibility

Works in modern browsers that support HTML5 Canvas:
- Chrome
- Firefox
- Safari
- Edge

## Dependencies

- Google Fonts (Space Mono)
- No other external dependencies required
