# Cursor Animations Directory

This directory contains cursor and touch-follow animation configurations.

## File Structure
```
cursor/
├── sparkle/
│   ├── sparkle.json
│   ├── glitter.json
│   └── stars.json
├── trail/
│   ├── rainbow-trail.json
│   ├── fire-trail.json
│   └── magic-trail.json
├── particles/
│   ├── hearts.json
│   ├── bubbles.json
│   └── confetti.json
└── custom/
    └── your-custom-cursor.json
```

## Animation Types
- **Sparkle**: Quick sparkle effects on click/touch
- **Trail**: Following cursor/touch movement
- **Particles**: Floating particles around cursor
- **Custom**: User-defined animations

## JSON Configuration Format
```json
{
  "name": "sparkle-effect",
  "type": "sparkle",
  "category": "sparkle",
  "config": {
    "particles": 10,
    "colors": ["#ff6b6b", "#4ecdc4", "#45b7d1"],
    "size": [3, 8],
    "duration": 1000,
    "spread": 50,
    "gravity": 0.5
  },
  "triggers": ["click", "touch"],
  "enabled": true
}
```

## Adding New Cursor Animations
1. Create JSON configuration file
2. Place in appropriate category folder
3. System auto-loads on startup
4. No code changes required

## Supported Triggers
- `click`: Mouse click events
- `touch`: Touch events on mobile
- `hover`: Mouse hover events
- `move`: Cursor movement events
