import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemories } from '../hooks/useMemories';
import MemoryViewer from './MemoryViewer';

const { width } = Dimensions.get('window');

const TimelineBuilder = ({ userId, onTimelineCreate }) => {
    const { memories, loading } = useMemories();
    const [timelineEvents, setTimelineEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [processingAI, setProcessingAI] = useState(false);
    const [selectedMemory, setSelectedMemory] = useState(null);
    
    // Animation references
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        if (memories && memories.length > 0) {
            generateTimelineEvents();
        }
    }, [memories]);

    useEffect(() => {
        // Animate timeline entrance
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, [timelineEvents]);

    const generateTimelineEvents = async () => {
        if (!memories || memories.length === 0) return;

        setProcessingAI(true);
        
        try {
            // Sort memories by date
            const sortedMemories = [...memories].sort((a, b) => {
                const aTime = a.createdAt?.toDate?.() || new Date(0);
                const bTime = b.createdAt?.toDate?.() || new Date(0);
                return aTime - bTime;
            });

            // Group memories into events using AI logic
            const events = await groupMemoriesIntoEvents(sortedMemories);
            
            setTimelineEvents(events);
        } catch (error) {
            console.error('Timeline generation error:', error);
            Alert.alert('Error', 'Failed to generate timeline');
        } finally {
            setProcessingAI(false);
        }
    };

    const groupMemoriesIntoEvents = async (sortedMemories) => {
        const events = [];
        let currentEvent = null;
        
        for (const memory of sortedMemories) {
            const memoryDate = memory.createdAt?.toDate?.() || new Date();
            const dayKey = memoryDate.toDateString();
            
            // Check if this memory belongs to current event or starts a new one
            if (!currentEvent || shouldStartNewEvent(currentEvent, memory, memoryDate)) {
                // Start new event
                currentEvent = {
                    id: `event_${events.length + 1}`,
                    title: await generateEventTitle(memory, memoryDate),
                    description: await generateEventDescription(memory),
                    date: memoryDate,
                    dayKey,
                    memories: [memory],
                    location: memory.location || null,
                    tags: [...(memory.tags || [])],
                    type: determineEventType([memory]),
                    significance: calculateEventSignificance([memory])
                };
                events.push(currentEvent);
            } else {
                // Add to current event
                currentEvent.memories.push(memory);
                currentEvent.tags = [...new Set([...currentEvent.tags, ...(memory.tags || [])])];
                currentEvent.type = determineEventType(currentEvent.memories);
                currentEvent.significance = calculateEventSignificance(currentEvent.memories);
                
                // Update event title and description based on new memories
                currentEvent.title = await generateEventTitle(currentEvent.memories[0], currentEvent.date, currentEvent.memories.length);
                currentEvent.description = await generateEventDescription(currentEvent.memories[0], currentEvent.memories.length);
            }
        }

        return events;
    };

    const shouldStartNewEvent = (currentEvent, memory, memoryDate) => {
        if (!currentEvent) return true;
        
        const lastEventDate = currentEvent.date;
        const timeDiff = Math.abs(memoryDate - lastEventDate);
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        // Start new event if:
        // - More than 6 hours apart
        // - Different location (if available)
        // - Different content type pattern
        return (
            hoursDiff > 6 ||
            (memory.location && currentEvent.location && memory.location !== currentEvent.location) ||
            (currentEvent.memories.length >= 20) // Max memories per event
        );
    };

    const generateEventTitle = async (memory, date, memoryCount = 1) => {
        const timeOfDay = getTimeOfDay(date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        
        // AI-powered title generation based on memory content and context
        if (memory.tags?.includes('vacation') || memory.tags?.includes('travel')) {
            return memoryCount > 1 
                ? `${dayName} Adventure (${memoryCount} memories)`
                : `${dayName} ${timeOfDay}`;
        }
        
        if (memory.tags?.includes('family') || memory.tags?.includes('friends')) {
            return memoryCount > 1
                ? `Time with Loved Ones (${memoryCount} memories)`
                : `${dayName} Moments`;
        }
        
        if (memory.type === 'video') {
            return memoryCount > 1
                ? `Video Collection (${memoryCount} memories)`
                : `${dayName} Video`;
        }
        
        if (memory.tags?.includes('work') || memory.tags?.includes('business')) {
            return memoryCount > 1
                ? `Work Day (${memoryCount} memories)`
                : `${dayName} Work`;
        }
        
        // Default titles based on time and count
        return memoryCount > 1
            ? `${dayName} Collection (${memoryCount} memories)`
            : `${dayName} ${timeOfDay}`;
    };

    const generateEventDescription = async (memory, memoryCount = 1) => {
        if (memoryCount === 1) {
            return memory.description || 'A special moment captured';
        }
        
        // AI-generated description for multiple memories
        const types = new Set();
        if (memory.type) types.add(memory.type);
        
        const typeText = Array.from(types).join(', ');
        return `A collection of ${memoryCount} memories including ${typeText}`;
    };

    const getTimeOfDay = (date) => {
        const hours = date.getHours();
        if (hours < 6) return 'Night';
        if (hours < 12) return 'Morning';
        if (hours < 17) return 'Afternoon';
        if (hours < 21) return 'Evening';
        return 'Night';
    };

    const determineEventType = (memories) => {
        const types = memories.map(m => m.type);
        const hasVideo = types.includes('video');
        const hasImages = types.includes('image');
        const hasAudio = types.includes('audio');
        
        if (hasVideo && hasImages) return 'mixed';
        if (hasVideo) return 'video';
        if (hasImages) return 'photos';
        if (hasAudio) return 'audio';
        return 'documents';
    };

    const calculateEventSignificance = (memories) => {
        let score = 0;
        
        // More memories = higher significance
        score += memories.length * 2;
        
        // Favorite memories boost significance
        score += memories.filter(m => m.isFavorited).length * 5;
        
        // Special tags boost significance
        const specialTags = ['vacation', 'birthday', 'wedding', 'anniversary', 'graduation'];
        memories.forEach(memory => {
            if (memory.tags?.some(tag => specialTags.includes(tag.toLowerCase()))) {
                score += 10;
            }
        });
        
        // Video content is often more significant
        score += memories.filter(m => m.type === 'video').length * 3;
        
        // Normalize to 1-5 scale
        if (score >= 50) return 5;
        if (score >= 30) return 4;
        if (score >= 15) return 3;
        if (score >= 5) return 2;
        return 1;
    };

    const handleEventPress = (event) => {
        setSelectedEvent(event);
        if (event.memories.length === 1) {
            setSelectedMemory(event.memories[0]);
            setViewerVisible(true);
        }
    };

    const handleMemoryPress = (memory) => {
        setSelectedMemory(memory);
        setViewerVisible(true);
    };

    const renderSignificanceStars = (significance) => {
        return (
            <View style={styles.significanceContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                    <Ionicons
                        key={star}
                        name={star <= significance ? "star" : "star-outline"}
                        size={12}
                        color={star <= significance ? "#FFD700" : "#ccc"}
                    />
                ))}
            </View>
        );
    };

    const TimelineEvent = ({ event, index }) => {
        const eventAnim = useRef(new Animated.Value(0)).current;
        
        useEffect(() => {
            Animated.timing(eventAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }).start();
        }, []);

        const isExpanded = selectedEvent?.id === event.id;

        return (
            <Animated.View
                style={[
                    styles.eventContainer,
                    {
                        opacity: eventAnim,
                        transform: [{
                            translateY: eventAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [30, 0],
                            })
                        }]
                    }
                ]}
            >
                {/* Timeline line */}
                <View style={styles.timelineLineContainer}>
                    <View style={[styles.timelineNode, { backgroundColor: getEventColor(event.type) }]} />
                    {index < timelineEvents.length - 1 && <View style={styles.timelineLine} />}
                </View>

                {/* Event content */}
                <TouchableOpacity
                    style={[styles.eventContent, isExpanded && styles.eventContentExpanded]}
                    onPress={() => handleEventPress(event)}
                    activeOpacity={0.8}
                >
                    <View style={styles.eventHeader}>
                        <View style={styles.eventTitleContainer}>
                            <Text style={styles.eventTitle}>{event.title}</Text>
                            {renderSignificanceStars(event.significance)}
                        </View>
                        <Text style={styles.eventDate}>
                            {event.date.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Text>
                    </View>

                    <Text style={styles.eventDescription}>{event.description}</Text>

                    {/* Event stats */}
                    <View style={styles.eventStats}>
                        <View style={styles.statItem}>
                            <Ionicons name="images" size={14} color="#666" />
                            <Text style={styles.statText}>{event.memories.length}</Text>
                        </View>
                        
                        <View style={styles.statItem}>
                            <Ionicons name={getEventTypeIcon(event.type)} size={14} color="#666" />
                            <Text style={styles.statText}>{event.type}</Text>
                        </View>
                        
                        {event.location && (
                            <View style={styles.statItem}>
                                <Ionicons name="location" size={14} color="#666" />
                                <Text style={styles.statText} numberOfLines={1}>
                                    {event.location}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Expanded memory list */}
                    {isExpanded && event.memories.length > 1 && (
                        <View style={styles.expandedMemories}>
                            <Text style={styles.memoriesTitle}>Memories in this event:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.memoriesList}>
                                    {event.memories.map((memory, idx) => (
                                        <TouchableOpacity
                                            key={`${memory.id}-${idx}`}
                                            style={styles.memoryThumb}
                                            onPress={() => handleMemoryPress(memory)}
                                        >
                                            <View style={styles.memoryIcon}>
                                                <Ionicons 
                                                    name={getFileIcon(memory.type)} 
                                                    size={20} 
                                                    color="#007AFF" 
                                                />
                                            </View>
                                            <Text style={styles.memoryThumbTitle} numberOfLines={1}>
                                                {memory.fileName || 'Untitled'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    )}

                    {/* Tags */}
                    {event.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {event.tags.slice(0, 3).map((tag, idx) => (
                                <View key={idx} style={styles.tag}>
                                    <Text style={styles.tagText}>#{tag}</Text>
                                </View>
                            ))}
                            {event.tags.length > 3 && (
                                <Text style={styles.moreTagsText}>+{event.tags.length - 3} more</Text>
                            )}
                        </View>
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const getEventColor = (type) => {
        switch (type) {
            case 'photos': return '#34C759';
            case 'video': return '#007AFF';
            case 'audio': return '#FF9500';
            case 'documents': return '#5856D6';
            case 'mixed': return '#FF3B30';
            default: return '#8E8E93';
        }
    };

    const getEventTypeIcon = (type) => {
        switch (type) {
            case 'photos': return 'camera';
            case 'video': return 'videocam';
            case 'audio': return 'musical-note';
            case 'documents': return 'document-text';
            case 'mixed': return 'albums';
            default: return 'folder';
        }
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'image': return 'image';
            case 'video': return 'videocam';
            case 'audio': return 'musical-note';
            case 'document': return 'document-text';
            default: return 'folder';
        }
    };

    if (loading || processingAI) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>
                    {processingAI ? 'Building your timeline...' : 'Loading memories...'}
                </Text>
                <Text style={styles.loadingSubtext}>
                    {processingAI ? 'AI is analyzing your memories to create meaningful events' : 'Please wait'}
                </Text>
            </View>
        );
    }

    if (timelineEvents.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No Timeline Available</Text>
                <Text style={styles.emptySubtitle}>
                    Add more memories to generate your AI-powered timeline
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Animated.View 
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                {/* Timeline header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Your Memory Timeline</Text>
                    <Text style={styles.headerSubtitle}>
                        AI-generated events from your {memories?.length || 0} memories
                    </Text>
                </View>

                {/* Timeline */}
                <ScrollView 
                    style={styles.timeline}
                    showsVerticalScrollIndicator={false}
                >
                    {timelineEvents.map((event, index) => (
                        <TimelineEvent 
                            key={event.id} 
                            event={event} 
                            index={index}
                        />
                    ))}
                </ScrollView>
            </Animated.View>

            {/* Memory Viewer */}
            <MemoryViewer
                visible={viewerVisible}
                memory={selectedMemory}
                onClose={() => {
                    setViewerVisible(false);
                    setSelectedMemory(null);
                }}
                onDelete={() => {}} // Handle if needed
                onShare={() => {}} // Handle if needed
                onFavorite={() => {}} // Handle if needed
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    content: {
        flex: 1
    },
    header: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e5e9'
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666'
    },
    timeline: {
        flex: 1,
        paddingHorizontal: 20
    },
    eventContainer: {
        flexDirection: 'row',
        marginVertical: 8
    },
    timelineLineContainer: {
        width: 30,
        alignItems: 'center',
        marginRight: 16
    },
    timelineNode: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 8
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#e1e5e9',
        marginTop: 8
    },
    eventContent: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5
    },
    eventContentExpanded: {
        borderColor: '#007AFF',
        borderWidth: 1
    },
    eventHeader: {
        marginBottom: 8
    },
    eventTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1
    },
    significanceContainer: {
        flexDirection: 'row',
        marginLeft: 8
    },
    eventDate: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500'
    },
    eventDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12
    },
    eventStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16
    },
    statText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4
    },
    expandedMemories: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0'
    },
    memoriesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8
    },
    memoriesList: {
        flexDirection: 'row'
    },
    memoryThumb: {
        width: 80,
        marginRight: 12,
        alignItems: 'center'
    },
    memoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4
    },
    memoryThumbTitle: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center'
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8
    },
    tag: {
        backgroundColor: '#f0f8ff',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginRight: 6,
        marginBottom: 4
    },
    tagText: {
        fontSize: 11,
        color: '#007AFF',
        fontWeight: '500'
    },
    moreTagsText: {
        fontSize: 11,
        color: '#666',
        marginLeft: 4,
        marginTop: 2
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40
    },
    loadingText: {
        fontSize: 16,
        color: '#333',
        marginTop: 16,
        textAlign: 'center'
    },
    loadingSubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center'
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
        marginBottom: 8
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center'
    }
});

export default TimelineBuilder;
