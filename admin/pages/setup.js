import { useState } from 'react';
import { auth } from '../firebase-config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

export default function AdminSetup() {
  const [email, setEmail] = useState('admin@memorybox.app');
  const [password, setPassword] = useState('Pucca1829@');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createAdminUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Add admin role to Firestore
      const db = getFirestore();
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        role: 'admin',
        createdAt: new Date(),
        displayName: 'Memory Box Admin'
      });

      setMessage(`✅ Admin user created successfully! 
      Email: ${email}
      Password: ${password}
      You can now login to the admin portal.`);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setMessage(`✅ Admin user already exists! 
        Email: ${email}
        Password: ${password}
        You can login to the admin portal.`);
      } else {
        setMessage(`❌ Error: ${error.message}`);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Setup</h1>
          <p className="text-gray-600">Create Memory Box Admin Account</p>
        </div>

        <form onSubmit={createAdminUser} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-200 font-medium disabled:opacity-50"
          >
            {loading ? 'Creating Admin...' : 'Create Admin User'}
          </button>
        </form>

        {message && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{message}</pre>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <a
            href="/admin"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}
