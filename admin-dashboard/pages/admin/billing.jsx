// This file has been merged into revenue.jsx
// All billing functionality is now available at /admin/revenue
// This file is deprecated and will redirect to revenue page

import { useEffect } from 'react';
import { useRouter } from 'next/router';

const BillingPageDeprecated = () => {
    const router = useRouter();

    useEffect(() => {
        // Redirect to revenue page
        router.replace('/admin/revenue');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to Revenue Dashboard...</p>
            </div>
        </div>
    );
};

export default BillingPageDeprecated;


