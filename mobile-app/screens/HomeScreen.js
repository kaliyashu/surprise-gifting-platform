import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [recentSurprises, setRecentSurprises] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    checkAuthStatus();
    // Load recent surprises
    loadRecentSurprises();
  }, []);

  const checkAuthStatus = async () => {
    // TODO: Check if user is logged in
    // For now, set to null
    setUser(null);
  };

  const loadRecentSurprises = async () => {
    // TODO: Load recent surprises from API
    // For now, use mock data
    setRecentSurprises([
      {
        id: 1,
        title: 'Birthday Surprise',
        occasion: 'Birthday',
        createdAt: '2024-01-15',
      },
      {
        id: 2,
        title: 'Anniversary Special',
        occasion: 'Anniversary',
        createdAt: '2024-01-10',
      },
    ]);
  };

  const handleCreateSurprise = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to create surprises',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    navigation.navigate('CreateSurprise');
  };

  const handleViewSurprise = (surpriseId) => {
    navigation.navigate('ViewSurprise', { surpriseId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Surprise Moments</Text>
          <Text style={styles.subtitle}>Create magical moments</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LottieView
            source={require('../assets/animations/celebration.json')}
            autoPlay
            loop
            style={styles.heroAnimation}
          />
          <Text style={styles.heroText}>
            Turn special occasions into unforgettable experiences
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCreateSurprise}
          >
            <Ionicons name="add-circle" size={32} color="#ff6b6b" />
            <Text style={styles.actionText}>Create Surprise</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="person-circle" size={32} color="#4ecdc4" />
            <Text style={styles.actionText}>
              {user ? 'My Profile' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Surprises */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Surprises</Text>
          {recentSurprises.map((surprise) => (
            <TouchableOpacity
              key={surprise.id}
              style={styles.surpriseCard}
              onPress={() => handleViewSurprise(surprise.id)}
            >
              <View style={styles.surpriseInfo}>
                <Text style={styles.surpriseTitle}>{surprise.title}</Text>
                <Text style={styles.surpriseOccasion}>{surprise.occasion}</Text>
                <Text style={styles.surpriseDate}>{surprise.createdAt}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Ionicons name="videocam" size={24} color="#ff6b6b" />
              <Text style={styles.featureText}>Video Animations</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="sparkles" size={24} color="#4ecdc4" />
              <Text style={styles.featureText}>Interactive Effects</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="lock-closed" size={24} color="#45b7d1" />
              <Text style={styles.featureText}>Password Protection</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="share-social" size={24} color="#feca57" />
              <Text style={styles.featureText}>Easy Sharing</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heroAnimation: {
    width: 200,
    height: 200,
  },
  heroText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    marginTop: 10,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 120,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  recentSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  surpriseCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.84,
    elevation: 3,
  },
  surpriseInfo: {
    flex: 1,
  },
  surpriseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  surpriseOccasion: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  surpriseDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  featuresSection: {
    marginBottom: 30,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.84,
    elevation: 3,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
});
