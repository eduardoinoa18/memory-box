import React from 'react';
import AdminLayout from '../components/AdminLayout';

export default function Memories() {
  return (
    <AdminLayout title="Memory Management">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Memory Management
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Memory management features will be available once Firebase integration is configured 
            through the Integration Hub.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
