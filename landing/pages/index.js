// index.js - Main landing page with Firebase integration
import React, { useState } from 'react';
import Head from 'next/head';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNewsletterSignup = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'newsletter'), {
        email: email,
        subscribedAt: new Date(),
        source: 'landing_page'
      });
      setSubscribed(true);
      setEmail('');
    } catch (error) {
      console.error('Newsletter signup error:', error);
      alert('Error signing up for newsletter. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Memory Box - MVP Version 1</title>
        <meta name="description" content="Store, organize, and share your family's most treasured moments. MVP version with essential features." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-gray-50">
        <Navbar />
        
        <HeroSection />

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">MVP Features</h2>
              <p className="text-xl text-gray-600">Essential functionality for Version 1</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="feature-card bg-gray-50 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📸</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Photo Upload</h3>
                <p className="text-gray-600">Simple drag & drop photo uploading with Firebase storage</p>
              </div>

              <div className="feature-card bg-gray-50 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">User Management</h3>
                <p className="text-gray-600">Firebase authentication with admin dashboard access</p>
              </div>

              <div className="feature-card bg-gray-50 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Storage</h3>
                <p className="text-gray-600">Enterprise-grade security with Firebase backend</p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
            <p className="text-xl text-gray-600 mb-8">Get notified about new features and updates</p>
            
            {subscribed ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                ✅ Thank you for subscribing! We'll keep you updated.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSignup} className="max-w-md mx-auto">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Status Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <div className="text-2xl font-bold text-green-600 mb-2">✅ Admin Panel</div>
                <p className="text-gray-600">Production Ready</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <div className="text-2xl font-bold text-green-600 mb-2">✅ Landing Page</div>
                <p className="text-gray-600">Production Ready</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <div className="text-2xl font-bold text-blue-600 mb-2">🚧 Main App</div>
                <p className="text-gray-600">Beta Testing</p>
              </div>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section id="download" className="py-20 bg-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 mb-8">Download the Memory Box MVP and start preserving your family memories today.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50">
                📱 Download for iOS (Coming Soon)
              </a>
              <a href="#" className="inline-flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-700">
                🤖 Download for Android (Coming Soon)
              </a>
            </div>
            
            <div className="mt-8">
              <a href="#" className="text-blue-100 hover:text-white underline">
                Try the web version (Beta)
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="contact" className="bg-gray-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-4">📦❤️ Memory Box</div>
              <p className="text-gray-400 mb-8">MVP Version 1 - Essential family memory storage</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <h3 className="text-white font-semibold mb-2">Product</h3>
                  <ul className="text-gray-400 space-y-1">
                    <li>Features</li>
                    <li>Pricing (Coming Soon)</li>
                    <li>Security</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Support</h3>
                  <ul className="text-gray-400 space-y-1">
                    <li>Help Center</li>
                    <li>Contact Us</li>
                    <li>FAQ</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Company</h3>
                  <ul className="text-gray-400 space-y-1">
                    <li>About</li>
                    <li>Privacy Policy</li>
                    <li>Terms of Service</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-800 text-center">
                <p className="text-gray-400">&copy; 2025 Memory Box. MVP Version 1. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
