import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { 
    Settings,
    User,
    Shield,
    Bell,
    Mail,
    Key,
    Database,
    Server,
    Globe,
    Smartphone,
    Monitor,
    Palette,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Save,
    RotateCcw,
    Download,
    Upload,
    Trash2,
    Plus,
    Edit,
    Search,
    Filter,
    RefreshCw,
    CheckCircle,
    XCircle,
    AlertCircle,
    Info,
    Calendar,
    Clock,
    MapPin,
    Phone,
    CreditCard,
    DollarSign,
    Percent,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Activity,
    Target,
    Zap,
    Code,
    Terminal,
    FileText,
    Image,
    Video,
    Music,
    Archive,
    Cloud,
    HardDrive,
    Cpu,
    Memory,
    Network,
    Wifi,
    Bluetooth,
    Volume2,
    VolumeX,
    Mic,
    MicOff,
    Camera,
    CameraOff,
    Sun,
    Moon,
    Contrast,
    Type,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Underline,
    Link,
    Unlink,
    Share,
    Copy,
    Move,
    Folder,
    Tag,
    Bookmark,
    Flag,
    Star,
    Heart,
    Gift,
    Coffee,
    Home,
    Building,
    Users,
    UserCheck,
    UserX,
    UserPlus,
    UserMinus,
    Crown,
    Award,
    Medal,
    Trophy,
    Gamepad2,
    Puzzle,
    Lightbulb,
    Flame,
    Snowflake,
    Droplets,
    Wind,
    CloudRain,
    CloudSnow,
    CloudLightning,
    Thermometer,
    Gauge,
    Timer,
    Stopwatch,
    Hourglass,
    Calendar as CalendarIcon,
    CalendarDays,
    CalendarCheck,
    CalendarX,
    CalendarPlus,
    CalendarMinus
} from 'lucide-react';

const SettingsPage = () => {
    const { stats, loading: statsLoading } = useDashboardStats();
    const [activeTab, setActiveTab] = useState('general');
    const [settingsData, setSettingsData] = useState({});
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        // Mock comprehensive settings data
        const mockSettingsData = {
            general: {
                siteName: 'Memory Box',
                siteDescription: 'Preserve and share your precious memories',
                siteUrl: 'https://memorybox.com',
                adminEmail: 'admin@memorybox.com',
                timezone: 'America/New_York',
                language: 'en',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12',
                maintenanceMode: false,
                debugMode: false,
                sslEnabled: true,
                compressionEnabled: true,
                cachingEnabled: true
            },
            appearance: {
                theme: 'light',
                primaryColor: '#3B82F6',
                secondaryColor: '#6366F1',
                accentColor: '#EC4899',
                fontSize: 'medium',
                fontFamily: 'Inter',
                logoUrl: '/images/logo.png',
                faviconUrl: '/images/favicon.ico',
                headerLayout: 'centered',
                sidebarPosition: 'left',
                animationsEnabled: true,
                transitionsEnabled: true,
                customCss: ''
            },
            users: {
                registrationEnabled: true,
                emailVerificationRequired: true,
                moderationRequired: false,
                defaultRole: 'user',
                maxUsers: 10000,
                sessionTimeout: 30,
                passwordMinLength: 8,
                passwordRequireSpecial: true,
                passwordRequireNumbers: true,
                passwordRequireUppercase: true,
                twoFactorEnabled: false,
                socialLoginEnabled: true,
                googleLoginEnabled: true,
                facebookLoginEnabled: true,
                githubLoginEnabled: false
            },
            notifications: {
                emailNotifications: true,
                pushNotifications: true,
                smsNotifications: false,
                slackNotifications: true,
                discordNotifications: false,
                webhookNotifications: true,
                notificationFrequency: 'immediate',
                digestFrequency: 'daily',
                quietHoursEnabled: true,
                quietHoursStart: '22:00',
                quietHoursEnd: '08:00',
                systemAlerts: true,
                securityAlerts: true,
                performanceAlerts: true,
                errorAlerts: true
            },
            security: {
                bruteForceProtection: true,
                ipBlacklistEnabled: true,
                rateLimitingEnabled: true,
                corsEnabled: true,
                csrfProtection: true,
                contentSecurityPolicy: true,
                httpOnlySessionCookies: true,
                secureSessionCookies: true,
                sessionSecure: true,
                passwordHashing: 'bcrypt',
                encryptionAlgorithm: 'AES-256',
                backupEncryption: true,
                auditLogging: true,
                loginAttemptLogging: true,
                suspiciousActivityDetection: true
            },
            performance: {
                cacheType: 'redis',
                cacheExpiration: 3600,
                compressionLevel: 6,
                imageOptimization: true,
                lazyLoading: true,
                cdnEnabled: true,
                minifyAssets: true,
                gzipCompression: true,
                brotliCompression: true,
                httpCaching: true,
                databasePooling: true,
                connectionPoolSize: 10,
                queryOptimization: true,
                indexOptimization: true
            },
            integrations: {
                emailProvider: 'sendgrid',
                storageProvider: 'aws-s3',
                analyticsProvider: 'google-analytics',
                paymentProvider: 'stripe',
                searchProvider: 'elasticsearch',
                queueProvider: 'redis',
                loggingProvider: 'winston',
                monitoringProvider: 'datadog',
                backupProvider: 'aws-s3',
                cdnProvider: 'cloudflare'
            },
            api: {
                apiEnabled: true,
                apiVersioning: true,
                rateLimitingEnabled: true,
                authenticationRequired: true,
                corsEnabled: true,
                swaggerEnabled: true,
                webhooksEnabled: true,
                callbacksEnabled: true,
                compressionEnabled: true,
                loggingEnabled: true,
                monitoringEnabled: true,
                cachingEnabled: true
            },
            backup: {
                autoBackupEnabled: true,
                backupFrequency: 'daily',
                backupRetention: 30,
                backupLocation: 'aws-s3',
                backupEncryption: true,
                backupCompression: true,
                incrementalBackups: true,
                databaseBackup: true,
                fileBackup: true,
                configBackup: true,
                testRestoreEnabled: true,
                backupMonitoring: true
            },
            monitoring: {
                uptimeMonitoring: true,
                performanceMonitoring: true,
                errorTracking: true,
                logAggregation: true,
                metricsCollection: true,
                alerting: true,
                dashboards: true,
                reports: true,
                realTimeMonitoring: true,
                historicalData: true,
                customMetrics: true,
                thresholdAlerts: true
            }
        };

        setSettingsData(mockSettingsData);
    }, []);

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'performance', label: 'Performance', icon: Zap },
        { id: 'integrations', label: 'Integrations', icon: Globe },
        { id: 'api', label: 'API', icon: Code },
        { id: 'backup', label: 'Backup', icon: Archive },
        { id: 'monitoring', label: 'Monitoring', icon: Activity }
    ];

    const handleInputChange = (section, field, value) => {
        setSettingsData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
        setUnsavedChanges(true);
    };

    const handleSave = () => {
        // Simulate save operation
        console.log('Saving settings:', settingsData);
        setUnsavedChanges(false);
        // Show success message
    };

    const handleReset = () => {
        // Reset to original values
        setUnsavedChanges(false);
        // Reload original settings
    };

    const renderToggle = (section, field, label, description = '') => (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
                <div className="font-medium text-gray-900">{label}</div>
                {description && <div className="text-sm text-gray-500">{description}</div>}
            </div>
            <button
                onClick={() => handleInputChange(section, field, !settingsData[section]?.[field])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settingsData[section]?.[field] ? 'bg-blue-600' : 'bg-gray-200'
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settingsData[section]?.[field] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );

    const renderInput = (section, field, label, type = 'text', placeholder = '') => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                type={type}
                value={settingsData[section]?.[field] || ''}
                onChange={(e) => handleInputChange(section, field, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    );

    const renderSelect = (section, field, label, options) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <select
                value={settingsData[section]?.[field] || ''}
                onChange={(e) => handleInputChange(section, field, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderInput('general', 'siteName', 'Site Name', 'text', 'Enter site name')}
                            {renderInput('general', 'siteDescription', 'Site Description', 'text', 'Enter site description')}
                            {renderInput('general', 'siteUrl', 'Site URL', 'url', 'https://example.com')}
                            {renderInput('general', 'adminEmail', 'Admin Email', 'email', 'admin@example.com')}
                            {renderSelect('general', 'timezone', 'Timezone', [
                                { value: 'America/New_York', label: 'Eastern Time (ET)' },
                                { value: 'America/Chicago', label: 'Central Time (CT)' },
                                { value: 'America/Denver', label: 'Mountain Time (MT)' },
                                { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                                { value: 'UTC', label: 'UTC' }
                            ])}
                            {renderSelect('general', 'language', 'Language', [
                                { value: 'en', label: 'English' },
                                { value: 'es', label: 'Spanish' },
                                { value: 'fr', label: 'French' },
                                { value: 'de', label: 'German' },
                                { value: 'it', label: 'Italian' }
                            ])}
                        </div>
                        <div className="space-y-4">
                            {renderToggle('general', 'maintenanceMode', 'Maintenance Mode', 'Enable to put the site in maintenance mode')}
                            {renderToggle('general', 'debugMode', 'Debug Mode', 'Enable for development debugging')}
                            {renderToggle('general', 'sslEnabled', 'SSL Enabled', 'Force HTTPS connections')}
                            {renderToggle('general', 'compressionEnabled', 'Compression Enabled', 'Enable response compression')}
                            {renderToggle('general', 'cachingEnabled', 'Caching Enabled', 'Enable application caching')}
                        </div>
                    </div>
                );

            case 'appearance':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Appearance Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderSelect('appearance', 'theme', 'Theme', [
                                { value: 'light', label: 'Light' },
                                { value: 'dark', label: 'Dark' },
                                { value: 'auto', label: 'Auto' }
                            ])}
                            {renderInput('appearance', 'primaryColor', 'Primary Color', 'color')}
                            {renderInput('appearance', 'secondaryColor', 'Secondary Color', 'color')}
                            {renderInput('appearance', 'accentColor', 'Accent Color', 'color')}
                            {renderSelect('appearance', 'fontSize', 'Font Size', [
                                { value: 'small', label: 'Small' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'large', label: 'Large' }
                            ])}
                            {renderSelect('appearance', 'fontFamily', 'Font Family', [
                                { value: 'Inter', label: 'Inter' },
                                { value: 'Roboto', label: 'Roboto' },
                                { value: 'Open Sans', label: 'Open Sans' },
                                { value: 'Lato', label: 'Lato' }
                            ])}
                        </div>
                        <div className="space-y-4">
                            {renderToggle('appearance', 'animationsEnabled', 'Animations Enabled', 'Enable UI animations')}
                            {renderToggle('appearance', 'transitionsEnabled', 'Transitions Enabled', 'Enable smooth transitions')}
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Custom CSS</label>
                            <textarea
                                value={settingsData.appearance?.customCss || ''}
                                onChange={(e) => handleInputChange('appearance', 'customCss', e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter custom CSS..."
                            />
                        </div>
                    </div>
                );

            case 'users':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">User Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderSelect('users', 'defaultRole', 'Default Role', [
                                { value: 'user', label: 'User' },
                                { value: 'moderator', label: 'Moderator' },
                                { value: 'admin', label: 'Admin' }
                            ])}
                            {renderInput('users', 'maxUsers', 'Max Users', 'number')}
                            {renderInput('users', 'sessionTimeout', 'Session Timeout (minutes)', 'number')}
                            {renderInput('users', 'passwordMinLength', 'Password Min Length', 'number')}
                        </div>
                        <div className="space-y-4">
                            {renderToggle('users', 'registrationEnabled', 'Registration Enabled', 'Allow new user registration')}
                            {renderToggle('users', 'emailVerificationRequired', 'Email Verification Required', 'Require email verification')}
                            {renderToggle('users', 'moderationRequired', 'Moderation Required', 'Require admin approval')}
                            {renderToggle('users', 'passwordRequireSpecial', 'Require Special Characters', 'Passwords must contain special characters')}
                            {renderToggle('users', 'passwordRequireNumbers', 'Require Numbers', 'Passwords must contain numbers')}
                            {renderToggle('users', 'passwordRequireUppercase', 'Require Uppercase', 'Passwords must contain uppercase letters')}
                            {renderToggle('users', 'twoFactorEnabled', 'Two-Factor Authentication', 'Enable 2FA for all users')}
                            {renderToggle('users', 'socialLoginEnabled', 'Social Login Enabled', 'Allow social media login')}
                            {renderToggle('users', 'googleLoginEnabled', 'Google Login', 'Enable Google OAuth')}
                            {renderToggle('users', 'facebookLoginEnabled', 'Facebook Login', 'Enable Facebook OAuth')}
                            {renderToggle('users', 'githubLoginEnabled', 'GitHub Login', 'Enable GitHub OAuth')}
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderSelect('notifications', 'notificationFrequency', 'Notification Frequency', [
                                { value: 'immediate', label: 'Immediate' },
                                { value: 'hourly', label: 'Hourly' },
                                { value: 'daily', label: 'Daily' },
                                { value: 'weekly', label: 'Weekly' }
                            ])}
                            {renderSelect('notifications', 'digestFrequency', 'Digest Frequency', [
                                { value: 'daily', label: 'Daily' },
                                { value: 'weekly', label: 'Weekly' },
                                { value: 'monthly', label: 'Monthly' }
                            ])}
                            {renderInput('notifications', 'quietHoursStart', 'Quiet Hours Start', 'time')}
                            {renderInput('notifications', 'quietHoursEnd', 'Quiet Hours End', 'time')}
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Notification Channels</h4>
                            {renderToggle('notifications', 'emailNotifications', 'Email Notifications', 'Send notifications via email')}
                            {renderToggle('notifications', 'pushNotifications', 'Push Notifications', 'Send browser push notifications')}
                            {renderToggle('notifications', 'smsNotifications', 'SMS Notifications', 'Send notifications via SMS')}
                            {renderToggle('notifications', 'slackNotifications', 'Slack Notifications', 'Send notifications to Slack')}
                            {renderToggle('notifications', 'discordNotifications', 'Discord Notifications', 'Send notifications to Discord')}
                            {renderToggle('notifications', 'webhookNotifications', 'Webhook Notifications', 'Send notifications via webhooks')}
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Alert Types</h4>
                            {renderToggle('notifications', 'systemAlerts', 'System Alerts', 'Alerts for system events')}
                            {renderToggle('notifications', 'securityAlerts', 'Security Alerts', 'Alerts for security events')}
                            {renderToggle('notifications', 'performanceAlerts', 'Performance Alerts', 'Alerts for performance issues')}
                            {renderToggle('notifications', 'errorAlerts', 'Error Alerts', 'Alerts for application errors')}
                            {renderToggle('notifications', 'quietHoursEnabled', 'Quiet Hours', 'Disable notifications during quiet hours')}
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderSelect('security', 'passwordHashing', 'Password Hashing', [
                                { value: 'bcrypt', label: 'bcrypt' },
                                { value: 'argon2', label: 'Argon2' },
                                { value: 'scrypt', label: 'scrypt' }
                            ])}
                            {renderSelect('security', 'encryptionAlgorithm', 'Encryption Algorithm', [
                                { value: 'AES-256', label: 'AES-256' },
                                { value: 'AES-128', label: 'AES-128' },
                                { value: 'ChaCha20', label: 'ChaCha20' }
                            ])}
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Protection Features</h4>
                            {renderToggle('security', 'bruteForceProtection', 'Brute Force Protection', 'Protect against brute force attacks')}
                            {renderToggle('security', 'ipBlacklistEnabled', 'IP Blacklist', 'Enable IP address blacklisting')}
                            {renderToggle('security', 'rateLimitingEnabled', 'Rate Limiting', 'Limit request frequency')}
                            {renderToggle('security', 'corsEnabled', 'CORS Protection', 'Enable Cross-Origin Resource Sharing protection')}
                            {renderToggle('security', 'csrfProtection', 'CSRF Protection', 'Protect against Cross-Site Request Forgery')}
                            {renderToggle('security', 'contentSecurityPolicy', 'Content Security Policy', 'Enable CSP headers')}
                            {renderToggle('security', 'httpOnlySessionCookies', 'HTTP-Only Cookies', 'Prevent JavaScript access to session cookies')}
                            {renderToggle('security', 'secureSessionCookies', 'Secure Cookies', 'Only send cookies over HTTPS')}
                            {renderToggle('security', 'backupEncryption', 'Backup Encryption', 'Encrypt backup files')}
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Logging & Monitoring</h4>
                            {renderToggle('security', 'auditLogging', 'Audit Logging', 'Log all user actions')}
                            {renderToggle('security', 'loginAttemptLogging', 'Login Attempt Logging', 'Log all login attempts')}
                            {renderToggle('security', 'suspiciousActivityDetection', 'Suspicious Activity Detection', 'Automatically detect suspicious behavior')}
                        </div>
                    </div>
                );

            case 'performance':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Performance Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderSelect('performance', 'cacheType', 'Cache Type', [
                                { value: 'redis', label: 'Redis' },
                                { value: 'memcached', label: 'Memcached' },
                                { value: 'file', label: 'File Cache' },
                                { value: 'database', label: 'Database Cache' }
                            ])}
                            {renderInput('performance', 'cacheExpiration', 'Cache Expiration (seconds)', 'number')}
                            {renderInput('performance', 'compressionLevel', 'Compression Level (1-9)', 'number')}
                            {renderInput('performance', 'connectionPoolSize', 'Connection Pool Size', 'number')}
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Optimization Features</h4>
                            {renderToggle('performance', 'imageOptimization', 'Image Optimization', 'Automatically optimize images')}
                            {renderToggle('performance', 'lazyLoading', 'Lazy Loading', 'Load content on demand')}
                            {renderToggle('performance', 'cdnEnabled', 'CDN Enabled', 'Use Content Delivery Network')}
                            {renderToggle('performance', 'minifyAssets', 'Minify Assets', 'Minify CSS and JavaScript')}
                            {renderToggle('performance', 'gzipCompression', 'Gzip Compression', 'Enable Gzip compression')}
                            {renderToggle('performance', 'brotliCompression', 'Brotli Compression', 'Enable Brotli compression')}
                            {renderToggle('performance', 'httpCaching', 'HTTP Caching', 'Enable HTTP cache headers')}
                            {renderToggle('performance', 'databasePooling', 'Database Pooling', 'Use connection pooling')}
                            {renderToggle('performance', 'queryOptimization', 'Query Optimization', 'Optimize database queries')}
                            {renderToggle('performance', 'indexOptimization', 'Index Optimization', 'Optimize database indexes')}
                        </div>
                    </div>
                );

            case 'integrations':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Integration Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderSelect('integrations', 'emailProvider', 'Email Provider', [
                                { value: 'sendgrid', label: 'SendGrid' },
                                { value: 'mailgun', label: 'Mailgun' },
                                { value: 'ses', label: 'Amazon SES' },
                                { value: 'smtp', label: 'SMTP' }
                            ])}
                            {renderSelect('integrations', 'storageProvider', 'Storage Provider', [
                                { value: 'aws-s3', label: 'Amazon S3' },
                                { value: 'google-cloud', label: 'Google Cloud Storage' },
                                { value: 'azure-blob', label: 'Azure Blob Storage' },
                                { value: 'local', label: 'Local Storage' }
                            ])}
                            {renderSelect('integrations', 'analyticsProvider', 'Analytics Provider', [
                                { value: 'google-analytics', label: 'Google Analytics' },
                                { value: 'mixpanel', label: 'Mixpanel' },
                                { value: 'amplitude', label: 'Amplitude' },
                                { value: 'segment', label: 'Segment' }
                            ])}
                            {renderSelect('integrations', 'paymentProvider', 'Payment Provider', [
                                { value: 'stripe', label: 'Stripe' },
                                { value: 'paypal', label: 'PayPal' },
                                { value: 'square', label: 'Square' },
                                { value: 'braintree', label: 'Braintree' }
                            ])}
                            {renderSelect('integrations', 'searchProvider', 'Search Provider', [
                                { value: 'elasticsearch', label: 'Elasticsearch' },
                                { value: 'algolia', label: 'Algolia' },
                                { value: 'solr', label: 'Apache Solr' },
                                { value: 'database', label: 'Database Search' }
                            ])}
                            {renderSelect('integrations', 'queueProvider', 'Queue Provider', [
                                { value: 'redis', label: 'Redis' },
                                { value: 'rabbitmq', label: 'RabbitMQ' },
                                { value: 'sqs', label: 'Amazon SQS' },
                                { value: 'database', label: 'Database Queue' }
                            ])}
                        </div>
                    </div>
                );

            case 'api':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">API Settings</h3>
                        <div className="space-y-4">
                            {renderToggle('api', 'apiEnabled', 'API Enabled', 'Enable REST API endpoints')}
                            {renderToggle('api', 'apiVersioning', 'API Versioning', 'Enable API versioning')}
                            {renderToggle('api', 'rateLimitingEnabled', 'Rate Limiting', 'Limit API request frequency')}
                            {renderToggle('api', 'authenticationRequired', 'Authentication Required', 'Require authentication for API access')}
                            {renderToggle('api', 'corsEnabled', 'CORS Enabled', 'Enable Cross-Origin Resource Sharing')}
                            {renderToggle('api', 'swaggerEnabled', 'Swagger Documentation', 'Enable API documentation')}
                            {renderToggle('api', 'webhooksEnabled', 'Webhooks Enabled', 'Enable webhook functionality')}
                            {renderToggle('api', 'callbacksEnabled', 'Callbacks Enabled', 'Enable callback URLs')}
                            {renderToggle('api', 'compressionEnabled', 'Compression Enabled', 'Enable response compression')}
                            {renderToggle('api', 'loggingEnabled', 'Logging Enabled', 'Log API requests')}
                            {renderToggle('api', 'monitoringEnabled', 'Monitoring Enabled', 'Monitor API performance')}
                            {renderToggle('api', 'cachingEnabled', 'Caching Enabled', 'Cache API responses')}
                        </div>
                    </div>
                );

            case 'backup':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Backup Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderSelect('backup', 'backupFrequency', 'Backup Frequency', [
                                { value: 'hourly', label: 'Hourly' },
                                { value: 'daily', label: 'Daily' },
                                { value: 'weekly', label: 'Weekly' },
                                { value: 'monthly', label: 'Monthly' }
                            ])}
                            {renderInput('backup', 'backupRetention', 'Backup Retention (days)', 'number')}
                            {renderSelect('backup', 'backupLocation', 'Backup Location', [
                                { value: 'aws-s3', label: 'Amazon S3' },
                                { value: 'google-cloud', label: 'Google Cloud Storage' },
                                { value: 'azure-blob', label: 'Azure Blob Storage' },
                                { value: 'local', label: 'Local Storage' }
                            ])}
                        </div>
                        <div className="space-y-4">
                            {renderToggle('backup', 'autoBackupEnabled', 'Auto Backup', 'Enable automatic backups')}
                            {renderToggle('backup', 'backupEncryption', 'Backup Encryption', 'Encrypt backup files')}
                            {renderToggle('backup', 'backupCompression', 'Backup Compression', 'Compress backup files')}
                            {renderToggle('backup', 'incrementalBackups', 'Incremental Backups', 'Use incremental backup strategy')}
                            {renderToggle('backup', 'databaseBackup', 'Database Backup', 'Include database in backups')}
                            {renderToggle('backup', 'fileBackup', 'File Backup', 'Include files in backups')}
                            {renderToggle('backup', 'configBackup', 'Config Backup', 'Include configuration in backups')}
                            {renderToggle('backup', 'testRestoreEnabled', 'Test Restore', 'Regularly test backup restoration')}
                            {renderToggle('backup', 'backupMonitoring', 'Backup Monitoring', 'Monitor backup success/failure')}
                        </div>
                    </div>
                );

            case 'monitoring':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Monitoring Settings</h3>
                        <div className="space-y-4">
                            {renderToggle('monitoring', 'uptimeMonitoring', 'Uptime Monitoring', 'Monitor application uptime')}
                            {renderToggle('monitoring', 'performanceMonitoring', 'Performance Monitoring', 'Monitor application performance')}
                            {renderToggle('monitoring', 'errorTracking', 'Error Tracking', 'Track application errors')}
                            {renderToggle('monitoring', 'logAggregation', 'Log Aggregation', 'Aggregate application logs')}
                            {renderToggle('monitoring', 'metricsCollection', 'Metrics Collection', 'Collect application metrics')}
                            {renderToggle('monitoring', 'alerting', 'Alerting', 'Enable monitoring alerts')}
                            {renderToggle('monitoring', 'dashboards', 'Dashboards', 'Enable monitoring dashboards')}
                            {renderToggle('monitoring', 'reports', 'Reports', 'Generate monitoring reports')}
                            {renderToggle('monitoring', 'realTimeMonitoring', 'Real-time Monitoring', 'Enable real-time monitoring')}
                            {renderToggle('monitoring', 'historicalData', 'Historical Data', 'Store historical monitoring data')}
                            {renderToggle('monitoring', 'customMetrics', 'Custom Metrics', 'Enable custom metric collection')}
                            {renderToggle('monitoring', 'thresholdAlerts', 'Threshold Alerts', 'Alert when thresholds are exceeded')}
                        </div>
                    </div>
                );

            default:
                return <div>Select a tab to view settings</div>;
        }
    };

    if (statsLoading) {
        return (
            <AdminLayout title="Settings">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Settings">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-600">Configure your Memory Box application settings</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {unsavedChanges && (
                            <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                                <AlertCircle size={16} />
                                <span className="text-sm">Unsaved changes</span>
                            </div>
                        )}
                        <button
                            onClick={handleReset}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                        >
                            <RotateCcw size={16} />
                            <span>Reset</span>
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                        >
                            <Save size={16} />
                            <span>Save Changes</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow p-4">
                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                                                activeTab === tab.id
                                                    ? 'bg-blue-500 text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Icon size={18} className="mr-3" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-lg shadow p-6">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>

                {/* Settings Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                    <div className="flex items-center mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Settings className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Configuration Overview</h3>
                            <p className="text-sm text-gray-600">Current system configuration status</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white rounded p-4">
                            <strong>Security:</strong> {settingsData.security?.bruteForceProtection ? 'Enhanced' : 'Basic'} protection with {settingsData.security?.encryptionAlgorithm} encryption and {settingsData.security?.auditLogging ? 'full' : 'basic'} logging enabled.
                        </div>
                        <div className="bg-white rounded p-4">
                            <strong>Performance:</strong> {settingsData.performance?.cacheType} caching with {settingsData.performance?.cdnEnabled ? 'CDN' : 'no CDN'} and {settingsData.performance?.compressionLevel}/9 compression level.
                        </div>
                        <div className="bg-white rounded p-4">
                            <strong>Backup:</strong> {settingsData.backup?.autoBackupEnabled ? settingsData.backup?.backupFrequency : 'Manual'} backups to {settingsData.backup?.backupLocation} with {settingsData.backup?.backupRetention} day retention.
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default SettingsPage;
