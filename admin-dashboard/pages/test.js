import { useState, useEffect } from 'react';

export default function TestPage() {
    const [currentTime, setCurrentTime] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setCurrentTime(new Date().toLocaleString());
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>🚀 Admin Dashboard Test Page</h1>
            <p>✅ If you can see this page, the Next.js server is working correctly.</p>
            <p>⏰ Current time: {mounted ? currentTime : 'Loading...'}</p>
            <div style={{ marginTop: '20px' }}>
                <h2>Available Routes:</h2>
                <ul>
                    <li><a href="/admin">📊 Admin Dashboard</a></li>
                    <li><a href="/admin/users">👥 User Management</a></li>
                    <li><a href="/admin/content">📝 Content Management</a></li>
                    <li><a href="/admin/analytics">📈 Analytics</a></li>
                </ul>
            </div>
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                <h3>Debug Info:</h3>
                <p>Node.js Environment: {typeof window === 'undefined' ? 'Server' : 'Client'}</p>
                <p>Next.js Version: Check package.json</p>
            </div>
        </div>
    );
}
