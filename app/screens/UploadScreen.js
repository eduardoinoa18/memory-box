// UploadScreen.js - Enhanced upload with media types, descriptions, and tagging (MVP)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '@memory-box/shared';

export default function UploadScreen({ user }) {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mediaType, setMediaType] = useState('photo'); // photo, video, audio

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedMedia({...result.assets[0], type: 'photo'});
      setMediaType('photo');
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedMedia({...result.assets[0], type: 'video'});
      setMediaType('video');
    }
  };

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSelectedMedia({...result.assets[0], type: 'audio'});
        setMediaType('audio');
      }
    } catch (error) {
      console.error('Audio picker error:', error);
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedMedia({...result.assets[0], type: 'photo'});
      setMediaType('photo');
    }
  };

  const uploadMemory = async () => {
    if (!selectedMedia) {
      Alert.alert('Error', 'Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      // Upload file to Firebase Storage
      const response = await fetch(selectedMedia.uri);
      const blob = await response.blob();
      
      const fileExtension = selectedMedia.uri.split('.').pop() || 'jpg';
      const filename = `memories/${user.uid}/${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Process tags (convert comma-separated string to array)
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      // Save memory metadata to Firestore
      await addDoc(collection(db, 'memories'), {
        title: title || 'Untitled Memory',
        description: description || '',
        mediaUrl: downloadURL,
        mediaType: mediaType,
        tags: tagsArray,
        date: new Date(date),
        userId: user.uid,
        createdAt: new Date(),
        fileName: selectedMedia.name || `memory.${fileExtension}`,
        fileSize: selectedMedia.size || 0
      });

      Alert.alert('Success', 'Memory uploaded successfully!');
      
      // Reset form
      setSelectedMedia(null);
      setTitle('');
      setDescription('');
      setTags('');
      setDate(new Date().toISOString().split('T')[0]);
      setMediaType('photo');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload memory');
    }
    setUploading(false);
  };

  const renderMediaPreview = () => {
    if (!selectedMedia) {
      return (
        <View style={styles.placeholderMedia}>
          <Text style={styles.placeholderText}>No media selected</Text>
          <Text style={styles.placeholderSubtext}>Choose photos, videos, or audio files</Text>
        </View>
      );
    }

    if (selectedMedia.type === 'photo') {
      return <Image source={{ uri: selectedMedia.uri }} style={styles.selectedMedia} />;
    }

    if (selectedMedia.type === 'video') {
      return (
        <View style={styles.selectedMedia}>
          <Text style={styles.mediaTypeLabel}>🎥 Video Selected</Text>
          <Text style={styles.fileName}>{selectedMedia.name || 'video.mp4'}</Text>
        </View>
      );
    }

    if (selectedMedia.type === 'audio') {
      return (
        <View style={styles.selectedMedia}>
          <Text style={styles.mediaTypeLabel}>🎵 Audio Selected</Text>
          <Text style={styles.fileName}>{selectedMedia.name || 'audio.mp3'}</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Memory</Text>
        <Text style={styles.headerSubtitle}>Add photos, videos, or audio to your collection</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Media Preview Section */}
        <View style={styles.mediaSection}>
          {renderMediaPreview()}
        </View>

        {/* Media Type Buttons */}
        <View style={styles.mediaTypeSection}>
          <Text style={styles.sectionLabel}>Choose Media Type</Text>
          <View style={styles.buttonGrid}>
            <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
              <Text style={styles.buttonText}>📷 Photos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mediaButton} onPress={pickVideo}>
              <Text style={styles.buttonText}>🎥 Videos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mediaButton} onPress={pickAudio}>
              <Text style={styles.buttonText}>🎵 Audio</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
              <Text style={styles.buttonText}>📸 Camera</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Memory Details Form */}
        {selectedMedia && (
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Memory Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Give your memory a title"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe this memory..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tags (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="family, vacation, birthday (comma separated)"
                value={tags}
                onChangeText={setTags}
              />
            </View>
            
            <TouchableOpacity
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={uploadMemory}
              disabled={uploading}
            >
              <Text style={styles.uploadButtonText}>
                {uploading ? 'Uploading...' : '✨ Save Memory'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  mediaSection: {
    marginBottom: 20,
  },
  selectedMedia: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  placeholderMedia: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  mediaTypeLabel: {
    fontSize: 24,
    marginBottom: 8,
  },
  fileName: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  mediaTypeSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    minWidth: '45%',
    height: 48,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  formSection: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  uploadButton: {
    height: 48,
    backgroundColor: '#10B981',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
