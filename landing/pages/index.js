// index.js - Enhanced landing page based on mockup design
import React, { useState } from 'react';
import Head from 'next/head';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import Navbar from '../components/Navbar';

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
        <title>Memory Box - Cherish Family Memories Forever</title>
        <meta name="description" content="The easiest way to store, organize, and share your family's most treasured moments." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        
        {/* Enhanced Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-gray-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block xl:inline">Cherish Family</span>{' '}
                    <span className="block text-blue-600 xl:inline">Memories Forever</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    The easiest way to store, organize, and share your family's most treasured moments.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <a
                        href="#features"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                      >
                        Get Started
                      </a>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <div className="h-56 w-full bg-gradient-to-br from-blue-500 to-purple-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
              {/* Mobile Phone Mockup */}
              <div className="relative">
                <div className="w-64 h-128 bg-black rounded-3xl p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                    <div className="bg-blue-50 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-medium">9:41</div>
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-2 bg-gray-300 rounded-full"></div>
                          <div className="w-4 h-2 bg-gray-300 rounded-full"></div>
                          <div className="w-4 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Folders</h2>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-100 rounded-xl p-3">
                          <div className="w-full h-16 bg-blue-200 rounded-lg mb-2"></div>
                          <div className="text-xs font-semibold">Family Trips</div>
                          <div className="text-xs text-gray-500">5 memories</div>
                        </div>
                        <div className="bg-pink-100 rounded-xl p-3">
                          <div className="w-full h-16 bg-pink-200 rounded-lg mb-2"></div>
                          <div className="text-xs font-semibold">Baby Photos</div>
                          <div className="text-xs text-gray-500">12 memories</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-orange-100 rounded-xl p-3">
                          <div className="w-full h-16 bg-orange-200 rounded-lg mb-2"></div>
                          <div className="text-xs font-semibold">Graduations</div>
                          <div className="text-xs text-gray-500">3 memories</div>
                        </div>
                        <div className="bg-green-100 rounded-xl p-3">
                          <div className="w-full h-16 bg-green-200 rounded-lg mb-2"></div>
                          <div className="text-xs font-semibold">Holidays</div>
                          <div className="text-xs text-gray-500">8 memories</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to preserve memories
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Simple, secure, and beautiful memory management for your family.
              </p>
            </div>

            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Effortless Uploads</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Easily add photos, videos, voice notes, and more to your family memory collection.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Organize & Share</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Organize memories into folders and share them with family and friends.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Secure & Accessible</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Your memories are securely stored and accessible on all your devices.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to preserve your memories?</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-200">
              Join thousands of families already using Memory Box to safeguard their precious moments.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
                >
                  Start Free Trial
                </a>
              </div>
              <div className="ml-3 inline-flex">
                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-400"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
            <p className="text-xl text-gray-600 mb-8">Get notified about new features and updates</p>
            
            {subscribed ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded max-w-md mx-auto">
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
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    {loading ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
            <div className="xl:grid xl:grid-cols-3 xl:gap-8">
              <div className="space-y-8 xl:col-span-1">
                <div className="text-2xl font-bold text-white flex items-center">
                  📦 Memory Box
                </div>
                <p className="text-gray-500 text-base">
                  The easiest way to store, organize, and share your family's most treasured moments.
                </p>
                <div className="flex space-x-6">
                  <a href="#" className="text-gray-400 hover:text-gray-300">
                    <span className="sr-only">Admin Panel</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                <div className="md:grid md:grid-cols-2 md:gap-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
                    <ul className="mt-4 space-y-4">
                      <li>
                        <a href="#features" className="text-base text-gray-300 hover:text-white">Features</a>
                      </li>
                      <li>
                        <a href="/signup" className="text-base text-gray-300 hover:text-white">Sign Up</a>
                      </li>
                      <li>
                        <a href="/login" className="text-base text-gray-300 hover:text-white">Sign In</a>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-12 md:mt-0">
                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
                    <ul className="mt-4 space-y-4">
                      <li>
                        <a href="#" className="text-base text-gray-300 hover:text-white">Help Center</a>
                      </li>
                      <li>
                        <a href="#" className="text-base text-gray-300 hover:text-white">Contact</a>
                      </li>
                      <li>
                        <a href="https://memory-box-admin-final-ibl2257v4-eduardo-inoas-projects.vercel.app/login" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-300">Admin Portal</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 border-t border-gray-700 pt-8">
              <p className="text-base text-gray-400 xl:text-center">
                &copy; 2025 Memory Box. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
