import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    TextInput,
    Animated,
    Dimensions,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AILetterAssistant = ({ visible, onClose, onLetterGenerated, memory, user }) => {
    const [step, setStep] = useState(1); // 1: Context, 2: Options, 3: Generation, 4: Review
    const [occasion, setOccasion] = useState('');
    const [relationship, setRelationship] = useState('');
    const [mood, setMood] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    
    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const robPulse = useRef(new Animated.Value(1)).current;
    
    const occasions = [
        { id: 'birthday', label: 'Birthday', icon: 'gift', color: '#ff6b6b' },
        { id: 'anniversary', label: 'Anniversary', icon: 'heart', color: '#ff4757' },
        { id: 'graduation', label: 'Graduation', icon: 'school', color: '#3742fa' },
        { id: 'wedding', label: 'Wedding', icon: 'diamond', color: '#ff9ff3' },
        { id: 'baby', label: 'New Baby', icon: 'baby', color: '#70a1ff' },
        { id: 'holiday', label: 'Holiday', icon: 'star', color: '#5f27cd' },
        { id: 'achievement', label: 'Achievement', icon: 'trophy', color: '#ffa502' },
        { id: 'memory', label: 'Memory', icon: 'camera', color: '#2ed573' },
        { id: 'apology', label: 'Apology', icon: 'flower', color: '#ff6348' },
        { id: 'gratitude', label: 'Thank You', icon: 'thumbs-up', color: '#1dd1a1' },
        { id: 'love', label: 'Love Letter', icon: 'heart-circle', color: '#ff3838' },
        { id: 'custom', label: 'Other', icon: 'create', color: '#666' }
    ];

    const relationships = [
        { id: 'parent', label: 'Parent', icon: 'home' },
        { id: 'child', label: 'Child', icon: 'baby' },
        { id: 'spouse', label: 'Spouse/Partner', icon: 'heart' },
        { id: 'sibling', label: 'Sibling', icon: 'people' },
        { id: 'friend', label: 'Friend', icon: 'person' },
        { id: 'grandparent', label: 'Grandparent', icon: 'flower' },
        { id: 'colleague', label: 'Colleague', icon: 'briefcase' },
        { id: 'teacher', label: 'Teacher', icon: 'school' },
        { id: 'family', label: 'Family Member', icon: 'people-circle' },
        { id: 'myself', label: 'Future Me', icon: 'time' }
    ];

    const moods = [
        { id: 'happy', label: 'Happy & Joyful', icon: 'happy', color: '#ffa502' },
        { id: 'grateful', label: 'Grateful', icon: 'heart', color: '#ff6348' },
        { id: 'nostalgic', label: 'Nostalgic', icon: 'time', color: '#3742fa' },
        { id: 'proud', label: 'Proud', icon: 'trophy', color: '#2ed573' },
        { id: 'loving', label: 'Loving', icon: 'heart-circle', color: '#ff3838' },
        { id: 'hopeful', label: 'Hopeful', icon: 'sunny', color: '#70a1ff' },
        { id: 'reflective', label: 'Reflective', icon: 'bulb', color: '#5f27cd' },
        { id: 'playful', label: 'Playful', icon: 'game-controller', color: '#ff9ff3' },
        { id: 'sincere', label: 'Sincere', icon: 'checkmark-circle', color: '#1dd1a1' },
        { id: 'emotional', label: 'Emotional', icon: 'water', color: '#54a0ff' }
    ];

    useEffect(() => {
        if (visible) {
            setStep(1);
            setOccasion('');
            setRelationship('');
            setMood('');
            setCustomPrompt('');
            setGeneratedLetter('');
            setSuggestions([]);
            
            // Generate smart suggestions based on memory
            if (memory) {
                generateSmartSuggestions();
            }
            
            // Entrance animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                })
            ]).start();
            
            // Rob pulse animation
            startRobPulse();
        } else {
            fadeAnim.setValue(0);
            slideAnim.setValue(50);
        }
    }, [visible, memory]);

    const startRobPulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(robPulse, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(robPulse, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    };

    const generateSmartSuggestions = () => {
        if (!memory) return;
        
        const suggestions = [];
        
        // Analyze memory content for suggestions
        if (memory.fileName?.toLowerCase().includes('baby')) {
            suggestions.push({
                occasion: 'baby',
                relationship: 'child',
                mood: 'loving',
                description: 'Write to your future child about this precious moment'
            });
        }
        
        if (memory.fileName?.toLowerCase().includes('wedding')) {
            suggestions.push({
                occasion: 'wedding',
                relationship: 'spouse',
                mood: 'loving',
                description: 'Capture this beautiful wedding moment in words'
            });
        }
        
        if (memory.fileName?.toLowerCase().includes('graduation')) {
            suggestions.push({
                occasion: 'graduation',
                relationship: 'myself',
                mood: 'proud',
                description: 'Celebrate this achievement with a letter to future you'
            });
        }
        
        // Default suggestions based on memory type
        if (memory.type === 'image') {
            suggestions.push({
                occasion: 'memory',
                relationship: 'family',
                mood: 'nostalgic',
                description: 'Turn this photo into a cherished memory letter'
            });
        }
        
        setSuggestions(suggestions);
    };

    const handleNext = () => {
        if (step < 4) {
            setStep(step + 1);
            
            if (step === 3) {
                generateLetter();
            }
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const generateLetter = async () => {
        setIsGenerating(true);
        
        try {
            // Construct prompt for AI
            const prompt = buildAIPrompt();
            
            // Call AI service (mock for now)
            await mockAICall(prompt);
            
        } catch (error) {
            console.error('AI generation error:', error);
            Alert.alert('Generation Failed', 'Unable to generate letter. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const buildAIPrompt = () => {
        let prompt = `Write a heartfelt letter with the following context:\n`;
        
        if (occasion) {
            const occasionData = occasions.find(o => o.id === occasion);
            prompt += `Occasion: ${occasionData?.label}\n`;
        }
        
        if (relationship) {
            const relationshipData = relationships.find(r => r.id === relationship);
            prompt += `Writing to: ${relationshipData?.label}\n`;
        }
        
        if (mood) {
            const moodData = moods.find(m => m.id === mood);
            prompt += `Tone: ${moodData?.label}\n`;
        }
        
        if (memory) {
            prompt += `Memory context: ${memory.fileName || 'A special moment'}\n`;
            if (memory.description) {
                prompt += `Memory description: ${memory.description}\n`;
            }
        }
        
        if (customPrompt) {
            prompt += `Additional context: ${customPrompt}\n`;
        }
        
        prompt += `\nPlease write a beautiful, personal letter that captures the emotion and significance of this moment. Make it feel authentic and heartfelt.`;
        
        return prompt;
    };

    const mockAICall = async (prompt) => {
        // Simulate AI call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate mock letter based on selections
        let letter = '';
        
        if (occasion === 'baby' && relationship === 'child') {
            letter = `My Dearest Little One,

As I write this letter, you're still so small and perfect in every way. Today I captured a moment that I never want to forget - ${memory?.fileName || 'this precious time'}.

${memory?.description ? `Looking at ${memory.description.toLowerCase()}, ` : ''}I'm filled with so much love and wonder for who you'll become. Your tiny fingers, your peaceful sleeping face, the way you trust so completely - these are the moments that make my heart overflow.

I want you to know that from the very first moment I held you, my world changed completely. Every day with you is a gift, and I promise to cherish and protect these memories for both of us.

When you're older and reading this, I hope you'll understand just how much joy you brought into our lives. You are our greatest adventure, our sweetest dream come true.

All my love,
Your proud parent 💕`;
        } else if (occasion === 'memory' && mood === 'nostalgic') {
            letter = `Dear Future Self,

I'm writing this letter while looking at ${memory?.fileName || 'this special photo'}, and I want to capture exactly how I'm feeling right now.

${memory?.description ? `This moment - ${memory.description.toLowerCase()} - ` : 'This moment '}represents so much more than what's visible in the image. It's about the laughter we shared, the connections we made, and the way time seemed to slow down just for us.

I hope when you read this years from now, you'll remember not just what you can see, but what you felt. The warmth of that day, the people who mattered, the simple joy of being exactly where you were meant to be.

These are the moments that make life beautiful - not the grand gestures, but the quiet, perfect instances when everything feels right with the world.

Keep holding onto these memories.

With love from the past,
You 🌟`;
        } else {
            // Generic template
            const relationshipLabel = relationships.find(r => r.id === relationship)?.label || 'Someone Special';
            const moodLabel = moods.find(m => m.id === mood)?.label.toLowerCase() || 'thoughtful';
            
            letter = `Dear ${relationshipLabel},

I wanted to take a moment to write you this letter, capturing a ${moodLabel} feeling I have while looking at ${memory?.fileName || 'this special memory'}.

${customPrompt ? `${customPrompt}\n\n` : ''}This moment reminds me of how precious our connection is and how important it is to pause and appreciate the beautiful moments we share together.

${memory?.description ? `Seeing ${memory.description.toLowerCase()}, I'm ` : "I'm "}filled with gratitude for having you in my life and for all the ways you make each day brighter.

I hope this letter finds you well and brings a smile to your face, just as thinking of you brings one to mine.

With all my love,
💌`;
        }
        
        setGeneratedLetter(letter);
    };

    const handleUseGenerated = () => {
        const letterData = {
            title: `Letter from ${new Date().toLocaleDateString()}`,
            content: generatedLetter,
            theme: mood === 'loving' ? 'romantic' : mood === 'nostalgic' ? 'vintage' : 'classic',
            aiGenerated: true,
            context: {
                occasion,
                relationship,
                mood,
                memory: memory?.id
            }
        };
        
        onLetterGenerated?.(letterData);
        onClose();
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's the occasion?</Text>
            <Text style={styles.stepSubtitle}>Help Rob understand the context</Text>
            
            {suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsTitle}>💡 Smart Suggestions</Text>
                    {suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.suggestionCard}
                            onPress={() => {
                                setOccasion(suggestion.occasion);
                                setRelationship(suggestion.relationship);
                                setMood(suggestion.mood);
                            }}
                        >
                            <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            
            <ScrollView style={styles.optionsGrid} showsVerticalScrollIndicator={false}>
                {occasions.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.optionCard,
                            occasion === item.id && styles.optionCardSelected,
                            { borderColor: item.color }
                        ]}
                        onPress={() => setOccasion(item.id)}
                    >
                        <Ionicons name={item.icon} size={24} color={item.color} />
                        <Text style={styles.optionLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Who are you writing to?</Text>
            <Text style={styles.stepSubtitle}>This helps Rob choose the right tone</Text>
            
            <ScrollView style={styles.optionsGrid} showsVerticalScrollIndicator={false}>
                {relationships.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.optionCard,
                            relationship === item.id && styles.optionCardSelected
                        ]}
                        onPress={() => setRelationship(item.id)}
                    >
                        <Ionicons name={item.icon} size={24} color="#007AFF" />
                        <Text style={styles.optionLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's the mood?</Text>
            <Text style={styles.stepSubtitle}>How should the letter feel?</Text>
            
            <ScrollView style={styles.optionsGrid} showsVerticalScrollIndicator={false}>
                {moods.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.optionCard,
                            mood === item.id && styles.optionCardSelected,
                            { borderColor: item.color }
                        ]}
                        onPress={() => setMood(item.id)}
                    >
                        <Ionicons name={item.icon} size={24} color={item.color} />
                        <Text style={styles.optionLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            
            <TextInput
                style={styles.customPromptInput}
                value={customPrompt}
                onChangeText={setCustomPrompt}
                placeholder="Any specific details you'd like to include? (optional)"
                placeholderTextColor="#999"
                multiline
                maxLength={200}
            />
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.stepContainer}>
            {isGenerating ? (
                <View style={styles.generatingContainer}>
                    <Animated.View style={[styles.robAvatar, { transform: [{ scale: robPulse }] }]}>
                        <Ionicons name="sparkles" size={32} color="#007AFF" />
                    </Animated.View>
                    <ActivityIndicator size="large" color="#007AFF" style={styles.loadingSpinner} />
                    <Text style={styles.generatingTitle}>Rob is writing your letter...</Text>
                    <Text style={styles.generatingSubtitle}>This may take a moment ✨</Text>
                </View>
            ) : (
                <View style={styles.reviewContainer}>
                    <Text style={styles.stepTitle}>Your letter is ready! 💌</Text>
                    <ScrollView style={styles.letterPreview} showsVerticalScrollIndicator={false}>
                        <Text style={styles.letterText}>{generatedLetter}</Text>
                    </ScrollView>
                    
                    <View style={styles.reviewActions}>
                        <TouchableOpacity style={styles.regenerateButton} onPress={generateLetter}>
                            <Ionicons name="refresh" size={20} color="#007AFF" />
                            <Text style={styles.regenerateText}>Regenerate</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.useLetterButton} onPress={handleUseGenerated}>
                            <Text style={styles.useLetterText}>Use This Letter</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );

    const renderCurrentStep = () => {
        switch (step) {
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderStep3();
            case 4: return renderStep4();
            default: return renderStep1();
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return occasion !== '';
            case 2: return relationship !== '';
            case 3: return mood !== '';
            case 4: return !isGenerating;
            default: return false;
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.container}
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                        
                        <View style={styles.headerCenter}>
                            <View style={styles.robIcon}>
                                <Ionicons name="sparkles" size={20} color="#007AFF" />
                            </View>
                            <Text style={styles.headerTitle}>Rob Letter Assistant</Text>
                        </View>
                        
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Progress indicator */}
                    <View style={styles.progressContainer}>
                        {[1, 2, 3, 4].map((stepNum) => (
                            <View
                                key={stepNum}
                                style={[
                                    styles.progressDot,
                                    step >= stepNum && styles.progressDotActive
                                ]}
                            />
                        ))}
                    </View>

                    {/* Content */}
                    {renderCurrentStep()}

                    {/* Navigation */}
                    {step < 4 && (
                        <View style={styles.navigation}>
                            {step > 1 && (
                                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                                    <Ionicons name="arrow-back" size={20} color="#007AFF" />
                                    <Text style={styles.backButtonText}>Back</Text>
                                </TouchableOpacity>
                            )}
                            
                            <TouchableOpacity
                                style={[
                                    styles.nextButton,
                                    !canProceed() && styles.nextButtonDisabled
                                ]}
                                onPress={handleNext}
                                disabled={!canProceed()}
                            >
                                <Text style={styles.nextButtonText}>
                                    {step === 3 ? 'Generate Letter' : 'Next'}
                                </Text>
                                <Ionicons name="arrow-forward" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>
            </LinearGradient>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        flex: 1,
        paddingTop: 60
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    robIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white'
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 30
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 4
    },
    progressDotActive: {
        backgroundColor: 'white',
        width: 24
    },
    stepContainer: {
        flex: 1,
        paddingHorizontal: 20
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        textAlign: 'center',
        marginBottom: 8
    },
    stepSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 30
    },
    suggestionsContainer: {
        marginBottom: 20
    },
    suggestionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 12
    },
    suggestionCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8
    },
    suggestionDescription: {
        fontSize: 14,
        color: 'white',
        lineHeight: 20
    },
    optionsGrid: {
        flex: 1
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent'
    },
    optionCardSelected: {
        backgroundColor: 'white',
        borderColor: '#007AFF'
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginLeft: 12,
        flex: 1
    },
    customPromptInput: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#333',
        minHeight: 80,
        textAlignVertical: 'top',
        marginTop: 20
    },
    generatingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    robAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    loadingSpinner: {
        marginBottom: 20
    },
    generatingTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
        marginBottom: 8
    },
    generatingSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center'
    },
    reviewContainer: {
        flex: 1
    },
    letterPreview: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 12,
        padding: 20,
        flex: 1,
        marginBottom: 20
    },
    letterText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333'
    },
    reviewActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    regenerateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 12
    },
    regenerateText: {
        fontSize: 16,
        fontWeight: '500',
        color: 'white',
        marginLeft: 8
    },
    useLetterButton: {
        backgroundColor: 'white',
        borderRadius: 25,
        paddingHorizontal: 30,
        paddingVertical: 12
    },
    useLetterText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF'
    },
    navigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 40
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 12
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: 'white',
        marginRight: 8
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        borderRadius: 25,
        paddingHorizontal: 30,
        paddingVertical: 12
    },
    nextButtonDisabled: {
        backgroundColor: 'rgba(255,255,255,0.3)'
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginRight: 8
    }
});

export default AILetterAssistant;
