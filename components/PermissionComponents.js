import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '../hooks/usePermissions';

const PermissionGate = ({ 
    permission, 
    itemOwnerId, 
    onRestricted,
    showMessage = true,
    fallbackComponent,
    children 
}) => {
    const { checkPermission, getRestrictedMessage } = usePermissions();

    const handleRestricted = () => {
        if (onRestricted) {
            onRestricted();
            return;
        }

        if (showMessage) {
            Alert.alert(
                'Access Restricted',
                getRestrictedMessage(permission),
                [{ text: 'OK' }]
            );
        }
    };

    if (!checkPermission(permission, itemOwnerId)) {
        if (fallbackComponent) {
            return fallbackComponent;
        }

        return (
            <TouchableOpacity 
                style={styles.restrictedButton}
                onPress={handleRestricted}
                activeOpacity={0.7}
            >
                <Ionicons name="lock-closed" size={16} color="#999" />
                <Text style={styles.restrictedText}>Restricted</Text>
            </TouchableOpacity>
        );
    }

    return children;
};

const RoleBasedMenu = ({ actions, item }) => {
    const { checkPermission } = usePermissions();

    const filteredActions = actions.filter(action => {
        if (!action.permission) return true;
        return checkPermission(action.permission, item?.userId);
    });

    return (
        <View style={styles.menuContainer}>
            {filteredActions.map((action, index) => (
                <TouchableOpacity
                    key={action.id}
                    style={[
                        styles.menuItem,
                        action.destructive && styles.destructiveItem,
                        index === filteredActions.length - 1 && styles.lastItem
                    ]}
                    onPress={action.onPress}
                >
                    <Ionicons 
                        name={action.icon} 
                        size={20} 
                        color={action.destructive ? '#ff3333' : '#333'} 
                    />
                    <Text style={[
                        styles.menuText,
                        action.destructive && styles.destructiveText
                    ]}>
                        {action.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const RoleBadge = ({ role, size = 'small' }) => {
    const getRoleConfig = (role) => {
        switch (role) {
            case 'owner':
                return {
                    label: 'Owner',
                    color: '#ffa502',
                    icon: 'crown',
                    backgroundColor: '#fff5e6'
                };
            case 'contributor':
                return {
                    label: 'Contributor',
                    color: '#2ed573',
                    icon: 'create',
                    backgroundColor: '#e8f5e8'
                };
            case 'viewer':
                return {
                    label: 'Viewer',
                    color: '#3742fa',
                    icon: 'eye',
                    backgroundColor: '#e6e8ff'
                };
            default:
                return {
                    label: 'Member',
                    color: '#666',
                    icon: 'person',
                    backgroundColor: '#f0f0f0'
                };
        }
    };

    const config = getRoleConfig(role);
    const isLarge = size === 'large';

    return (
        <View style={[
            styles.roleBadge,
            { backgroundColor: config.backgroundColor },
            isLarge && styles.roleBadgeLarge
        ]}>
            <Ionicons 
                name={config.icon} 
                size={isLarge ? 16 : 12} 
                color={config.color} 
            />
            <Text style={[
                styles.roleBadgeText,
                { color: config.color },
                isLarge && styles.roleBadgeTextLarge
            ]}>
                {config.label}
            </Text>
        </View>
    );
};

const PermissionStatus = ({ user }) => {
    const { userRole, permissions, loading } = usePermissions();

    if (loading) {
        return (
            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>Loading permissions...</Text>
            </View>
        );
    }

    const getPermissionSummary = () => {
        const activePermissions = Object.entries(permissions)
            .filter(([_, value]) => value === true || value === 'own')
            .length;
        
        const totalPermissions = Object.keys(permissions).length;
        
        return `${activePermissions}/${totalPermissions} permissions active`;
    };

    return (
        <View style={styles.statusContainer}>
            <View style={styles.statusHeader}>
                <RoleBadge role={userRole} size="large" />
                <View style={styles.statusInfo}>
                    <Text style={styles.statusTitle}>Your Access Level</Text>
                    <Text style={styles.statusSubtitle}>{getPermissionSummary()}</Text>
                </View>
            </View>

            <View style={styles.permissionsList}>
                <View style={styles.permissionSection}>
                    <Text style={styles.sectionTitle}>Content Permissions</Text>
                    <PermissionItem 
                        icon="cloud-upload" 
                        label="Upload Memories" 
                        granted={permissions.canUploadMemories} 
                    />
                    <PermissionItem 
                        icon="folder" 
                        label="Create Folders" 
                        granted={permissions.canCreateFolders} 
                    />
                    <PermissionItem 
                        icon="mail" 
                        label="Write Letters" 
                        granted={permissions.canWriteLetters} 
                    />
                    <PermissionItem 
                        icon="robot" 
                        label="AI Assistant" 
                        granted={permissions.canUseAIAssistant} 
                    />
                </View>

                <View style={styles.permissionSection}>
                    <Text style={styles.sectionTitle}>Management Permissions</Text>
                    <PermissionItem 
                        icon="create" 
                        label="Edit Content" 
                        granted={permissions.canEditMemories} 
                    />
                    <PermissionItem 
                        icon="trash" 
                        label="Delete Content" 
                        granted={permissions.canDeleteMemories || permissions.canDeleteMemories === 'own'} 
                        partial={permissions.canDeleteMemories === 'own'}
                    />
                    <PermissionItem 
                        icon="people" 
                        label="Manage Family" 
                        granted={permissions.canManageMembers} 
                    />
                    <PermissionItem 
                        icon="settings" 
                        label="Admin Dashboard" 
                        granted={permissions.canAccessAdminDashboard} 
                    />
                </View>
            </View>
        </View>
    );
};

const PermissionItem = ({ icon, label, granted, partial }) => (
    <View style={styles.permissionItem}>
        <Ionicons name={icon} size={16} color="#666" />
        <Text style={styles.permissionLabel}>{label}</Text>
        <View style={styles.permissionStatus}>
            {granted ? (
                <>
                    <Ionicons 
                        name="checkmark-circle" 
                        size={16} 
                        color={partial ? "#ffa502" : "#2ed573"} 
                    />
                    {partial && <Text style={styles.partialText}>Own only</Text>}
                </>
            ) : (
                <Ionicons name="close-circle" size={16} color="#ff3333" />
            )}
        </View>
    </View>
);

const styles = {
    restrictedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#f5f5f5',
        borderRadius: 16,
        gap: 4
    },
    restrictedText: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500'
    },
    menuContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        gap: 12
    },
    lastItem: {
        borderBottomWidth: 0
    },
    destructiveItem: {
        backgroundColor: '#fff5f5'
    },
    menuText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500'
    },
    destructiveText: {
        color: '#ff3333'
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4
    },
    roleBadgeLarge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 6
    },
    roleBadgeText: {
        fontSize: 10,
        fontWeight: '600'
    },
    roleBadgeTextLarge: {
        fontSize: 12
    },
    statusContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        margin: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12
    },
    statusInfo: {
        flex: 1
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2
    },
    statusSubtitle: {
        fontSize: 14,
        color: '#666'
    },
    statusText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center'
    },
    permissionsList: {
        gap: 16
    },
    permissionSection: {
        gap: 8
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 12
    },
    permissionLabel: {
        flex: 1,
        fontSize: 14,
        color: '#666'
    },
    permissionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    partialText: {
        fontSize: 11,
        color: '#ffa502',
        fontWeight: '500'
    }
};

export { PermissionGate, RoleBasedMenu, RoleBadge, PermissionStatus };
export default PermissionGate;
