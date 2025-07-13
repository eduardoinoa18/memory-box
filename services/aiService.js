import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

class AIService {
    // Generate personalized letter using OpenAI
    async generateLetter(answers, userContext = {}) {
        try {
            const generateLetter = httpsCallable(functions, 'generatePersonalizedLetter');

            const result = await generateLetter({
                answers,
                userContext: {
                    name: userContext.displayName || 'Friend',
                    email: userContext.email,
                    plan: userContext.plan || 'free',
                    recentMemories: userContext.recentMemories || []
                }
            });

            return {
                success: true,
                letter: result.data.letter,
                metadata: result.data.metadata
            };
        } catch (error) {
            console.error('Error generating letter:', error);
            return {
                success: false,
                error: error.message,
                fallbackLetter: this.generateFallbackLetter(answers, userContext)
            };
        }
    }

    // Analyze memory content for tagging and insights
    async analyzeMemoryContent(memoryData) {
        try {
            const analyzeMemory = httpsCallable(functions, 'analyzeMemoryContent');

            const result = await analyzeMemory({
                fileUrl: memoryData.fileUrl,
                fileName: memoryData.fileName,
                description: memoryData.description,
                type: memoryData.type
            });

            return {
                success: true,
                analysis: result.data.analysis
            };
        } catch (error) {
            console.error('Error analyzing memory:', error);
            return {
                success: false,
                error: error.message,
                fallbackAnalysis: this.generateFallbackAnalysis(memoryData)
            };
        }
    }

    // Generate AI-powered memory suggestions
    async getMemorySuggestions(userId, context = {}) {
        try {
            const getSuggestions = httpsCallable(functions, 'getAIMemorySuggestions');

            const result = await getSuggestions({
                userId,
                context: {
                    recentActivity: context.recentActivity || [],
                    timeOfYear: new Date().getMonth(),
                    userPreferences: context.preferences || {},
                    familyMembers: context.familyMembers || []
                }
            });

            return {
                success: true,
                suggestions: result.data.suggestions
            };
        } catch (error) {
            console.error('Error getting suggestions:', error);
            return {
                success: false,
                error: error.message,
                fallbackSuggestions: this.generateFallbackSuggestions()
            };
        }
    }

    // Generate memory insights and statistics
    async getMemoryInsights(memories, userId) {
        try {
            const getInsights = httpsCallable(functions, 'generateMemoryInsights');

            const result = await getInsights({
                userId,
                memoryCount: memories.length,
                memoryTypes: this.categorizeMemoryTypes(memories),
                timeRange: this.getMemoryTimeRange(memories)
            });

            return {
                success: true,
                insights: result.data.insights
            };
        } catch (error) {
            console.error('Error generating insights:', error);
            return {
                success: false,
                error: error.message,
                fallbackInsights: this.generateFallbackInsights(memories)
            };
        }
    }

    // Search memories with AI assistance
    async smartSearch(query, memories, filters = {}) {
        try {
            const smartSearch = httpsCallable(functions, 'aiSmartSearch');

            const result = await smartSearch({
                query,
                totalMemories: memories.length,
                filters,
                searchType: this.detectSearchType(query)
            });

            return {
                success: true,
                results: result.data.results,
                suggestions: result.data.suggestions
            };
        } catch (error) {
            console.error('Error in smart search:', error);
            return {
                success: false,
                error: error.message,
                fallbackResults: this.performBasicSearch(query, memories)
            };
        }
    }

    // === FALLBACK METHODS (when AI service unavailable) === //

    generateFallbackLetter(answers, userContext) {
        const { recipient, timeframe, mood, topics, personal } = answers;
        const userName = userContext.displayName || 'Friend';

        let letter = `Dear ${recipient || 'Future Self'},\\n\\n`;

        // Add mood-based opening
        if (mood?.includes('Grateful')) {
            letter += `As I write this letter, my heart is filled with gratitude. `;
        } else if (mood?.includes('Hopeful')) {
            letter += `I'm writing this with hope and excitement for what's to come. `;
        } else if (mood?.includes('Reflective')) {
            letter += `Taking a moment to reflect on this chapter of my life, `;
        } else {
            letter += `I wanted to take a moment to capture my thoughts and feelings. `;
        }

        letter += `I wanted to capture this moment in time for you to discover ${timeframe || 'in the future'}.\\n\\n`;

        // Add topic-based content
        if (topics?.includes('Current life situation')) {
            letter += `Right now, life feels like a beautiful mixture of challenges and opportunities. I'm learning, growing, and becoming the person I'm meant to be.\\n\\n`;
        }

        if (topics?.includes('Dreams and goals')) {
            letter += `My dreams are bigger than ever. I envision a future filled with purpose, love, and meaningful connections. Each day, I'm taking small steps toward these aspirations.\\n\\n`;
        }

        if (topics?.includes('Family memories')) {
            letter += `The memories we've created together shine like stars in my mind. These precious moments of laughter, love, and togetherness are treasures I'll carry forever.\\n\\n`;
        }

        if (topics?.includes('Life lessons learned')) {
            letter += `Through all the experiences, both joyful and challenging, I've learned so much about resilience, love, and what truly matters in life.\\n\\n`;
        }

        if (topics?.includes('Gratitude and appreciation')) {
            letter += `I am deeply grateful for all the people, experiences, and opportunities that have shaped my journey. Each day brings new reasons to appreciate this beautiful life.\\n\\n`;
        }

        if (personal) {
            letter += `${personal}\\n\\n`;
        }

        if (topics?.includes('Hopes for the future')) {
            letter += `When you read this, I hope you'll remember this feeling of possibility and wonder. May you be proud of the journey that brought you here.\\n\\n`;
        }

        letter += `With love and anticipation,\\n${userName}\\n\\n`;
        letter += `Written on ${new Date().toLocaleDateString()}`;

        return letter;
    }

    generateFallbackAnalysis(memoryData) {
        const type = memoryData.type || 'unknown';

        return {
            tags: this.generateBasicTags(type, memoryData.fileName),
            emotions: ['joy', 'nostalgia'],
            description: `A precious ${type} memory captured with love`,
            confidence: 0.7,
            suggestedTitle: this.generateSuggestedTitle(memoryData),
            category: this.categorizeMemory(type)
        };
    }

    generateFallbackSuggestions() {
        const currentSeason = this.getCurrentSeason();
        const timeOfDay = new Date().getHours();

        return [
            {
                id: 1,
                type: 'seasonal',
                title: `Capture ${currentSeason} Moments`,
                description: `Don't forget to document the beautiful ${currentSeason.toLowerCase()} memories with your family`,
                icon: this.getSeasonIcon(currentSeason),
                priority: 'high'
            },
            {
                id: 2,
                type: 'time_based',
                title: timeOfDay < 12 ? 'Morning Family Time' : timeOfDay < 18 ? 'Afternoon Adventures' : 'Evening Reflections',
                description: 'Perfect time to capture some family moments',
                icon: timeOfDay < 12 ? '☀️' : timeOfDay < 18 ? '🌤️' : '🌙',
                priority: 'medium'
            },
            {
                id: 3,
                type: 'milestone',
                title: 'Monthly Memory Review',
                description: 'Take a moment to review and organize this month\\'s precious memories',
        icon: '📅',
                priority: 'low'
            }
        ];
    }

    generateFallbackInsights(memories) {
        const totalMemories = memories.length;
        const types = this.categorizeMemoryTypes(memories);
        const timeRange = this.getMemoryTimeRange(memories);

        return {
            statistics: {
                total: totalMemories,
                thisMonth: memories.filter(m => this.isThisMonth(m.createdAt)).length,
                mostActiveDay: this.getMostActiveDay(memories),
                favoriteType: types.most_common
            },
            trends: {
                uploadFrequency: this.calculateUploadFrequency(memories),
                seasonalActivity: this.getSeasonalActivity(memories),
                timeOfDayPattern: this.getTimeOfDayPattern(memories)
            },
            recommendations: [
                'Consider organizing memories into themed albums',
                'Try creating a digital letter for future reflection',
                'Share some favorite memories with family members'
            ]
        };
    }

    performBasicSearch(query, memories) {
        const lowerQuery = query.toLowerCase();

        return memories.filter(memory => {
            const title = (memory.title || '').toLowerCase();
            const description = (memory.description || '').toLowerCase();
            const tags = (memory.tags || []).join(' ').toLowerCase();

            return title.includes(lowerQuery) ||
                description.includes(lowerQuery) ||
                tags.includes(lowerQuery);
        });
    }

    // === UTILITY METHODS === //

    categorizeMemoryTypes(memories) {
        const types = {};
        memories.forEach(memory => {
            const type = memory.type || 'unknown';
            types[type] = (types[type] || 0) + 1;
        });

        const most_common = Object.keys(types).reduce((a, b) => types[a] > types[b] ? a : b, 'photo');

        return { types, most_common };
    }

    getMemoryTimeRange(memories) {
        if (memories.length === 0) return null;

        const dates = memories.map(m => {
            const date = m.createdAt?.toDate?.() || new Date(m.createdAt);
            return date.getTime();
        });

        return {
            earliest: new Date(Math.min(...dates)),
            latest: new Date(Math.max(...dates)),
            span: Math.max(...dates) - Math.min(...dates)
        };
    }

    detectSearchType(query) {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('family') || lowerQuery.includes('people')) return 'people';
        if (lowerQuery.includes('birthday') || lowerQuery.includes('celebration')) return 'events';
        if (lowerQuery.includes('photo') || lowerQuery.includes('picture')) return 'photos';
        if (lowerQuery.includes('video')) return 'videos';
        if (lowerQuery.includes('last month') || lowerQuery.includes('this year')) return 'date';

        return 'general';
    }

    generateBasicTags(type, fileName) {
        const tags = ['memory'];

        if (type === 'image' || type === 'photo') {
            tags.push('photo', 'visual');
        } else if (type === 'video') {
            tags.push('video', 'motion');
        } else if (type === 'letter' || type === 'text') {
            tags.push('letter', 'text');
        }

        // Add date-based tags
        const now = new Date();
        tags.push(this.getCurrentSeason().toLowerCase());
        tags.push(now.getFullYear().toString());

        return tags;
    }

    generateSuggestedTitle(memoryData) {
        const type = memoryData.type || 'memory';
        const date = new Date();
        const month = date.toLocaleDateString('en-US', { month: 'long' });

        return `${month} ${type.charAt(0).toUpperCase() + type.slice(1)} Memory`;
    }

    categorizeMemory(type) {
        switch (type) {
            case 'image':
            case 'photo':
                return 'photos';
            case 'video':
                return 'videos';
            case 'letter':
            case 'text':
                return 'letters';
            default:
                return 'other';
        }
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'Spring';
        if (month >= 5 && month <= 7) return 'Summer';
        if (month >= 8 && month <= 10) return 'Fall';
        return 'Winter';
    }

    getSeasonIcon(season) {
        switch (season) {
            case 'Spring': return '🌸';
            case 'Summer': return '☀️';
            case 'Fall': return '🍂';
            case 'Winter': return '❄️';
            default: return '🌟';
        }
    }

    isThisMonth(date) {
        const now = new Date();
        const memoryDate = date?.toDate?.() || new Date(date);
        return now.getMonth() === memoryDate.getMonth() &&
            now.getFullYear() === memoryDate.getFullYear();
    }

    getMostActiveDay(memories) {
        const days = {};
        memories.forEach(memory => {
            const date = memory.createdAt?.toDate?.() || new Date(memory.createdAt);
            const day = date.toLocaleDateString('en-US', { weekday: 'long' });
            days[day] = (days[day] || 0) + 1;
        });

        return Object.keys(days).reduce((a, b) => days[a] > days[b] ? a : b, 'Sunday');
    }

    calculateUploadFrequency(memories) {
        const now = new Date();
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const recentMemories = memories.filter(memory => {
            const date = memory.createdAt?.toDate?.() || new Date(memory.createdAt);
            return date >= oneMonthAgo;
        });

        return Math.round(recentMemories.length / 30 * 10) / 10; // memories per day
    }

    getSeasonalActivity(memories) {
        const seasons = { Spring: 0, Summer: 0, Fall: 0, Winter: 0 };

        memories.forEach(memory => {
            const date = memory.createdAt?.toDate?.() || new Date(memory.createdAt);
            const month = date.getMonth();

            if (month >= 2 && month <= 4) seasons.Spring++;
            else if (month >= 5 && month <= 7) seasons.Summer++;
            else if (month >= 8 && month <= 10) seasons.Fall++;
            else seasons.Winter++;
        });

        return seasons;
    }

    getTimeOfDayPattern(memories) {
        const patterns = { morning: 0, afternoon: 0, evening: 0, night: 0 };

        memories.forEach(memory => {
            const date = memory.createdAt?.toDate?.() || new Date(memory.createdAt);
            const hour = date.getHours();

            if (hour >= 6 && hour < 12) patterns.morning++;
            else if (hour >= 12 && hour < 18) patterns.afternoon++;
            else if (hour >= 18 && hour < 22) patterns.evening++;
            else patterns.night++;
        });

        return patterns;
    }
}

export default new AIService();
