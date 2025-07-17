import { useState, useEffect, useContext, createContext } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

// Create permissions context
const PermissionsContext = createContext({});

export const usePermissions = () => {
    const context = useContext(PermissionsContext);
    if (!context) {
        throw new Error('usePermissions must be used within a PermissionsProvider');
    }
    return context;
};

export const PermissionsProvider = ({ children, user }) => {
    const [permissions, setPermissions] = useState({});
    const [userRole, setUserRole] = useState('owner');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        // Listen to user document for role changes
        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                const userData = doc.data();
                const role = userData.familyRole || userData.accountType || 'owner';
                setUserRole(role);
                setPermissions(calculatePermissions(role));
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching user permissions:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    const calculatePermissions = (role) => {
        const basePermissions = {
            // View permissions
            canViewMemories: true,
            canViewFolders: true,
            canViewLetters: true,
            canViewSharedContent: true,
            
            // Basic interaction permissions
            canFavoriteMemories: true,
            canShareMemories: false,
            canDownloadMemories: false,
            
            // Content creation permissions
            canUploadMemories: false,
            canCreateFolders: false,
            canWriteLetters: false,
            canUseAIAssistant: false,
            
            // Management permissions
            canEditMemories: false,
            canDeleteMemories: false,
            canEditFolders: false,
            canDeleteFolders: false,
            canEditLetters: false,
            canDeleteLetters: false,
            
            // Family permissions
            canInviteMembers: false,
            canManageMembers: false,
            canChangeRoles: false,
            canRemoveMembers: false,
            
            // Advanced permissions
            canAccessAdminDashboard: false,
            canManageBilling: false,
            canExportData: false,
            canManageIntegrations: false,
            
            // Sharing permissions
            canCreateShareLinks: false,
            canSetSharePermissions: false,
            canViewShareAnalytics: false
        };

        switch (role) {
            case 'owner':
                return {
                    ...basePermissions,
                    // Owners have full access
                    canShareMemories: true,
                    canDownloadMemories: true,
                    canUploadMemories: true,
                    canCreateFolders: true,
                    canWriteLetters: true,
                    canUseAIAssistant: true,
                    canEditMemories: true,
                    canDeleteMemories: true,
                    canEditFolders: true,
                    canDeleteFolders: true,
                    canEditLetters: true,
                    canDeleteLetters: true,
                    canInviteMembers: true,
                    canManageMembers: true,
                    canChangeRoles: true,
                    canRemoveMembers: true,
                    canAccessAdminDashboard: true,
                    canManageBilling: true,
                    canExportData: true,
                    canManageIntegrations: true,
                    canCreateShareLinks: true,
                    canSetSharePermissions: true,
                    canViewShareAnalytics: true
                };

            case 'contributor':
                return {
                    ...basePermissions,
                    // Contributors can create and edit content
                    canShareMemories: true,
                    canDownloadMemories: true,
                    canUploadMemories: true,
                    canCreateFolders: true,
                    canWriteLetters: true,
                    canUseAIAssistant: true,
                    canEditMemories: true,
                    canEditFolders: true,
                    canEditLetters: true,
                    canCreateShareLinks: true,
                    // But can only delete their own content
                    canDeleteMemories: 'own',
                    canDeleteFolders: 'own',
                    canDeleteLetters: 'own'
                };

            case 'viewer':
                return {
                    ...basePermissions,
                    // Viewers have read-only access with limited sharing
                    canShareMemories: true,
                    canDownloadMemories: true,
                    canCreateShareLinks: true
                };

            default:
                return basePermissions;
        }
    };

    const checkPermission = (permission, itemOwnerId = null) => {
        if (loading) return false;
        
        const hasPermission = permissions[permission];
        
        // Handle 'own' permissions
        if (hasPermission === 'own' && itemOwnerId) {
            return itemOwnerId === user?.uid;
        }
        
        return Boolean(hasPermission);
    };

    const getRestrictedMessage = (permission) => {
        const messages = {
            canUploadMemories: "You need contributor access to upload memories",
            canCreateFolders: "You need contributor access to create folders",
            canWriteLetters: "You need contributor access to write letters",
            canDeleteMemories: "You need owner access to delete memories",
            canInviteMembers: "You need owner access to invite family members",
            canManageBilling: "You need owner access to manage billing",
            canAccessAdminDashboard: "You need owner access to view admin dashboard"
        };
        
        return messages[permission] || "You don't have permission to perform this action";
    };

    const RequirePermission = ({ permission, itemOwnerId, fallback, children }) => {
        if (checkPermission(permission, itemOwnerId)) {
            return children;
        }
        
        if (fallback) {
            return fallback;
        }
        
        return null;
    };

    const value = {
        permissions,
        userRole,
        loading,
        checkPermission,
        getRestrictedMessage,
        RequirePermission
    };

    return (
        <PermissionsContext.Provider value={value}>
            {children}
        </PermissionsContext.Provider>
    );
};

// Hook for role-specific UI rendering
export const useRoleBasedUI = () => {
    const { userRole, checkPermission } = usePermissions();

    const getRoleColor = () => {
        switch (userRole) {
            case 'owner': return '#ffa502';
            case 'contributor': return '#2ed573';
            case 'viewer': return '#3742fa';
            default: return '#666';
        }
    };

    const getRoleIcon = () => {
        switch (userRole) {
            case 'owner': return 'crown';
            case 'contributor': return 'create';
            case 'viewer': return 'eye';
            default: return 'person';
        }
    };

    const getActionButtons = (item) => {
        const buttons = [];

        if (checkPermission('canEditMemories', item.userId)) {
            buttons.push({ id: 'edit', icon: 'create', label: 'Edit' });
        }

        if (checkPermission('canShareMemories')) {
            buttons.push({ id: 'share', icon: 'share', label: 'Share' });
        }

        if (checkPermission('canDeleteMemories', item.userId)) {
            buttons.push({ id: 'delete', icon: 'trash', label: 'Delete', destructive: true });
        }

        return buttons;
    };

    const getUploadOptions = () => {
        if (!checkPermission('canUploadMemories')) return [];

        return [
            { id: 'photo', icon: 'camera', label: 'Take Photo' },
            { id: 'gallery', icon: 'images', label: 'Photo Gallery' },
            { id: 'video', icon: 'videocam', label: 'Record Video' },
            { id: 'document', icon: 'document', label: 'Documents' }
        ];
    };

    return {
        userRole,
        getRoleColor,
        getRoleIcon,
        getActionButtons,
        getUploadOptions
    };
};

// Permission enforcement HOC
export const withPermissions = (WrappedComponent, requiredPermission) => {
    return function PermissionWrappedComponent(props) {
        const { checkPermission, getRestrictedMessage } = usePermissions();
        
        if (!checkPermission(requiredPermission)) {
            return (
                <View style={styles.restrictedContainer}>
                    <Ionicons name="lock-closed" size={48} color="#ccc" />
                    <Text style={styles.restrictedTitle}>Access Restricted</Text>
                    <Text style={styles.restrictedMessage}>
                        {getRestrictedMessage(requiredPermission)}
                    </Text>
                </View>
            );
        }
        
        return <WrappedComponent {...props} />;
    };
};

const styles = {
    restrictedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f8f9fa'
    },
    restrictedTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center'
    },
    restrictedMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22
    }
};
