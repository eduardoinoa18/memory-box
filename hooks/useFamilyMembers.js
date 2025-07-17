import { useState, useEffect } from 'react';
import {
    collection,
    query,
    onSnapshot,
    doc,
    setDoc,
    deleteDoc,
    updateDoc,
    where,
    getDocs,
    orderBy,
    writeBatch,
    getDoc,
    addDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendInviteEmail } from '../services/emailService';

export const useFamilyMembers = (userId) => {
    const [familyMembers, setFamilyMembers] = useState([]);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [userRole, setUserRole] = useState('owner');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // Listen to family members
        const familyRef = collection(db, `users/${userId}/family`);
        const familyQuery = query(familyRef, orderBy('addedAt', 'desc'));

        const unsubscribeFamily = onSnapshot(familyQuery, (snapshot) => {
            const members = [];
            const invites = [];

            snapshot.docs.forEach(doc => {
                const data = { id: doc.id, ...doc.data() };
                if (data.status === 'pending') {
                    invites.push(data);
                } else {
                    members.push(data);
                }
            });

            setFamilyMembers(members);
            setPendingInvites(invites);
            setLoading(false);
            setRefreshing(false);
        }, (error) => {
            console.error('Error fetching family members:', error);
            setLoading(false);
            setRefreshing(false);
        });

        // Get user's role in this family
        getCurrentUserRole(userId);

        return () => unsubscribeFamily();
    }, [userId]);

    const getCurrentUserRole = async (userId) => {
        try {
            // Check if user is the owner (has their own family collection)
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists() && userDoc.data().accountType === 'owner') {
                setUserRole('owner');
                return;
            }

            // Otherwise, check their role in other family accounts
            const familiesQuery = query(
                collection(db, 'familyMembers'),
                where('userId', '==', userId),
                where('status', '==', 'active')
            );
            
            const snapshot = await getDocs(familiesQuery);
            if (!snapshot.empty) {
                const memberData = snapshot.docs[0].data();
                setUserRole(memberData.role);
            }
        } catch (error) {
            console.error('Error getting user role:', error);
        }
    };

    const inviteMember = async (inviteData) => {
        if (!userId) throw new Error('User not authenticated');

        try {
            // Check if email is already invited or is a member
            const existingMember = [...familyMembers, ...pendingInvites].find(
                member => member.email.toLowerCase() === inviteData.email.toLowerCase()
            );

            if (existingMember) {
                throw new Error('This person is already a family member or has a pending invitation');
            }

            // Generate invite ID
            const inviteId = generateInviteId();
            
            // Create family member record
            const memberData = {
                id: inviteId,
                email: inviteData.email,
                role: inviteData.role,
                status: 'pending',
                invitedBy: inviteData.invitedBy,
                addedAt: new Date(),
                inviteToken: generateInviteToken(),
                message: inviteData.message || ''
            };

            // Save to Firestore
            await setDoc(doc(db, `users/${userId}/family`, inviteId), memberData);

            // Send invitation email
            await sendInviteEmail({
                toEmail: inviteData.email,
                fromName: inviteData.invitedBy,
                role: inviteData.role,
                message: inviteData.message,
                inviteToken: memberData.inviteToken,
                inviteId: inviteId
            });

            return memberData;
        } catch (error) {
            console.error('Error inviting member:', error);
            throw error;
        }
    };

    const updateMemberRole = async (memberId, newRole) => {
        if (!userId) throw new Error('User not authenticated');

        try {
            const memberRef = doc(db, `users/${userId}/family`, memberId);
            await updateDoc(memberRef, {
                role: newRole,
                updatedAt: new Date()
            });

            // If member is active, also update their global role
            const member = familyMembers.find(m => m.id === memberId);
            if (member && member.status === 'active' && member.userId) {
                await updateDoc(doc(db, 'users', member.userId), {
                    familyRole: newRole
                });
            }
        } catch (error) {
            console.error('Error updating member role:', error);
            throw error;
        }
    };

    const removeMember = async (memberId) => {
        if (!userId) throw new Error('User not authenticated');

        try {
            // Remove from family collection
            await deleteDoc(doc(db, `users/${userId}/family`, memberId));

            // If it's an active member, revoke their access
            const member = [...familyMembers, ...pendingInvites].find(m => m.id === memberId);
            if (member && member.status === 'active' && member.userId) {
                // Remove family access from user
                await updateDoc(doc(db, 'users', member.userId), {
                    familyAccess: null,
                    familyRole: null
                });
            }
        } catch (error) {
            console.error('Error removing member:', error);
            throw error;
        }
    };

    const resendInvite = async (inviteId) => {
        if (!userId) throw new Error('User not authenticated');

        try {
            const invite = pendingInvites.find(inv => inv.id === inviteId);
            if (!invite) {
                throw new Error('Invitation not found');
            }

            // Generate new invite token
            const newToken = generateInviteToken();
            
            // Update invite with new token
            await updateDoc(doc(db, `users/${userId}/family`, inviteId), {
                inviteToken: newToken,
                resentAt: new Date()
            });

            // Resend email
            await sendInviteEmail({
                toEmail: invite.email,
                fromName: invite.invitedBy,
                role: invite.role,
                message: invite.message,
                inviteToken: newToken,
                inviteId: inviteId
            });
        } catch (error) {
            console.error('Error resending invite:', error);
            throw error;
        }
    };

    const acceptInvite = async (inviteToken, userData) => {
        try {
            // Find the invitation
            const invitesQuery = query(
                collection(db, 'familyInvites'),
                where('inviteToken', '==', inviteToken),
                where('status', '==', 'pending')
            );
            
            const snapshot = await getDocs(invitesQuery);
            if (snapshot.empty) {
                throw new Error('Invalid or expired invitation');
            }

            const inviteDoc = snapshot.docs[0];
            const inviteData = inviteDoc.data();

            // Update user's family access
            await updateDoc(doc(db, 'users', userData.uid), {
                familyAccess: inviteData.familyId,
                familyRole: inviteData.role,
                familyJoinedAt: new Date()
            });

            // Update invitation status
            await updateDoc(doc(db, `users/${inviteData.familyId}/family`, inviteData.memberId), {
                status: 'active',
                userId: userData.uid,
                activatedAt: new Date(),
                lastActiveAt: new Date()
            });

            // Delete the invite token
            await deleteDoc(inviteDoc.ref);

            return inviteData;
        } catch (error) {
            console.error('Error accepting invite:', error);
            throw error;
        }
    };

    const updateLastActive = async (memberId) => {
        if (!userId) return;

        try {
            await updateDoc(doc(db, `users/${userId}/family`, memberId), {
                lastActiveAt: new Date()
            });
        } catch (error) {
            console.error('Error updating last active:', error);
        }
    };

    const generateInviteId = () => {
        return `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    const generateInviteToken = () => {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    };

    const refresh = async () => {
        setRefreshing(true);
        // The real-time listener will handle the refresh
    };

    const canInviteMembers = () => {
        return userRole === 'owner' || userRole === 'contributor';
    };

    const canManageRoles = () => {
        return userRole === 'owner';
    };

    const canRemoveMembers = () => {
        return userRole === 'owner';
    };

    return {
        familyMembers,
        pendingInvites,
        userRole,
        loading,
        refreshing,
        refresh,
        inviteMember,
        updateMemberRole,
        removeMember,
        resendInvite,
        acceptInvite,
        updateLastActive,
        canInviteMembers,
        canManageRoles,
        canRemoveMembers
    };
};
