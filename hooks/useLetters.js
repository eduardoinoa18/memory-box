import { useState, useEffect } from 'react';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    setDoc,
    deleteDoc,
    updateDoc,
    where,
    getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const useLetters = (userId) => {
    const [letters, setLetters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // Set up real-time listener for letters
        const lettersRef = collection(db, `users/${userId}/letters`);
        const q = query(lettersRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lettersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setLetters(lettersData);
            setLoading(false);
            setRefreshing(false);
        }, (error) => {
            console.error('Error fetching letters:', error);
            setLoading(false);
            setRefreshing(false);
        });

        return () => unsubscribe();
    }, [userId]);

    const saveLetter = async (letterData) => {
        if (!userId) throw new Error('User not authenticated');

        try {
            const letterRef = doc(db, `users/${userId}/letters`, letterData.id || Date.now().toString());
            
            const letterToSave = {
                ...letterData,
                id: letterRef.id,
                userId,
                createdAt: letterData.createdAt || new Date(),
                updatedAt: new Date()
            };

            await setDoc(letterRef, letterToSave);
            return letterToSave;
        } catch (error) {
            console.error('Error saving letter:', error);
            throw error;
        }
    };

    const updateLetter = async (letterId, updates) => {
        if (!userId) throw new Error('User not authenticated');

        try {
            const letterRef = doc(db, `users/${userId}/letters`, letterId);
            await updateDoc(letterRef, {
                ...updates,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating letter:', error);
            throw error;
        }
    };

    const deleteLetter = async (letterId) => {
        if (!userId) throw new Error('User not authenticated');

        try {
            const letterRef = doc(db, `users/${userId}/letters`, letterId);
            await deleteDoc(letterRef);
        } catch (error) {
            console.error('Error deleting letter:', error);
            throw error;
        }
    };

    const getLettersByMemory = async (memoryId) => {
        if (!userId || !memoryId) return [];

        try {
            const lettersRef = collection(db, `users/${userId}/letters`);
            const q = query(
                lettersRef,
                where('context.memory', '==', memoryId),
                orderBy('createdAt', 'desc')
            );
            
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching letters by memory:', error);
            return [];
        }
    };

    const refresh = async () => {
        setRefreshing(true);
        // The real-time listener will handle the refresh
    };

    return {
        letters,
        loading,
        refreshing,
        refresh,
        saveLetter,
        updateLetter,
        deleteLetter,
        getLettersByMemory
    };
};
