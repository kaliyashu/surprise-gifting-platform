import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export default function CreateSurpriseScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [occasion, setOccasion] = useState('');
  const [password, setPassword] = useState('');
  const [revelations, setRevelations] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const occasions = [
    'Birthday',
    'Anniversary',
    'Valentine\'s Day',
    'Graduation',
    'Wedding',
    'Christmas',
    'New Year',
    'Custom',
  ];

  const templates = [
    { id: 1, name: 'Classic Birthday', category: 'birthday' },
    { id: 2, name: 'Romantic Love', category: 'love' },
    { id: 3, name: 'Graduation Celebration', category: 'graduation' },
    { id: 4, name: 'Custom Template', category: 'custom' },
  ];

  const addRevelation = () => {
    const newRevelation = {
      id: Date.now(),
      type: 'message',
      content: '',
      order: revelations.length + 1,
    };
    setRevelations([...revelations, newRevelation]);
  };

  const updateRevelation = (id, field, value) => {
    setRevelations(
      revelations.map((rev) =>
        rev.id === id ? { ...rev, [field]: value } : rev
      )
    );
  };

  const removeRevelation = (id) => {
    setRevelations(revelations.filter((rev) => rev.id !== id));
  };

  const pickImage = async (revelationId) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      updateRevelation(revelationId, 'content', result.assets[0].uri);
      updateRevelation(revelationId, 'type', 'image');
    }
  };

  const pickVideo = async (revelationId) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'video/*',
    });

    if (result.type === 'success') {
      updateRevelation(revelationId, 'content', result.uri);
      updateRevelation(revelationId, 'type', 'video');
    }
  };

  const handleCreateSurprise = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your surprise');
      return;
    }

    if (revelations.length === 0) {
      Alert.alert('Error', 'Please add at least one revelation');
      return;
    }

    // TODO: Send to API
    Alert.alert(
      'Success',
      'Surprise created successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Surprise Title"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Occasion</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.occasionContainer}>
              {occasions.map((occ) => (
                <TouchableOpacity
                  key={occ}
                  style={[
                    styles.occasionButton,
                    occasion === occ && styles.occasionButtonActive,
                  ]}
                  onPress={() => setOccasion(occ)}
                >
                  <Text
                    style={[
                      styles.occasionText,
                      occasion === occ && styles.occasionTextActive,
                    ]}
                  >
                    {occ}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TextInput
            style={styles.input}
            placeholder="Password (optional)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Template Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Template</Text>
          <View style={styles.templateGrid}>
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateCard,
                  selectedTemplate?.id === template.id &&
                    styles.templateCardActive,
                ]}
                onPress={() => setSelectedTemplate(template)}
              >
                <Ionicons
                  name="color-palette"
                  size={32}
                  color={
                    selectedTemplate?.id === template.id
                      ? '#ff6b6b'
                      : '#ccc'
                  }
                />
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateCategory}>{template.category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Revelations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Revelations</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={addRevelation}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {revelations.map((revelation, index) => (
            <View key={revelation.id} style={styles.revelationCard}>
              <View style={styles.revelationHeader}>
                <Text style={styles.revelationNumber}>
                  Revelation {index + 1}
                </Text>
                <TouchableOpacity
                  onPress={() => removeRevelation(revelation.id)}
                >
                  <Ionicons name="trash" size={20} color="#ff6b6b" />
                </TouchableOpacity>
              </View>

              <View style={styles.revelationTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    revelation.type === 'message' && styles.typeButtonActive,
                  ]}
                  onPress={() =>
                    updateRevelation(revelation.id, 'type', 'message')
                  }
                >
                  <Ionicons name="chatbubble" size={16} color="#333" />
                  <Text style={styles.typeButtonText}>Message</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    revelation.type === 'image' && styles.typeButtonActive,
                  ]}
                  onPress={() => pickImage(revelation.id)}
                >
                  <Ionicons name="image" size={16} color="#333" />
                  <Text style={styles.typeButtonText}>Image</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    revelation.type === 'video' && styles.typeButtonActive,
                  ]}
                  onPress={() => pickVideo(revelation.id)}
                >
                  <Ionicons name="videocam" size={16} color="#333" />
                  <Text style={styles.typeButtonText}>Video</Text>
                </TouchableOpacity>
              </View>

              {revelation.type === 'message' && (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter your message..."
                  value={revelation.content}
                  onChangeText={(text) =>
                    updateRevelation(revelation.id, 'content', text)
                  }
                  multiline
                  numberOfLines={4}
                />
              )}

              {(revelation.type === 'image' || revelation.type === 'video') &&
                revelation.content && (
                  <View style={styles.mediaPreview}>
                    <Image
                      source={{ uri: revelation.content }}
                      style={styles.mediaThumbnail}
                    />
                    <Text style={styles.mediaType}>
                      {revelation.type === 'image' ? 'Image' : 'Video'} Selected
                    </Text>
                  </View>
                )}
            </View>
          ))}
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateSurprise}
        >
          <Text style={styles.createButtonText}>Create Surprise</Text>
        </TouchableOpacity>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  occasionContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  occasionButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  occasionButtonActive: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff6b6b',
  },
  occasionText: {
    color: '#333',
    fontSize: 14,
  },
  occasionTextActive: {
    color: '#fff',
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  templateCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  templateCardActive: {
    borderColor: '#ff6b6b',
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
  templateCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#ff6b6b',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revelationCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  revelationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  revelationNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  revelationTypeButtons: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  typeButtonActive: {
    backgroundColor: '#ff6b6b',
  },
  typeButtonText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#333',
  },
  mediaPreview: {
    alignItems: 'center',
    padding: 10,
  },
  mediaThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 5,
  },
  mediaType: {
    fontSize: 12,
    color: '#666',
  },
  createButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
