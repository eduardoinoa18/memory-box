/**
 * Memory Box Complete Integration Example
 * Demonstrates how to use all Firebase services together
 */

import React, { useState, useEffect } from 'react';
import { 
  AuthService, 
  UserService, 
  MemoryService, 
  AdvancedMemoryService,
  FolderService, 
  FamilyService,
  StorageService,
  NotificationService,
  AnalyticsService,
  CloudFunctionsService 
} from '../services/firebaseService';

const MemoryBoxApp = () => {
  const [user, setUser] = useState(null);
  const [memories, setMemories] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize app and set up auth listener
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Get full user data from Firestore
        const userData = await UserService.getUser(firebaseUser.uid);
        setUser(userData);
        
        // Load user's data
        await loadUserData(firebaseUser.uid);
        
        // Track user login
        await AnalyticsService.trackUserAction(firebaseUser.uid, 'login');
      } else {
        setUser(null);
        setMemories([]);
        setFolders([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    try {
      // Load folders
      const userFolders = await FolderService.getUserFolders(userId);
      setFolders(userFolders);

      // Load recent memories
      const userMemories = await MemoryService.getUserMemories(userId);
      setMemories(userMemories);

      // Set up real-time listeners
      const unsubscribeMemories = MemoryService.subscribeToUserMemories(
        userId, 
        (updatedMemories) => setMemories(updatedMemories)
      );

      return () => {
        unsubscribeMemories();
      };
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Sign up new user
  const handleSignUp = async (email, password, displayName) => {
    try {
      const newUser = await AuthService.signUp(email, password, displayName);
      
      // Create default folder
      await FolderService.createFolder({
        userId: newUser.uid,
        name: 'My First Memories',
        description: 'Welcome to Memory Box!',
        color: '#667eea',
        icon: '📸',
        sharedWith: []
      });

      // Send welcome notification
      await NotificationService.sendNotification(newUser.uid, {
        title: 'Welcome to Memory Box! 🎉',
        body: 'Start preserving your precious memories today.',
        type: 'general'
      });

      console.log('User created successfully:', newUser.uid);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  // Upload memory with file
  const handleMemoryUpload = async (file, memoryData) => {
    try {
      if (!user) throw new Error('User not authenticated');

      setLoading(true);

      // Upload memory with progress tracking
      const memoryId = await AdvancedMemoryService.uploadMemoryWithFile(
        user.uid,
        file,
        {
          title: memoryData.title,
          description: memoryData.description,
          type: detectFileType(file),
          folderId: memoryData.folderId,
          tags: memoryData.tags || [],
          sharedWith: memoryData.sharedWith || [],
          metadata: {
            fileSize: file.size,
            capturedAt: new Date()
          }
        },
        (progress) => {
          console.log(`Upload progress: ${progress}%`);
        }
      );

      // Track analytics
      await AnalyticsService.trackUserAction(user.uid, 'memory_created', {
        memoryId,
        type: detectFileType(file),
        fileSize: file.size
      });

      console.log('Memory uploaded successfully:', memoryId);
      setLoading(false);

    } catch (error) {
      console.error('Memory upload error:', error);
      setLoading(false);
      throw error;
    }
  };

  // Bulk upload memories
  const handleBulkUpload = async (files) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const fileData = files.map(file => ({
        file,
        memoryData: {
          title: file.name.split('.')[0],
          type: detectFileType(file),
          tags: ['bulk-upload'],
          sharedWith: []
        }
      }));

      const memoryIds = await AdvancedMemoryService.bulkUploadMemories(
        user.uid,
        fileData,
        (completed, total) => {
          console.log(`Bulk upload progress: ${completed}/${total}`);
        }
      );

      console.log('Bulk upload completed:', memoryIds);
    } catch (error) {
      console.error('Bulk upload error:', error);
      throw error;
    }
  };

  // Create and join family
  const handleCreateFamily = async (familyName, description) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const familyId = await FamilyService.createFamily({
        name: familyName,
        description,
        ownerId: user.uid
      });

      console.log('Family created:', familyId);
      return familyId;
    } catch (error) {
      console.error('Create family error:', error);
      throw error;
    }
  };

  // Share memory with family
  const handleShareWithFamily = async (memoryId, familyId) => {
    try {
      await FamilyService.shareMemoryWithFamily(memoryId, familyId);
      
      // Track sharing action
      await AnalyticsService.trackUserAction(user.uid, 'memory_shared', {
        memoryId,
        familyId,
        shareType: 'family'
      });

      console.log('Memory shared with family');
    } catch (error) {
      console.error('Share memory error:', error);
      throw error;
    }
  };

  // Search memories with AI
  const handleAISearch = async (searchQuery) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Use cloud function for AI-powered search
      const result = await CloudFunctionsService.searchMemoriesAI({
        data: {
          query: searchQuery,
          userId: user.uid,
          filters: {}
        }
      });

      console.log('AI search results:', result.data.memories);
      return result.data.memories;
    } catch (error) {
      console.error('AI search error:', error);
      throw error;
    }
  };

  // Create Stripe subscription
  const handleUpgradeToPremium = async () => {
    try {
      if (!user) throw new Error('User not authenticated');

      const result = await CloudFunctionsService.createStripeCheckout({
        data: {
          priceId: 'price_premium_monthly', // Your Stripe price ID
          successUrl: 'https://memorybox.app/success',
          cancelUrl: 'https://memorybox.app/cancel'
        }
      });

      // Redirect to Stripe checkout
      window.location.href = result.data.url;
    } catch (error) {
      console.error('Stripe checkout error:', error);
      throw error;
    }
  };

  // Initiate Prizeout reward
  const handlePrizeoutReward = async (amount, brand) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const result = await CloudFunctionsService.initiatePrizeout({
        data: { amount, brand }
      });

      console.log('Prizeout initiated:', result.data);
      return result.data;
    } catch (error) {
      console.error('Prizeout error:', error);
      throw error;
    }
  };

  // Export user data
  const handleExportData = async () => {
    try {
      if (!user) throw new Error('User not authenticated');

      const result = await CloudFunctionsService.exportUserData({});
      
      // Download the export
      window.open(result.data.downloadUrl, '_blank');
    } catch (error) {
      console.error('Export data error:', error);
      throw error;
    }
  };

  // Helper function to detect file type
  const detectFileType = (file) => {
    const type = file.type;
    if (type.startsWith('image/')) return 'photo';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  if (loading) {
    return <div>Loading Memory Box...</div>;
  }

  if (!user) {
    return (
      <div>
        <h1>Welcome to Memory Box</h1>
        <button onClick={() => handleSignUp('user@example.com', 'password', 'New User')}>
          Sign Up
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome back, {user.displayName}!</h1>
      
      <div>
        <h2>Your Memories ({memories.length})</h2>
        <button onClick={() => handleMemoryUpload(/* file */, /* data */)}>
          Upload Memory
        </button>
        <button onClick={() => handleBulkUpload(/* files */)}>
          Bulk Upload
        </button>
      </div>

      <div>
        <h2>Your Folders ({folders.length})</h2>
        {folders.map(folder => (
          <div key={folder.id}>
            {folder.icon} {folder.name} ({folder.memoryCount} memories)
          </div>
        ))}
      </div>

      <div>
        <h2>Family Features</h2>
        <button onClick={() => handleCreateFamily('Smith Family', 'Our family memories')}>
          Create Family
        </button>
      </div>

      <div>
        <h2>Premium Features</h2>
        <button onClick={handleUpgradeToPremium}>
          Upgrade to Premium
        </button>
        <button onClick={() => handlePrizeoutReward(5, 'starbucks')}>
          Redeem Reward
        </button>
      </div>

      <div>
        <h2>Account</h2>
        <button onClick={handleExportData}>
          Export My Data
        </button>
        <button onClick={() => AuthService.signOut()}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default MemoryBoxApp;
