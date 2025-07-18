import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Memory Box...</p>
        </div>
      </div>
    );
  }

  return <Component {...pageProps} user={user} auth={auth} db={db} />;
}
