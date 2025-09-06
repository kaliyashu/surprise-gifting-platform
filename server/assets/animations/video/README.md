# Video Animations Directory

This directory contains video animation files that can be used in surprises.

## File Structure
```
video/
├── birthday/
│   ├── celebration.mp4
│   ├── balloons.mp4
│   └── confetti.mp4
├── love/
│   ├── hearts.mp4
│   ├── roses.mp4
│   └── romantic.mp4
├── graduation/
│   ├── cap-throw.mp4
│   └── diploma.mp4
└── custom/
    └── your-custom-video.mp4
```

## Supported Formats
- MP4 (H.264)
- WebM
- MOV
- AVI

## File Naming Convention
- Use lowercase with hyphens: `birthday-celebration.mp4`
- Include category prefix: `birthday-`, `love-`, `graduation-`
- Keep names descriptive but short

## Adding New Videos
1. Place video file in appropriate category folder
2. Update `animations.json` in parent directory
3. No code changes required - system auto-detects new files

## File Size Limits
- Maximum: 50MB per video
- Recommended: 10-20MB for optimal loading
- Resolution: 720p or 1080p recommended
