// HeroSection.js - Hero section with dynamic content based on auth status
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase-config';

export default function HeroSection() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const openMainApp = () => {
    // In production, this would be the deployed app URL
    window.open('#', '_blank');
  };

  return (
    <section className="hero-gradient py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Family Memories,<br />
            <span className="text-blue-600">Beautifully Stored</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Memory Box MVP - Essential features for storing, organizing, and sharing your family's most treasured moments. 
            Simple, secure, and ready to use.
          </p>
          
          {!loading && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <button
                    onClick={openMainApp}
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 pulse-animation"
                  >
                    🚀 Open Memory Box App
                  </button>
                  <p className="text-gray-600 self-center">
                    Welcome back, {user.email}!
                  </p>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 pulse-animation"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
