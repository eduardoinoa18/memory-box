// Admin Authentication Wrapper
export function withAdminAuth(getServerSidePropsFunc) {
    return async (context) => {
        const { req } = context;
        
        // For now, we'll use a simple cookie-based check
        // In production, implement proper JWT validation
        const adminToken = req.cookies.adminToken || req.headers.authorization;
        
        if (!adminToken || adminToken !== process.env.ADMIN_SECRET_TOKEN) {
            return {
                redirect: {
                    destination: '/admin/login',
                    permanent: false
                }
            };
        }

        // If authentication is valid, proceed with the original function
        if (getServerSidePropsFunc) {
            return await getServerSidePropsFunc(context);
        }

        return { props: {} };
    };
}

// Simple admin role check
export function isAdmin(user) {
    // Check if user has admin role
    return user?.role === 'admin' || user?.role === 'superadmin' || user?.isAdmin === true;
}

// Admin middleware for API routes
export function adminApiMiddleware(handler) {
    return async (req, res) => {
        const adminToken = req.cookies.adminToken || req.headers.authorization;
        
        if (!adminToken || adminToken !== process.env.ADMIN_SECRET_TOKEN) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        return handler(req, res);
    };
}
