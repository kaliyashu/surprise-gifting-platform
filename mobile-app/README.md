# 📱 Surprise Moments Mobile App

A React Native mobile application for creating and sharing magical surprise moments.

## 🚀 Features

- **Create Surprises**: Build interactive surprises with messages, images, and videos
- **Templates**: Choose from various pre-designed templates
- **Password Protection**: Secure your surprises with passwords
- **Social Sharing**: Share surprises with friends and family
- **User Profiles**: Manage your account and view statistics
- **Cross-Platform**: Works on both iOS and Android

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## 🛠️ Installation

1. **Install Expo CLI globally:**
   ```bash
   npm install -g @expo/cli
   ```

2. **Install dependencies:**
   ```bash
   cd mobile-app
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## 📱 Running the App

### Development Mode
```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web
```

### Production Build
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Publish to Expo
expo publish
```

## 🏗️ Project Structure

```
mobile-app/
├── App.js                 # Main app component
├── index.js              # Entry point
├── screens/              # Screen components
│   ├── HomeScreen.js     # Home screen
│   ├── LoginScreen.js    # Login screen
│   ├── RegisterScreen.js # Registration screen
│   ├── CreateSurpriseScreen.js # Create surprise screen
│   ├── ViewSurpriseScreen.js   # View surprise screen
│   └── ProfileScreen.js  # User profile screen
├── components/           # Reusable components
├── assets/              # Images, animations, etc.
├── utils/               # Utility functions
└── config/              # Configuration files
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the mobile-app directory:

```env
EXPO_PUBLIC_API_URL=https://your-api.railway.app/api
EXPO_PUBLIC_ENVIRONMENT=development
```

### API Configuration
Update the API endpoints in the screens to match your backend:

```javascript
// Example API call
const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
});
```

## 📦 Dependencies

### Core Dependencies
- `expo`: Expo framework
- `react-native`: React Native framework
- `@react-navigation/native`: Navigation library
- `@react-navigation/stack`: Stack navigator
- `react-native-safe-area-context`: Safe area handling
- `@expo/vector-icons`: Icon library

### Media & Animation
- `expo-av`: Audio/Video playback
- `expo-image-picker`: Image selection
- `expo-document-picker`: Document selection
- `lottie-react-native`: Lottie animations
- `react-native-reanimated`: Advanced animations

### Utilities
- `axios`: HTTP client
- `expo-sharing`: Share functionality
- `expo-file-system`: File system operations

## 🚀 Deployment

### Expo Application Services (EAS)

1. **Install EAS CLI:**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure EAS:**
   ```bash
   eas build:configure
   ```

4. **Build for production:**
   ```bash
   # iOS
   eas build --platform ios
   
   # Android
   eas build --platform android
   
   # Both platforms
   eas build --platform all
   ```

5. **Submit to app stores:**
   ```bash
   # iOS App Store
   eas submit --platform ios
   
   # Google Play Store
   eas submit --platform android
   ```

### Manual Build

1. **Eject from Expo (if needed):**
   ```bash
   expo eject
   ```

2. **Build for iOS:**
   ```bash
   cd ios
   pod install
   cd ..
   npx react-native run-ios --configuration Release
   ```

3. **Build for Android:**
   ```bash
   cd android
   ./gradlew assembleRelease
   cd ..
   ```

## 📱 App Store Deployment

### iOS App Store
1. Create an Apple Developer account
2. Configure certificates and provisioning profiles
3. Build and archive the app using Xcode
4. Submit to App Store Connect

### Google Play Store
1. Create a Google Play Console account
2. Generate a signed APK or AAB
3. Upload to Google Play Console
4. Submit for review

## 🔒 Security Features

- **Password Protection**: Secure surprises with passwords
- **Data Encryption**: Sensitive data is encrypted
- **Secure API Calls**: HTTPS communication
- **Input Validation**: Client-side validation
- **Error Handling**: Graceful error handling

## 🎨 UI/UX Features

- **Modern Design**: Clean and intuitive interface
- **Responsive Layout**: Works on different screen sizes
- **Smooth Animations**: Lottie animations and transitions
- **Dark Mode Support**: Automatic theme switching
- **Accessibility**: Screen reader support

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues:**
   ```bash
   npx react-native start --reset-cache
   ```

2. **iOS build issues:**
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

3. **Android build issues:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

### Debug Mode
```bash
# Enable debug mode
npm start -- --dev-client

# Open React Native Debugger
npx react-native log-ios
npx react-native log-android
```

## 📞 Support

For support and questions:
- Check the [Expo documentation](https://docs.expo.dev/)
- Visit the [React Native documentation](https://reactnative.dev/)
- Create an issue in the project repository

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Happy coding! 🎉**
