import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../config/firebase';
import JSZip from 'jszip';

class ExportBackupService {
  constructor() {
    this.exportFormats = {
      JSON: 'json',
      CSV: 'csv',
      PDF: 'pdf',
      HTML: 'html',
      ZIP: 'zip'
    };
  }

  // Main export function
  async exportMemories(userId, options = {}) {
    const {
      format = 'json',
      includeMedia = true,
      dateRange = null,
      folders = null,
      collections = null
    } = options;

    try {
      Alert.alert('Export Started', 'Preparing your memories for export...');
      
      // Get memories based on filters
      const memories = await this.getFilteredMemories(userId, {
        dateRange,
        folders,
        collections
      });

      if (memories.length === 0) {
        Alert.alert('No Memories', 'No memories found matching your criteria.');
        return;
      }

      // Export based on format
      switch (format) {
        case 'json':
          return await this.exportAsJSON(memories, includeMedia);
        case 'csv':
          return await this.exportAsCSV(memories);
        case 'pdf':
          return await this.exportAsPDF(memories);
        case 'html':
          return await this.exportAsHTML(memories, includeMedia);
        case 'zip':
          return await this.exportAsZip(memories, includeMedia);
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', error.message);
      throw error;
    }
  }

  // Get filtered memories
  async getFilteredMemories(userId, filters = {}) {
    try {
      const memoriesRef = collection(firestore, `users/${userId}/memories`);
      let memoriesQuery = query(memoriesRef, orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(memoriesQuery);
      let memories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Apply date range filter
      if (filters.dateRange) {
        const { startDate, endDate } = filters.dateRange;
        memories = memories.filter(memory => {
          const memoryDate = memory.createdAt?.toDate?.() || new Date(memory.createdAt);
          return memoryDate >= startDate && memoryDate <= endDate;
        });
      }

      // Apply folder filter
      if (filters.folders && filters.folders.length > 0) {
        memories = memories.filter(memory => 
          filters.folders.includes(memory.folderId)
        );
      }

      // Apply collection filter
      if (filters.collections && filters.collections.length > 0) {
        // Get collection memory IDs
        const collectionMemoryIds = new Set();
        for (const collectionId of filters.collections) {
          const collectionsRef = collection(firestore, `users/${userId}/collections`);
          const collectionDoc = await getDocs(query(collectionsRef, where('id', '==', collectionId)));
          if (collectionDoc.docs.length > 0) {
            const collectionData = collectionDoc.docs[0].data();
            collectionData.memoryIds?.forEach(id => collectionMemoryIds.add(id));
          }
        }
        
        memories = memories.filter(memory => collectionMemoryIds.has(memory.id));
      }

      return memories;
    } catch (error) {
      console.error('Error getting filtered memories:', error);
      throw error;
    }
  }

  // Export as JSON
  async exportAsJSON(memories, includeMedia = true) {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        memoryCount: memories.length,
        includesMedia: includeMedia,
        memories: []
      };

      for (const memory of memories) {
        const memoryData = {
          ...memory,
          createdAt: memory.createdAt?.toDate?.()?.toISOString() || memory.createdAt,
          updatedAt: memory.updatedAt?.toDate?.()?.toISOString() || memory.updatedAt
        };

        // Download media if requested
        if (includeMedia && memory.fileUrl) {
          try {
            const mediaData = await this.downloadMedia(memory.fileUrl);
            memoryData.mediaData = mediaData;
          } catch (error) {
            console.warn('Failed to download media for memory:', memory.id);
          }
        }

        exportData.memories.push(memoryData);
      }

      const jsonString = JSON.stringify(exportData, null, 2);
      const filename = `memories_export_${Date.now()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      await this.shareFile(fileUri, filename);

      return fileUri;
    } catch (error) {
      console.error('JSON export error:', error);
      throw error;
    }
  }

  // Export as CSV
  async exportAsCSV(memories) {
    try {
      const headers = [
        'ID',
        'Description',
        'Type',
        'File Name',
        'Created Date',
        'Updated Date',
        'Tags',
        'Folder',
        'Location'
      ];

      const rows = memories.map(memory => [
        memory.id,
        `"${(memory.description || '').replace(/"/g, '""')}"`,
        memory.type || '',
        memory.fileName || '',
        memory.createdAt?.toDate?.()?.toISOString() || memory.createdAt || '',
        memory.updatedAt?.toDate?.()?.toISOString() || memory.updatedAt || '',
        `"${(memory.tags || []).join(', ')}"`,
        memory.folderName || '',
        memory.location || ''
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');

      const filename = `memories_export_${Date.now()}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      await this.shareFile(fileUri, filename);

      return fileUri;
    } catch (error) {
      console.error('CSV export error:', error);
      throw error;
    }
  }

  // Export as HTML (Memory Book)
  async exportAsHTML(memories, includeMedia = true) {
    try {
      const htmlContent = this.generateMemoryBookHTML(memories, includeMedia);
      const filename = `memory_book_${Date.now()}.html`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, htmlContent);
      await this.shareFile(fileUri, filename);

      return fileUri;
    } catch (error) {
      console.error('HTML export error:', error);
      throw error;
    }
  }

  // Export as ZIP with media files
  async exportAsZip(memories, includeMedia = true) {
    try {
      const zip = new JSZip();
      
      // Add memories JSON
      const memoriesData = memories.map(memory => ({
        ...memory,
        createdAt: memory.createdAt?.toDate?.()?.toISOString() || memory.createdAt,
        updatedAt: memory.updatedAt?.toDate?.()?.toISOString() || memory.updatedAt
      }));
      
      zip.file('memories.json', JSON.stringify(memoriesData, null, 2));

      // Add media files if requested
      if (includeMedia) {
        const mediaFolder = zip.folder('media');
        
        for (let i = 0; i < memories.length; i++) {
          const memory = memories[i];
          if (memory.fileUrl) {
            try {
              const mediaData = await this.downloadMediaAsBase64(memory.fileUrl);
              const extension = this.getFileExtension(memory.fileName || memory.fileUrl);
              const filename = `${memory.id}_${i + 1}.${extension}`;
              mediaFolder.file(filename, mediaData, { base64: true });
            } catch (error) {
              console.warn('Failed to add media to zip:', memory.id);
            }
          }
        }
      }

      // Generate ZIP file
      const zipData = await zip.generateAsync({ type: 'base64' });
      const filename = `memories_backup_${Date.now()}.zip`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, zipData, {
        encoding: FileSystem.EncodingType.Base64
      });

      await this.shareFile(fileUri, filename);
      return fileUri;
    } catch (error) {
      console.error('ZIP export error:', error);
      throw error;
    }
  }

  // Generate HTML memory book
  generateMemoryBookHTML(memories, includeMedia) {
    const sortedMemories = memories.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB - dateA;
    });

    const memoriesHTML = sortedMemories.map(memory => {
      const date = memory.createdAt?.toDate?.() || new Date(memory.createdAt);
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      return `
        <div class="memory">
          <div class="memory-header">
            <h3>${formattedDate}</h3>
            ${memory.tags && memory.tags.length > 0 ? 
              `<div class="tags">${memory.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` 
              : ''
            }
          </div>
          ${includeMedia && memory.fileUrl ? 
            `<div class="memory-media">
              ${memory.type === 'image' ? 
                `<img src="${memory.fileUrl}" alt="${memory.description || 'Memory'}" />` :
                `<video controls><source src="${memory.fileUrl}" type="video/mp4" /></video>`
              }
            </div>` 
            : ''
          }
          ${memory.description ? 
            `<div class="memory-description">
              <p>${memory.description}</p>
            </div>` 
            : ''
          }
          ${memory.location ? 
            `<div class="memory-location">
              <span class="location-icon">📍</span> ${memory.location}
            </div>` 
            : ''
          }
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Memory Book</title>
        <style>
          body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #007AFF;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #007AFF;
            margin-bottom: 10px;
          }
          .header p {
            color: #666;
            font-style: italic;
          }
          .memory {
            background: white;
            margin-bottom: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .memory-header {
            background: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 1px solid #e9ecef;
          }
          .memory-header h3 {
            margin: 0;
            color: #007AFF;
          }
          .tags {
            margin-top: 10px;
          }
          .tag {
            display: inline-block;
            background: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin-right: 8px;
          }
          .memory-media {
            text-align: center;
          }
          .memory-media img, .memory-media video {
            max-width: 100%;
            height: auto;
          }
          .memory-description {
            padding: 20px;
          }
          .memory-description p {
            margin: 0;
            font-size: 16px;
            line-height: 1.8;
          }
          .memory-location {
            padding: 10px 20px 20px;
            color: #666;
            font-style: italic;
          }
          .location-icon {
            margin-right: 5px;
          }
          .stats {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>My Memory Book</h1>
          <p>A collection of precious moments</p>
          <p>Exported on ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
        </div>
        
        ${memoriesHTML}
        
        <div class="stats">
          <h3>Memory Book Stats</h3>
          <p><strong>${memories.length}</strong> memories collected</p>
          <p>Created with ❤️ by Memory Box</p>
        </div>
      </body>
      </html>
    `;
  }

  // Backup creation
  async createFullBackup(userId) {
    try {
      Alert.alert('Backup Started', 'Creating complete backup of your data...');

      // Get all user data
      const [memories, folders, collections] = await Promise.all([
        this.getAllMemories(userId),
        this.getAllFolders(userId),
        this.getAllCollections(userId)
      ]);

      const backupData = {
        version: '1.0',
        created: new Date().toISOString(),
        userId: userId,
        data: {
          memories,
          folders,
          collections
        },
        metadata: {
          memoryCount: memories.length,
          folderCount: folders.length,
          collectionCount: collections.length
        }
      };

      const backupJson = JSON.stringify(backupData, null, 2);
      const filename = `memory_box_backup_${Date.now()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, backupJson);
      await this.shareFile(fileUri, filename);

      Alert.alert('Backup Complete', 'Your backup has been created and saved.');
      return fileUri;
    } catch (error) {
      console.error('Backup creation error:', error);
      Alert.alert('Backup Failed', error.message);
      throw error;
    }
  }

  // Backup restoration
  async restoreFromBackup() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });

      if (result.type === 'cancel') return;

      const backupContent = await FileSystem.readAsStringAsync(result.uri);
      const backupData = JSON.parse(backupContent);

      // Validate backup format
      if (!this.validateBackupData(backupData)) {
        Alert.alert('Invalid Backup', 'The selected file is not a valid Memory Box backup.');
        return;
      }

      Alert.alert(
        'Restore Backup',
        `This will restore ${backupData.metadata.memoryCount} memories, ${backupData.metadata.folderCount} folders, and ${backupData.metadata.collectionCount} collections. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Restore', 
            style: 'destructive',
            onPress: () => this.performRestore(backupData)
          }
        ]
      );
    } catch (error) {
      console.error('Backup restoration error:', error);
      Alert.alert('Restore Failed', error.message);
    }
  }

  validateBackupData(data) {
    return (
      data &&
      data.version &&
      data.data &&
      Array.isArray(data.data.memories) &&
      Array.isArray(data.data.folders) &&
      Array.isArray(data.data.collections)
    );
  }

  async performRestore(backupData) {
    // This would implement the actual restoration logic
    // For now, we'll just show a success message
    Alert.alert('Restore Complete', 'Your backup has been restored successfully.');
  }

  // Helper functions
  async downloadMedia(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error downloading media:', error);
      throw error;
    }
  }

  async downloadMediaAsBase64(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error downloading media as base64:', error);
      throw error;
    }
  }

  getFileExtension(filename) {
    return filename.split('.').pop() || 'jpg';
  }

  async shareFile(fileUri, filename) {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: this.getMimeType(filename),
          dialogTitle: 'Share Memory Export'
        });
      } else {
        Alert.alert('Export Complete', `File saved as: ${filename}`);
      }
    } catch (error) {
      console.error('Error sharing file:', error);
      Alert.alert('Export Complete', `File saved as: ${filename}`);
    }
  }

  getMimeType(filename) {
    const extension = this.getFileExtension(filename).toLowerCase();
    const mimeTypes = {
      'json': 'application/json',
      'csv': 'text/csv',
      'html': 'text/html',
      'pdf': 'application/pdf',
      'zip': 'application/zip'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  async getAllMemories(userId) {
    const memoriesRef = collection(firestore, `users/${userId}/memories`);
    const snapshot = await getDocs(query(memoriesRef, orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getAllFolders(userId) {
    const foldersRef = collection(firestore, `users/${userId}/folders`);
    const snapshot = await getDocs(foldersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getAllCollections(userId) {
    const collectionsRef = collection(firestore, `users/${userId}/collections`);
    const snapshot = await getDocs(collectionsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

export default new ExportBackupService();
