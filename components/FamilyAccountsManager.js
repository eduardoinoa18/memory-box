import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    Alert,
    Modal,
    ActivityIndicator,
    Animated,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFamilyMembers } from '../hooks/useFamilyMembers';

const FamilyAccountsManager = ({ user, visible, onClose }) => {
    const {
        familyMembers,
        pendingInvites,
        loading,
        refreshing,
        refresh,
        inviteMember,
        updateMemberRole,
        removeMember,
        resendInvite
    } = useFamilyMembers(user?.uid);

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('viewer');
    const [inviteMessage, setInviteMessage] = useState('');
    const [isInviting, setIsInviting] = useState(false);

    const roles = [
        {
            id: 'viewer',
            name: 'Viewer',
            description: 'Can view memories and letters',
            icon: 'eye',
            color: '#3742fa'
        },
        {
            id: 'contributor',
            name: 'Contributor',
            description: 'Can upload, edit, and share memories',
            icon: 'create',
            color: '#2ed573'
        },
        {
            id: 'owner',
            name: 'Owner',
            description: 'Full access including billing and invites',
            icon: 'crown',
            color: '#ffa502'
        }
    ];

    const handleInviteMember = async () => {
        if (!inviteEmail.trim()) {
            Alert.alert('Error', 'Please enter an email address');
            return;
        }

        if (!isValidEmail(inviteEmail)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setIsInviting(true);
        try {
            await inviteMember({
                email: inviteEmail.toLowerCase().trim(),
                role: inviteRole,
                message: inviteMessage.trim(),
                invitedBy: user.email
            });

            setShowInviteModal(false);
            setInviteEmail('');
            setInviteMessage('');
            setInviteRole('viewer');
            
            Alert.alert('Success', 'Invitation sent successfully!');
        } catch (error) {
            console.error('Invite error:', error);
            Alert.alert('Error', error.message || 'Failed to send invitation');
        } finally {
            setIsInviting(false);
        }
    };

    const handleRoleChange = (memberId, newRole) => {
        Alert.alert(
            'Change Role',
            `Are you sure you want to change this member's role to ${newRole}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Change',
                    onPress: async () => {
                        try {
                            await updateMemberRole(memberId, newRole);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to update role');
                        }
                    }
                }
            ]
        );
    };

    const handleRemoveMember = (member) => {
        Alert.alert(
            'Remove Member',
            `Are you sure you want to remove ${member.email} from your family account?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeMember(member.id);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove member');
                        }
                    }
                }
            ]
        );
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const getRoleInfo = (roleId) => {
        return roles.find(role => role.id === roleId) || roles[0];
    };

    const formatLastActive = (timestamp) => {
        if (!timestamp) return 'Never';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    const MemberCard = ({ member, isPending = false }) => {
        const roleInfo = getRoleInfo(member.role);
        
        return (
            <View style={styles.memberCard}>
                <View style={styles.memberCardHeader}>
                    <View style={styles.memberInfo}>
                        <View style={styles.memberAvatar}>
                            <Text style={styles.memberAvatarText}>
                                {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.memberDetails}>
                            <Text style={styles.memberName}>
                                {member.name || member.email.split('@')[0]}
                            </Text>
                            <Text style={styles.memberEmail}>{member.email}</Text>
                            {!isPending && (
                                <Text style={styles.memberLastActive}>
                                    Last active: {formatLastActive(member.lastActiveAt)}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.memberActions}>
                        <View style={[styles.roleBadge, { backgroundColor: roleInfo.color }]}>
                            <Ionicons name={roleInfo.icon} size={14} color="white" />
                            <Text style={styles.roleBadgeText}>{roleInfo.name}</Text>
                        </View>
                        
                        {isPending && (
                            <View style={styles.pendingBadge}>
                                <Text style={styles.pendingText}>Pending</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.memberCardActions}>
                    {isPending ? (
                        <>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => resendInvite(member.id)}
                            >
                                <Ionicons name="mail" size={16} color="#007AFF" />
                                <Text style={styles.actionButtonText}>Resend</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.removeButton]}
                                onPress={() => handleRemoveMember(member)}
                            >
                                <Ionicons name="trash" size={16} color="#ff4757" />
                                <Text style={[styles.actionButtonText, { color: '#ff4757' }]}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {member.role !== 'owner' && (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => {
                                        const newRole = member.role === 'viewer' ? 'contributor' : 'viewer';
                                        handleRoleChange(member.id, newRole);
                                    }}
                                >
                                    <Ionicons name="swap-horizontal" size={16} color="#007AFF" />
                                    <Text style={styles.actionButtonText}>
                                        {member.role === 'viewer' ? 'Make Contributor' : 'Make Viewer'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {member.role !== 'owner' && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.removeButton]}
                                    onPress={() => handleRemoveMember(member)}
                                >
                                    <Ionicons name="person-remove" size={16} color="#ff4757" />
                                    <Text style={[styles.actionButtonText, { color: '#ff4757' }]}>Remove</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
            </View>
        );
    };

    const InviteModal = () => (
        <Modal
            visible={showInviteModal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowInviteModal(false)}
        >
            <View style={styles.inviteModalContainer}>
                <View style={styles.inviteModalHeader}>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setShowInviteModal(false)}
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.inviteModalTitle}>Invite Family Member</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.inviteModalContent}>
                    <Text style={styles.inviteInputLabel}>Email Address</Text>
                    <TextInput
                        style={styles.inviteInput}
                        value={inviteEmail}
                        onChangeText={setInviteEmail}
                        placeholder="Enter email address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Text style={styles.inviteInputLabel}>Role</Text>
                    <View style={styles.roleSelector}>
                        {roles.filter(role => role.id !== 'owner').map((role) => (
                            <TouchableOpacity
                                key={role.id}
                                style={[
                                    styles.roleOption,
                                    inviteRole === role.id && styles.roleOptionSelected
                                ]}
                                onPress={() => setInviteRole(role.id)}
                            >
                                <View style={[styles.roleIcon, { backgroundColor: role.color }]}>
                                    <Ionicons name={role.icon} size={16} color="white" />
                                </View>
                                <View style={styles.roleDetails}>
                                    <Text style={styles.roleName}>{role.name}</Text>
                                    <Text style={styles.roleDescription}>{role.description}</Text>
                                </View>
                                {inviteRole === role.id && (
                                    <Ionicons name="checkmark-circle" size={20} color={role.color} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.inviteInputLabel}>Personal Message (Optional)</Text>
                    <TextInput
                        style={[styles.inviteInput, styles.messageInput]}
                        value={inviteMessage}
                        onChangeText={setInviteMessage}
                        placeholder="Add a personal message to your invitation..."
                        multiline
                        maxLength={200}
                    />

                    <TouchableOpacity
                        style={[styles.sendInviteButton, isInviting && styles.sendInviteButtonDisabled]}
                        onPress={handleInviteMember}
                        disabled={isInviting}
                    >
                        {isInviting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Ionicons name="mail" size={20} color="white" />
                                <Text style={styles.sendInviteButtonText}>Send Invitation</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const EmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Family Members Yet</Text>
            <Text style={styles.emptySubtitle}>
                Invite family members to share memories together
            </Text>
            <TouchableOpacity 
                style={styles.emptyActionButton}
                onPress={() => setShowInviteModal(true)}
            >
                <Ionicons name="person-add" size={20} color="white" />
                <Text style={styles.emptyActionButtonText}>Invite First Member</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                        
                        <View style={styles.headerCenter}>
                            <Text style={styles.headerTitle}>Family Members</Text>
                            <Text style={styles.headerSubtitle}>
                                {familyMembers.length + pendingInvites.length} total
                            </Text>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.addButton}
                            onPress={() => setShowInviteModal(true)}
                        >
                            <Ionicons name="person-add" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.loadingText}>Loading family members...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={[...familyMembers, ...pendingInvites]}
                            renderItem={({ item }) => (
                                <MemberCard 
                                    member={item} 
                                    isPending={item.status === 'pending'}
                                />
                            )}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={refresh}
                                    tintColor="#007AFF"
                                />
                            }
                            ListEmptyComponent={<EmptyState />}
                            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                        />
                    )}
                </View>

                <InviteModal />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
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
        flex: 1,
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        marginBottom: 4
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)'
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        flex: 1
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12
    },
    listContent: {
        padding: 20,
        paddingBottom: 40
    },
    memberCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    memberCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    memberAvatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white'
    },
    memberDetails: {
        flex: 1
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2
    },
    memberEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2
    },
    memberLastActive: {
        fontSize: 12,
        color: '#999'
    },
    memberActions: {
        alignItems: 'flex-end'
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 4
    },
    roleBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
        marginLeft: 4
    },
    pendingBadge: {
        backgroundColor: '#ffa502',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4
    },
    pendingText: {
        fontSize: 10,
        fontWeight: '600',
        color: 'white'
    },
    memberCardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flexWrap: 'wrap'
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f8ff',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginLeft: 8,
        marginTop: 4
    },
    removeButton: {
        backgroundColor: '#ffebee'
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#007AFF',
        marginLeft: 4
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32
    },
    emptyActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        borderRadius: 25,
        paddingHorizontal: 24,
        paddingVertical: 12
    },
    emptyActionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8
    },
    inviteModalContainer: {
        flex: 1,
        backgroundColor: 'white'
    },
    inviteModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e5e9'
    },
    modalCloseButton: {
        padding: 4
    },
    inviteModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333'
    },
    inviteModalContent: {
        flex: 1,
        padding: 20
    },
    inviteInputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 16
    },
    inviteInput: {
        borderWidth: 1,
        borderColor: '#e1e5e9',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#f8f9fa'
    },
    messageInput: {
        height: 80,
        textAlignVertical: 'top'
    },
    roleSelector: {
        marginBottom: 8
    },
    roleOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#e1e5e9',
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#f8f9fa'
    },
    roleOptionSelected: {
        borderColor: '#007AFF',
        backgroundColor: '#f0f8ff'
    },
    roleIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    roleDetails: {
        flex: 1
    },
    roleName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2
    },
    roleDescription: {
        fontSize: 14,
        color: '#666'
    },
    sendInviteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        borderRadius: 25,
        paddingVertical: 16,
        marginTop: 24
    },
    sendInviteButtonDisabled: {
        backgroundColor: '#ccc'
    },
    sendInviteButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8
    }
});

export default FamilyAccountsManager;
