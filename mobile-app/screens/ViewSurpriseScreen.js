import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import LottieView from 'lottie-react-native';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export default function ViewSurpriseScreen({ route, navigation }) {
  const { surpriseId } = route.params;
  const [surprise, setSurprise] = useState(null);
  const [currentRevelation, setCurrentRevelation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    loadSurprise();
  }, []);

  const loadSurprise = async () => {
    // TODO: Load surprise from API
    // For now, use mock data
    setSurprise({
      id: surpriseId,
      title: 'Birthday Surprise',
      occasion: 'Birthday',
      createdAt: '2024-01-15',
      password: '123456',
      revelations: [
        {
          id: 1,
          type: 'message',
          content: 'Happy Birthday! 🎉',
          order: 1,
        },
        {
          id: 2,
          type: 'image',
          content: 'https://example.com/birthday-image.jpg',
          order: 2,
        },
        {
          id: 3,
          type: 'video',
          content: 'https://example.com/birthday-video.mp4',
          order: 3,
        },
        {
          id: 4,
          type: 'message',
          content: 'Wishing you a wonderful year ahead! 🌟',
          order: 4,
        },
      ],
    });
  };

  const handlePasswordSubmit = () => {
    if (password === surprise?.password) {
      setIsUnlocked(true);
      setShowPassword(false);
    } else {
      Alert.alert('Error', 'Incorrect password');
    }
  };

  const nextRevelation = () => {
    if (currentRevelation < surprise.revelations.length - 1) {
      setCurrentRevelation(currentRevelation + 1);
    }
  };

  const previousRevelation = () => {
    if (currentRevelation > 0) {
      setCurrentRevelation(currentRevelation - 1);
    }
  };

  const shareSurprise = async () => {
    try {
      const message = `Check out this amazing surprise: ${surprise.title}`;
      await Sharing.shareAsync(message);
    } catch (error) {
      Alert.alert('Error', 'Failed to share surprise');
    }
  };

  const renderRevelation = (revelation) => {
    switch (revelation.type) {
      case 'message':
        return (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{revelation.content}</Text>
          </View>
        );
      case 'image':
        return (
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: revelation.content }}
              style={styles.mediaImage}
              resizeMode="contain"
            />
          </View>
        );
      case 'video':
        return (
          <View style={styles.mediaContainer}>
            <Video
              source={{ uri: revelation.content }}
              style={styles.mediaVideo}
              useNativeControls
              resizeMode="contain"
              isLooping
            />
          </View>
        );
      default:
        return null;
    }
  };

  if (!surprise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../assets/animations/loading.json')}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
          <Text style={styles.loadingText}>Loading surprise...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isUnlocked && surprise.password) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.passwordContainer}>
          <Ionicons name="lock-closed" size={80} color="#ff6b6b" />
          <Text style={styles.passwordTitle}>Surprise Locked</Text>
          <Text style={styles.passwordSubtitle}>
            Enter the password to unlock this surprise
          </Text>
          
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.unlockButton}
              onPress={handlePasswordSubmit}
            >
              <Ionicons name="unlock" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentRev = surprise.revelations[currentRevelation];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{surprise.title}</Text>
          <Text style={styles.headerSubtitle}>{surprise.occasion}</Text>
        </View>
        
        <TouchableOpacity onPress={shareSurprise} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentRevelation + 1) / surprise.revelations.length) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentRevelation + 1} of {surprise.revelations.length}
        </Text>
      </View>

      {/* Revelation Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.revelationContainer}>
          {renderRevelation(currentRev)}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentRevelation === 0 && styles.navButtonDisabled,
          ]}
          onPress={previousRevelation}
          disabled={currentRevelation === 0}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        <View style={styles.navDots}>
          {surprise.revelations.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentRevelation && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentRevelation === surprise.revelations.length - 1 &&
              styles.navButtonDisabled,
          ]}
          onPress={nextRevelation}
          disabled={currentRevelation === surprise.revelations.length - 1}
        >
          <Text style={styles.navButtonText}>Next</Text>
          <Ionicons name="chevron-forward" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingAnimation: {
    width: 100,
    height: 100,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  passwordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  passwordTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  passwordSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 300,
  },
  passwordInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  unlockButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  shareButton: {
    padding: 5,
  },
  progressContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff6b6b',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    minHeight: '100%',
  },
  revelationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  messageContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: width - 40,
  },
  messageText: {
    fontSize: 24,
    textAlign: 'center',
    color: '#333',
    lineHeight: 32,
  },
  mediaContainer: {
    width: '100%',
    alignItems: 'center',
  },
  mediaImage: {
    width: width - 40,
    height: 300,
    borderRadius: 15,
  },
  mediaVideo: {
    width: width - 40,
    height: 300,
    borderRadius: 15,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 5,
  },
  navDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#ff6b6b',
  },
});
