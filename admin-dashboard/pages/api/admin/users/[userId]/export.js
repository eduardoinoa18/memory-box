import { 
    collection, 
    query, 
    where, 
    getDocs,
    doc,
    getDoc 
} from 'firebase/firestore';
import { db } from '../../../../../config/firebase';
import { adminApiMiddleware } from '../../../../../utils/withAdminAuth';

async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.query;
    const { format = 'json' } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Fetch user data
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = { id: userSnap.id, ...userSnap.data() };

        // Fetch user's folders
        const foldersQuery = query(
            collection(db, 'folders'), 
            where('userId', '==', userId)
        );
        const foldersSnap = await getDocs(foldersQuery);
        const folders = foldersSnap.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        }));

        // Fetch user's memories
        const memoriesQuery = query(
            collection(db, `users/${userId}/memories`)
        );
        const memoriesSnap = await getDocs(memoriesQuery);
        const memories = memoriesSnap.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        }));

        const exportData = {
            user: userData,
            folders: folders,
            memories: memories,
            stats: {
                totalMemories: memories.length,
                totalFolders: folders.length,
                totalStorage: memories.reduce((acc, m) => acc + (m.fileSize || 0), 0),
                exportedAt: new Date().toISOString()
            }
        };

        if (format === 'csv') {
            // Convert to CSV format
            const csv = convertToCSV(memories);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="user-${userId}-data.csv"`);
            return res.status(200).send(csv);
        }

        // Return JSON format
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="user-${userId}-data.json"`);
        return res.status(200).json(exportData);

    } catch (error) {
        console.error('Error exporting user data:', error);
        return res.status(500).json({ error: 'Failed to export user data' });
    }
}

function convertToCSV(memories) {
    if (memories.length === 0) return 'No data available';

    const headers = [
        'ID', 'File Name', 'Type', 'Size', 'Created At', 
        'Folder ID', 'Description', 'Tags'
    ];

    const rows = memories.map(memory => [
        memory.id,
        memory.fileName || '',
        memory.type || '',
        memory.fileSize || 0,
        memory.createdAt?.toDate?.()?.toISOString() || '',
        memory.folderId || '',
        memory.description || '',
        Array.isArray(memory.tags) ? memory.tags.join(';') : ''
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
}

export default adminApiMiddleware(handler);
