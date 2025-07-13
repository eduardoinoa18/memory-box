// Demo Data Service for Memory Box Production App
// Provides realistic demo data when Firebase is not configured
import AsyncStorage from '@react-native-async-storage/async-storage';

class DemoDataService {
  constructor() {
    this.demoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Initialize demo data if in demo mode
      if (this.demoMode) {
        await this.setupDemoData();
      }
      this.initialized = true;
      console.log('Demo Data Service initialized');
    } catch (error) {
      console.error('Error initializing demo data:', error);
    }
  }

  async setupDemoData() {
    // Setup demo user
    const demoUser = {
      uid: 'demo-user-123',
      name: 'Demo User',
      email: 'demo@memorybox.app',
      photoURL: null,
      plan: 'premium',
      createdAt: new Date().toISOString(),
      permissions: {
        canUploadMemories: true,
        canCreateFolders: true,
        canManageFamily: true,
        canExportData: true
      }
    };

    // Setup demo folders
    const demoFolders = [
      {
        id: 'folder-1',
        name: 'Family Vacations',
        description: 'Our amazing family trips and adventures',
        createdAt: '2024-01-15T10:00:00Z',
        memoryCount: 24,
        isShared: true,
        color: '#FF6B6B',
        coverImage: null
      },
      {
        id: 'folder-2',
        name: 'Childhood Memories',
        description: 'Precious moments from when the kids were little',
        createdAt: '2024-02-20T14:30:00Z',
        memoryCount: 18,
        isShared: false,
        color: '#4ECDC4',
        coverImage: null
      },
      {
        id: 'folder-3',
        name: 'Special Occasions',
        description: 'Birthdays, holidays, and celebrations',
        createdAt: '2024-03-10T16:45:00Z',
        memoryCount: 32,
        isShared: true,
        color: '#45B7D1',
        coverImage: null
      },
      {
        id: 'folder-4',
        name: 'Grandparents Stories',
        description: 'Legacy stories and wisdom from grandma and grandpa',
        createdAt: '2024-04-05T11:20:00Z',
        memoryCount: 12,
        isShared: true,
        color: '#96CEB4',
        coverImage: null
      }
    ];

    // Setup demo memories
    const demoMemories = [
      {
        id: 'memory-1',
        folderId: 'folder-1',
        title: 'Beach Day Fun',
        description: 'Amazing day at the beach with the whole family',
        type: 'photo',
        fileName: 'beach_day_2024.jpg',
        tags: ['family', 'beach', 'summer', 'vacation'],
        createdAt: '2024-06-15T12:00:00Z',
        location: 'Santa Monica Beach, CA',
        aiDescription: 'A beautiful family photo at the beach with kids playing in the sand and waves'
      },
      {
        id: 'memory-2',
        folderId: 'folder-2',
        title: 'First Day of School',
        description: 'Emma\'s first day of kindergarten',
        type: 'photo',
        fileName: 'first_day_school.jpg',
        tags: ['school', 'milestone', 'Emma', 'education'],
        createdAt: '2024-09-01T08:00:00Z',
        location: 'Lincoln Elementary School',
        aiDescription: 'A proud moment capturing Emma with her backpack and bright smile'
      },
      {
        id: 'memory-3',
        folderId: 'folder-3',
        title: 'Mom\'s 40th Birthday',
        description: 'Surprise party for mom\'s milestone birthday',
        type: 'video',
        fileName: 'mom_birthday_surprise.mp4',
        tags: ['birthday', 'celebration', 'surprise', 'family'],
        createdAt: '2024-07-22T19:30:00Z',
        location: 'Our Home',
        aiDescription: 'A heartwarming surprise party video with family and friends celebrating'
      },
      {
        id: 'memory-4',
        folderId: 'folder-4',
        title: 'Grandpa\'s War Stories',
        description: 'Grandpa sharing stories from his time in the Navy',
        type: 'audio',
        fileName: 'grandpa_navy_stories.m4a',
        tags: ['family history', 'stories', 'legacy', 'Navy', 'war'],
        createdAt: '2024-05-30T15:45:00Z',
        location: 'Grandpa\'s Living Room',
        aiDescription: 'Precious recordings of family history and military service stories'
      }
    ];

    // Setup demo AI letters
    const demoLetters = [
      {
        id: 'letter-1',
        title: 'Letter to Future Emma',
        content: 'Dear Future Emma,\n\nAs I write this, you are just starting kindergarten, and I can already see the amazing person you\'re becoming. Your curiosity about the world, your kindness to others, and your infectious laugh bring so much joy to our family...',
        recipient: 'Emma',
        occasion: 'Starting School',
        createdAt: '2024-09-01T20:00:00Z',
        memoryId: 'memory-2'
      },
      {
        id: 'letter-2',
        title: 'Family Legacy Letter',
        content: 'To My Beloved Family,\n\nI wanted to capture this moment in time when we are all together, healthy, and happy. These memories we\'re creating today will become the treasures of tomorrow...',
        recipient: 'Entire Family',
        occasion: 'Family Reunion',
        createdAt: '2024-06-15T21:30:00Z',
        memoryId: 'memory-1'
      }
    ];

    // Store demo data
    await AsyncStorage.setItem('demo_user', JSON.stringify(demoUser));
    await AsyncStorage.setItem('demo_folders', JSON.stringify(demoFolders));
    await AsyncStorage.setItem('demo_memories', JSON.stringify(demoMemories));
    await AsyncStorage.setItem('demo_letters', JSON.stringify(demoLetters));

    console.log('Demo data setup complete');
  }

  // Demo Authentication
  async signInDemo() {
    const demoUser = await AsyncStorage.getItem('demo_user');
    return demoUser ? JSON.parse(demoUser) : null;
  }

  // Demo Data Retrieval
  async getDemoFolders() {
    const folders = await AsyncStorage.getItem('demo_folders');
    return folders ? JSON.parse(folders) : [];
  }

  async getDemoMemories(folderId = null) {
    const memories = await AsyncStorage.getItem('demo_memories');
    const allMemories = memories ? JSON.parse(memories) : [];
    
    if (folderId) {
      return allMemories.filter(memory => memory.folderId === folderId);
    }
    
    return allMemories;
  }

  async getDemoLetters() {
    const letters = await AsyncStorage.getItem('demo_letters');
    return letters ? JSON.parse(letters) : [];
  }

  // Demo Statistics
  async getDemoStats() {
    const folders = await this.getDemoFolders();
    const memories = await this.getDemoMemories();
    const letters = await this.getDemoLetters();

    return {
      totalMemories: memories.length,
      totalFolders: folders.length,
      totalLetters: letters.length,
      storageUsed: '2.4 GB',
      storageTotal: '50 GB',
      recentActivity: memories.slice(0, 5),
      planDistribution: {
        free: 25,
        premium: 45,
        family: 30
      }
    };
  }

  // Demo Subscription Data
  getDemoSubscription() {
    return {
      plan: 'premium',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      customerId: 'demo_customer_123',
      subscriptionId: 'demo_sub_123'
    };
  }

  // Check if in demo mode
  isDemoMode() {
    return this.demoMode;
  }

  // Reset demo data
  async resetDemoData() {
    await AsyncStorage.removeItem('demo_user');
    await AsyncStorage.removeItem('demo_folders');
    await AsyncStorage.removeItem('demo_memories');
    await AsyncStorage.removeItem('demo_letters');
    await this.setupDemoData();
    console.log('Demo data reset complete');
  }
}

export default new DemoDataService();
