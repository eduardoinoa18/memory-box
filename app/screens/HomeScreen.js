// HomeScreen.js - Main memory viewing screen (MVP)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@memory-box/shared';

const { width } = Dimensions.get('window');

export default function HomeScreen({ user }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemories();
  }, [user]);

  const loadMemories = async () => {
    try {
      const memoriesQuery = query(
        collection(db, 'memories'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(memoriesQuery);
      const memoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMemories(memoriesData);
    } catch (error) {
      console.error('Error loading memories:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>Loading memories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Memories</Text>
        <Text style={styles.headerSubtitle}>MVP Version - {memories.length} memories</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {memories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No memories yet</Text>
            <Text style={styles.emptyText}>
              Use the Upload tab to add your first memory!
            </Text>
          </View>
        ) : (
          <View style={styles.memoriesGrid}>
            {memories.map((memory) => (
              <TouchableOpacity key={memory.id} style={styles.memoryCard}>
                {memory.mediaUrl && (
                  <View style={styles.mediaContainer}>
                    {memory.mediaType === 'image' ? (
                      <Image source={{ uri: memory.mediaUrl }} style={styles.memoryMedia} />
                    ) : (
                      <View style={styles.mediaPlaceholder}>
                        <Text style={styles.mediaIcon}>
                          {memory.mediaType === 'video' ? '🎥' : memory.mediaType === 'audio' ? '🎵' : '📄'}
                        </Text>
                        <Text style={styles.mediaType}>
                          {memory.mediaType?.toUpperCase() || 'FILE'}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                <View style={styles.memoryInfo}>
                  <Text style={styles.memoryTitle}>{memory.title || 'Untitled Memory'}</Text>
                  {memory.description && (
                    <Text style={styles.memoryDescription} numberOfLines={2}>
                      {memory.description}
                    </Text>
                  )}
                  {memory.tags && memory.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {memory.tags.slice(0, 2).map((tag, index) => (
                        <Text key={index} style={styles.tag}>#{tag}</Text>
                      ))}
                      {memory.tags.length > 2 && (
                        <Text style={styles.tagMore}>+{memory.tags.length - 2}</Text>
                      )}
                    </View>
                  )}
                  <Text style={styles.memoryDate}>
                    {memory.memoryDate ? new Date(memory.memoryDate).toLocaleDateString() : 
                     memory.createdAt ? new Date(memory.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
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
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  memoriesGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  memoryCard: {
    width: (width - 48) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mediaContainer: {
    width: '100%',
    height: 120,
  },
  memoryMedia: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  mediaPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  mediaType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  memoryInfo: {
    padding: 12,
  },
  memoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  memoryDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  tag: {
    fontSize: 10,
    color: '#3B82F6',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 2,
  },
  tagMore: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  memoryDate: {
    fontSize: 12,
    color: '#6B7280',
  },
});
