# Surprise Moments Platform

A web-based platform for creating and sharing personalized surprise experiences for special occasions like birthdays, anniversaries, and romantic milestones.

## 🎉 Features

### Creator Experience
- **Account Creation & Authentication** - Optional for free users, mandatory for advanced features
- **Surprise Builder Tool** - Add titles, occasions, upload content (text, images, songs, videos)
- **Template Selection** - Choose from occasion-specific templates and animations
- **Password Protection** - Optional security for your surprises
- **Unique Link Generation** - Easy sharing with custom URLs

### Viewer Experience
- **Secure Access Flow** - Password protection when enabled
- **Engaging Animations** - 4-5 second opening animations with smooth transitions
- **Interactive Reveals** - Click "Next Reveal" to progress through content
- **Interactive Effects** - Cursor/touch-triggered sparkles, trails, and highlights
- **Replay/Share Options** - View again or share with others

### Content Types
- Message + Song combinations
- Image + Song presentations
- Video + Animation sequences
- Mixed content sequences

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **TailwindCSS** - Utility-first CSS framework
- **GSAP** - Professional animations
- **Lottie** - Vector animations
- **Three.js** - 3D effects (optional)

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **Multer** - File uploads

### Infrastructure
- **Docker** - Containerization
- **Cloudflare** - CDN and security
- **AES-256** - Data encryption

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd surprise-moments-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database and API keys
   ```

4. **Set up the database**
   ```bash
   cd server
   npm run db:setup
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
surprise-moments-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Static assets
├── server/                # Node.js backend
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── middleware/        # Express middleware
│   ├── utils/             # Server utilities
│   └── uploads/           # File uploads
├── docs/                  # Documentation
└── docker/                # Docker configuration
```

## 🔒 Security Features

- **TLS/SSL** encryption for all data in transit
- **AES-256** encryption for stored sensitive data
- **OAuth 2.0** authentication for creators
- **JWT tokens** for session management
- **Password protection** for individual surprises
- **Anti-tampering** mechanisms with hashed URL tokens
- **Expirable links** for time-sensitive content

## 🎨 File-Based Animation System

The platform features a **file-based, enterprise-grade animation system** that allows adding new animations and templates without code changes:

### **📁 File Structure**
```
server/assets/
├── animations/
│   ├── video/           # Video animation files
│   │   ├── birthday/
│   │   ├── love/
│   │   └── graduation/
│   └── cursor/          # Cursor animation configs
│       ├── sparkle/
│       ├── trail/
│       └── particles/
└── templates/           # Template configurations
    ├── birthday/
    ├── love/
    └── graduation/
```

### **🚀 Adding New Content**
1. **Video Animations**: Place video files in `server/assets/animations/video/[category]/`
2. **Cursor Animations**: Add JSON configs in `server/assets/animations/cursor/[category]/`
3. **Templates**: Create JSON configs in `server/assets/templates/[category]/`
4. **No Code Changes**: System auto-detects and loads new files

### **✅ Supported Features**
- **Video Animations**: MP4, WebM, MOV, AVI formats
- **Cursor Effects**: Sparkles, trails, particles, custom animations
- **Templates**: Layouts, backgrounds, typography, animations
- **Real-time Updates**: File watcher in development mode
- **Enterprise Security**: File validation, size limits, type checking

## 📱 Cross-Device Compatibility

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Touch Optimization** - Gesture support for mobile devices
- **Progressive Web App** - Installable on mobile devices
- **Offline Support** - Basic functionality without internet

## 🚀 Production Deployment

### **Quick Deployment**
```bash
# Run production deployment script
./deploy.sh
```

### **Manual Deployment**
```bash
# Build and start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d --build
```

### **Enterprise Features**
- **SSL/HTTPS**: Automatic certificate management
- **Load Balancing**: Nginx reverse proxy
- **Security**: Enhanced headers, rate limiting, input sanitization
- **Monitoring**: Health checks, logging, analytics
- **Backup**: Automated database and file backups
- **Scaling**: Horizontal scaling with Docker Swarm/Kubernetes

### **Security Enhancements**
- **Rate Limiting**: Per-endpoint and per-user limits
- **Input Validation**: XSS protection, SQL injection prevention
- **File Upload Security**: Type checking, size limits, virus scanning
- **Authentication**: JWT tokens, password hashing, session management
- **CORS**: Configurable cross-origin policies
- **Headers**: Security headers, CSP, HSTS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@surprisemoments.com or create an issue in the repository.

---

**Made with ❤️ for creating magical moments**
