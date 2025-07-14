// Minimal Integrations Page - Working Version
import React from 'react';
import AdminLayout from '../components/AdminLayout';

export default function Integrations() {
    return (
        <AdminLayout title="Integrations">
            <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Integrations Management
                </h1>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600">
                        Integration management panel will be loaded here.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}
