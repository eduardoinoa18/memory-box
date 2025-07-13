import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { 
    Package,
    Plus,
    Edit,
    Trash2,
    Eye,
    Search,
    Filter,
    RefreshCw,
    Settings,
    Star,
    StarOff,
    Heart,
    Share,
    Download,
    Upload,
    Image,
    Video,
    FileText,
    Calendar,
    Clock,
    Users,
    TrendingUp,
    TrendingDown,
    ArrowUp,
    ArrowDown,
    DollarSign,
    CreditCard,
    ShoppingCart,
    Target,
    Activity,
    BarChart3,
    PieChart,
    LineChart,
    Archive,
    Tag,
    Bookmark,
    Flag,
    CheckCircle,
    XCircle,
    AlertCircle,
    Info,
    Gift,
    Crown,
    Zap,
    Shield,
    Lock,
    Unlock,
    Globe,
    MapPin,
    Smartphone,
    Monitor,
    Tablet,
    Camera,
    Mic,
    Speaker,
    Headphones,
    Wifi,
    Bluetooth,
    Battery,
    Power,
    Cpu,
    HardDrive,
    Memory,
    Database,
    Server,
    Cloud,
    Code,
    Terminal,
    Command,
    Type,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    Grid,
    Layers,
    Move,
    Copy,
    Paste,
    Scissors,
    RotateCw,
    RotateCcw,
    FlipHorizontal,
    FlipVertical,
    ZoomIn,
    ZoomOut,
    Maximize,
    Minimize,
    MoreHorizontal,
    MoreVertical
} from 'lucide-react';

const ProductPage = () => {
    const { stats, loading: statsLoading } = useDashboardStats();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [productData, setProductData] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        // Mock comprehensive product data
        const mockProductData = {
            overview: {
                totalProducts: 24,
                activeProducts: 18,
                draftProducts: 4,
                archivedProducts: 2,
                totalRevenue: 45678.90,
                avgRating: 4.7,
                totalReviews: 1247,
                conversionRate: 12.4
            },
            products: [
                {
                    id: 1,
                    name: 'Memory Box Premium',
                    description: 'Premium subscription for unlimited memory storage and AI-powered letter generation',
                    category: 'subscription',
                    status: 'active',
                    price: 29.99,
                    monthlyPrice: 29.99,
                    yearlyPrice: 299.99,
                    features: ['Unlimited Storage', 'AI Letters', 'Premium Templates', 'Priority Support'],
                    image: '/images/premium-box.jpg',
                    rating: 4.8,
                    reviews: 342,
                    sales: 1247,
                    revenue: 15689.50,
                    createdDate: '2024-01-15',
                    lastUpdated: '2024-07-10',
                    tags: ['premium', 'subscription', 'popular'],
                    isPopular: true,
                    isFeatured: true,
                    stock: null,
                    sku: 'MB-PREM-001',
                    weight: null,
                    dimensions: null
                },
                {
                    id: 2,
                    name: 'Memory Box Starter',
                    description: 'Basic plan for personal memory keeping with essential features',
                    category: 'subscription',
                    status: 'active',
                    price: 9.99,
                    monthlyPrice: 9.99,
                    yearlyPrice: 99.99,
                    features: ['5GB Storage', 'Basic Templates', 'Email Support'],
                    image: '/images/starter-box.jpg',
                    rating: 4.5,
                    reviews: 156,
                    sales: 823,
                    revenue: 6789.20,
                    createdDate: '2024-01-15',
                    lastUpdated: '2024-07-05',
                    tags: ['starter', 'subscription', 'affordable'],
                    isPopular: false,
                    isFeatured: false,
                    stock: null,
                    sku: 'MB-START-001',
                    weight: null,
                    dimensions: null
                },
                {
                    id: 3,
                    name: 'Vintage Photo Album',
                    description: 'Beautiful handcrafted photo album for printing your digital memories',
                    category: 'physical',
                    status: 'active',
                    price: 49.99,
                    monthlyPrice: null,
                    yearlyPrice: null,
                    features: ['50 Pages', 'Premium Paper', 'Custom Cover', 'Gift Wrapping'],
                    image: '/images/photo-album.jpg',
                    rating: 4.9,
                    reviews: 234,
                    sales: 456,
                    revenue: 12456.78,
                    createdDate: '2024-02-01',
                    lastUpdated: '2024-07-08',
                    tags: ['physical', 'album', 'gift'],
                    isPopular: true,
                    isFeatured: true,
                    stock: 127,
                    sku: 'MB-ALB-VIN-001',
                    weight: '1.2kg',
                    dimensions: '30x25x3cm'
                },
                {
                    id: 4,
                    name: 'Digital Memory Frame',
                    description: 'Smart digital frame that displays your memories with AI-powered slideshows',
                    category: 'hardware',
                    status: 'active',
                    price: 199.99,
                    monthlyPrice: null,
                    yearlyPrice: null,
                    features: ['10" HD Display', 'WiFi Connectivity', 'Cloud Sync', 'Voice Control'],
                    image: '/images/digital-frame.jpg',
                    rating: 4.6,
                    reviews: 89,
                    sales: 234,
                    revenue: 8956.34,
                    createdDate: '2024-03-15',
                    lastUpdated: '2024-07-12',
                    tags: ['hardware', 'digital', 'smart'],
                    isPopular: false,
                    isFeatured: true,
                    stock: 45,
                    sku: 'MB-FRAME-DIG-001',
                    weight: '0.8kg',
                    dimensions: '25x18x2cm'
                },
                {
                    id: 5,
                    name: 'Memory Care Package',
                    description: 'Complete package with photo album, digital frame, and premium subscription',
                    category: 'bundle',
                    status: 'active',
                    price: 249.99,
                    monthlyPrice: null,
                    yearlyPrice: null,
                    features: ['Photo Album', 'Digital Frame', '1 Year Premium', 'Personal Setup'],
                    image: '/images/care-package.jpg',
                    rating: 4.9,
                    reviews: 67,
                    sales: 123,
                    revenue: 7834.56,
                    createdDate: '2024-04-01',
                    lastUpdated: '2024-07-11',
                    tags: ['bundle', 'complete', 'gift'],
                    isPopular: true,
                    isFeatured: true,
                    stock: 23,
                    sku: 'MB-BUNDLE-CARE-001',
                    weight: '2.1kg',
                    dimensions: '35x30x10cm'
                },
                {
                    id: 6,
                    name: 'AI Letter Templates Pack',
                    description: 'Premium collection of AI-generated letter templates for special occasions',
                    category: 'digital',
                    status: 'active',
                    price: 19.99,
                    monthlyPrice: null,
                    yearlyPrice: null,
                    features: ['50+ Templates', 'Holiday Themes', 'Personal Events', 'Business Letters'],
                    image: '/images/letter-templates.jpg',
                    rating: 4.4,
                    reviews: 178,
                    sales: 567,
                    revenue: 3456.78,
                    createdDate: '2024-05-01',
                    lastUpdated: '2024-07-09',
                    tags: ['digital', 'templates', 'ai'],
                    isPopular: false,
                    isFeatured: false,
                    stock: null,
                    sku: 'MB-TEMP-AI-001',
                    weight: null,
                    dimensions: null
                },
                {
                    id: 7,
                    name: 'Memory Box Gift Card',
                    description: 'Perfect gift for loved ones to create their own memory collections',
                    category: 'gift',
                    status: 'active',
                    price: 25.00,
                    monthlyPrice: null,
                    yearlyPrice: null,
                    features: ['Any Amount', 'No Expiry', 'Digital Delivery', 'Personal Message'],
                    image: '/images/gift-card.jpg',
                    rating: 4.7,
                    reviews: 245,
                    sales: 890,
                    revenue: 12345.67,
                    createdDate: '2024-01-20',
                    lastUpdated: '2024-07-07',
                    tags: ['gift', 'card', 'flexible'],
                    isPopular: true,
                    isFeatured: false,
                    stock: null,
                    sku: 'MB-GIFT-CARD-001',
                    weight: null,
                    dimensions: null
                },
                {
                    id: 8,
                    name: 'Professional Photo Prints',
                    description: 'High-quality photo printing service for your digital memories',
                    category: 'service',
                    status: 'active',
                    price: 0.99,
                    monthlyPrice: null,
                    yearlyPrice: null,
                    features: ['Professional Quality', 'Multiple Sizes', 'Fast Delivery', 'Bulk Discounts'],
                    image: '/images/photo-prints.jpg',
                    rating: 4.6,
                    reviews: 456,
                    sales: 2341,
                    revenue: 4567.89,
                    createdDate: '2024-02-15',
                    lastUpdated: '2024-07-06',
                    tags: ['service', 'printing', 'photos'],
                    isPopular: false,
                    isFeatured: false,
                    stock: null,
                    sku: 'MB-PRINT-PROF-001',
                    weight: null,
                    dimensions: 'Various'
                }
            ],
            categories: [
                { name: 'subscription', label: 'Subscription', count: 2, icon: CreditCard },
                { name: 'physical', label: 'Physical Products', count: 1, icon: Package },
                { name: 'hardware', label: 'Hardware', count: 1, icon: Monitor },
                { name: 'bundle', label: 'Bundles', count: 1, icon: Gift },
                { name: 'digital', label: 'Digital Products', count: 1, icon: Download },
                { name: 'gift', label: 'Gift Cards', count: 1, icon: Heart },
                { name: 'service', label: 'Services', count: 1, icon: Settings }
            ],
            salesAnalytics: {
                topSellingProducts: [
                    { name: 'Photo Prints', sales: 2341, revenue: 4567.89 },
                    { name: 'Premium Subscription', sales: 1247, revenue: 15689.50 },
                    { name: 'Gift Cards', sales: 890, revenue: 12345.67 },
                    { name: 'Starter Subscription', sales: 823, revenue: 6789.20 },
                    { name: 'AI Templates', sales: 567, revenue: 3456.78 }
                ],
                revenueByCategory: [
                    { category: 'Subscription', revenue: 22478.70, percentage: 49.2 },
                    { category: 'Physical', revenue: 12456.78, percentage: 27.3 },
                    { category: 'Gift', revenue: 12345.67, percentage: 27.0 },
                    { category: 'Hardware', revenue: 8956.34, percentage: 19.6 },
                    { category: 'Bundle', revenue: 7834.56, percentage: 17.1 }
                ],
                monthlyTrends: [
                    { month: 'Jan', revenue: 8234.56, sales: 234 },
                    { month: 'Feb', revenue: 9567.89, sales: 287 },
                    { month: 'Mar', revenue: 12345.67, sales: 356 },
                    { month: 'Apr', revenue: 11234.56, sales: 398 },
                    { month: 'May', revenue: 13456.78, sales: 445 },
                    { month: 'Jun', revenue: 15678.90, sales: 512 },
                    { month: 'Jul', revenue: 14567.89, sales: 478 }
                ]
            },
            inventory: {
                lowStockProducts: [
                    { name: 'Memory Care Package', stock: 23, threshold: 50 },
                    { name: 'Digital Memory Frame', stock: 45, threshold: 100 }
                ],
                totalValue: 234567.89,
                averageRating: 4.7,
                totalReviews: 1247
            },
            recentActivity: [
                {
                    id: 1,
                    action: 'Product Created',
                    product: 'Memory Box Premium v2',
                    user: 'Sarah Wilson',
                    timestamp: '2 hours ago',
                    status: 'success'
                },
                {
                    id: 2,
                    action: 'Price Updated',
                    product: 'Digital Memory Frame',
                    user: 'Mike Johnson',
                    timestamp: '4 hours ago',
                    status: 'success'
                },
                {
                    id: 3,
                    action: 'Stock Alert',
                    product: 'Memory Care Package',
                    user: 'System',
                    timestamp: '6 hours ago',
                    status: 'warning'
                },
                {
                    id: 4,
                    action: 'Review Added',
                    product: 'Vintage Photo Album',
                    user: 'Customer',
                    timestamp: '8 hours ago',
                    status: 'success'
                },
                {
                    id: 5,
                    action: 'Product Archived',
                    product: 'Old Template Pack',
                    user: 'Alex Chen',
                    timestamp: '1 day ago',
                    status: 'info'
                }
            ]
        };

        setProductData(mockProductData);
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <CheckCircle className="text-green-500" size={16} />;
            case 'draft': return <Clock className="text-yellow-500" size={16} />;
            case 'archived': return <Archive className="text-gray-500" size={16} />;
            case 'success': return <CheckCircle className="text-green-500" size={16} />;
            case 'warning': return <AlertCircle className="text-yellow-500" size={16} />;
            case 'info': return <Info className="text-blue-500" size={16} />;
            default: return <Clock className="text-gray-500" size={16} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'archived': return 'bg-gray-100 text-gray-800';
            case 'success': return 'bg-green-100 text-green-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'info': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryIcon = (category) => {
        const categoryData = productData.categories?.find(c => c.name === category);
        return categoryData?.icon || Package;
    };

    const getCategoryColor = (category) => {
        const colors = {
            subscription: 'bg-blue-100 text-blue-800',
            physical: 'bg-green-100 text-green-800',
            hardware: 'bg-purple-100 text-purple-800',
            bundle: 'bg-orange-100 text-orange-800',
            digital: 'bg-indigo-100 text-indigo-800',
            gift: 'bg-pink-100 text-pink-800',
            service: 'bg-gray-100 text-gray-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
        }

        if (hasHalfStar) {
            stars.push(<Star key="half" size={14} className="fill-yellow-200 text-yellow-400" />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<StarOff key={`empty-${i}`} size={14} className="text-gray-300" />);
        }

        return stars;
    };

    const filteredProducts = productData.products?.filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesStatus && matchesSearch;
    }) || [];

    const productKPIs = [
        {
            title: 'Total Products',
            value: productData.overview?.totalProducts?.toLocaleString() || '0',
            change: 15.8,
            icon: Package,
            color: 'blue',
            description: 'All products in catalog'
        },
        {
            title: 'Active Products',
            value: productData.overview?.activeProducts?.toLocaleString() || '0',
            change: 8.3,
            icon: CheckCircle,
            color: 'green',
            description: 'Currently available'
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(productData.overview?.totalRevenue || 0),
            change: 23.7,
            icon: DollarSign,
            color: 'purple',
            description: 'All-time revenue'
        },
        {
            title: 'Average Rating',
            value: `${productData.overview?.avgRating || 0}/5`,
            change: 2.1,
            icon: Star,
            color: 'indigo',
            description: 'Customer satisfaction'
        },
        {
            title: 'Total Reviews',
            value: productData.overview?.totalReviews?.toLocaleString() || '0',
            change: 34.5,
            icon: Users,
            color: 'orange',
            description: 'Customer feedback'
        },
        {
            title: 'Conversion Rate',
            value: `${productData.overview?.conversionRate || 0}%`,
            change: -5.2,
            icon: Target,
            color: 'red',
            description: 'Visitor to purchase'
        }
    ];

    const getChangeIcon = (change) => {
        if (change > 0) return <ArrowUp size={16} className="text-green-600" />;
        if (change < 0) return <ArrowDown size={16} className="text-red-600" />;
        return null;
    };

    const getChangeColor = (change) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    if (statsLoading) {
        return (
            <AdminLayout title="Products">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Products">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                        <p className="text-gray-600">Manage your Memory Box product catalog and inventory</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Categories</option>
                            {productData.categories?.map((category) => (
                                <option key={category.name} value={category.name}>
                                    {category.label} ({category.count})
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                        </select>
                        <div className="flex border rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                <Grid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                <List size={16} />
                            </button>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <Plus size={16} />
                            <span>Add Product</span>
                        </button>
                        <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2">
                            <RefreshCw size={16} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Product KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productKPIs.map((kpi, index) => {
                        const Icon = kpi.icon;
                        const colorClasses = {
                            blue: 'bg-blue-100 text-blue-600',
                            green: 'bg-green-100 text-green-600',
                            purple: 'bg-purple-100 text-purple-600',
                            indigo: 'bg-indigo-100 text-indigo-600',
                            orange: 'bg-orange-100 text-orange-600',
                            red: 'bg-red-100 text-red-600'
                        };
                        
                        return (
                            <div key={index} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                                        <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                                        <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${colorClasses[kpi.color]}`}>
                                        <Icon size={24} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center">
                                    {getChangeIcon(kpi.change)}
                                    <span className={`ml-1 text-sm font-medium ${getChangeColor(kpi.change)}`}>
                                        {Math.abs(kpi.change)}% vs last period
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Low Stock Alert */}
                {productData.inventory?.lowStockProducts?.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <AlertCircle className="mr-2 text-yellow-600" size={20} />
                            Low Stock Alert
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {productData.inventory.lowStockProducts.map((product, index) => (
                                <div key={index} className="bg-white rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900">{product.name}</span>
                                        <span className="text-sm text-yellow-600">Low Stock</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <div>Current Stock: {product.stock} units</div>
                                        <div>Threshold: {product.threshold} units</div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-yellow-500 h-2 rounded-full"
                                                style={{ width: `${(product.stock / product.threshold) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Categories Overview */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Product Categories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {productData.categories?.map((category) => {
                            const Icon = category.icon;
                            return (
                                <div 
                                    key={category.name} 
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                        selectedCategory === category.name 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setSelectedCategory(category.name)}
                                >
                                    <div className="text-center">
                                        <Icon size={32} className={`mx-auto mb-2 ${
                                            selectedCategory === category.name ? 'text-blue-600' : 'text-gray-600'
                                        }`} />
                                        <div className="font-medium text-gray-900">{category.label}</div>
                                        <div className="text-sm text-gray-500">{category.count} product{category.count !== 1 ? 's' : ''}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Products List/Grid */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Products ({filteredProducts.length})
                        </h2>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                                Showing {filteredProducts.length} of {productData.products?.length || 0}
                            </span>
                        </div>
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => {
                                const CategoryIcon = getCategoryIcon(product.category);
                                return (
                                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                                        <div className="relative mb-4">
                                            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Image size={48} className="text-gray-400" />
                                            </div>
                                            {product.isPopular && (
                                                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                                    Popular
                                                </div>
                                            )}
                                            {product.isFeatured && (
                                                <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                                                    Featured
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="mb-3">
                                            <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-1">
                                                {getStatusIcon(product.status)}
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                                                    {product.status}
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                                                {product.category}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="text-lg font-bold text-gray-900">
                                                {formatCurrency(product.price)}
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {renderStars(product.rating)}
                                                <span className="text-sm text-gray-600">({product.reviews})</span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-sm text-gray-600 mb-3">
                                            <div>Sales: {product.sales.toLocaleString()}</div>
                                            <div>Revenue: {formatCurrency(product.revenue)}</div>
                                            {product.stock !== null && (
                                                <div>Stock: {product.stock} units</div>
                                            )}
                                        </div>
                                        
                                        <div className="flex space-x-2">
                                            <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                                                <Edit size={14} className="inline mr-1" />
                                                Edit
                                            </button>
                                            <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
                                                <Eye size={14} />
                                            </button>
                                            <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                                                <Image size={24} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900 flex items-center">
                                                    {product.name}
                                                    {product.isPopular && (
                                                        <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                                            Popular
                                                        </span>
                                                    )}
                                                    {product.isFeatured && (
                                                        <span className="ml-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                                                            Featured
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-gray-500">{product.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(product.status)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                                                {product.status}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                                                {product.category}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4 text-sm">
                                        <div>
                                            <div className="text-gray-600">Price</div>
                                            <div className="font-medium">{formatCurrency(product.price)}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Rating</div>
                                            <div className="flex items-center">
                                                <Star size={14} className="text-yellow-400 mr-1" />
                                                <span className="font-medium">{product.rating}</span>
                                                <span className="text-gray-500 ml-1">({product.reviews})</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Sales</div>
                                            <div className="font-medium">{product.sales.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Revenue</div>
                                            <div className="font-medium">{formatCurrency(product.revenue)}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">SKU</div>
                                            <div className="font-medium">{product.sku}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Stock</div>
                                            <div className="font-medium">{product.stock !== null ? `${product.stock} units` : 'Digital'}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-wrap gap-1">
                                            {product.tags?.slice(0, 3).map((tag, tagIndex) => (
                                                <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="text-blue-600 hover:text-blue-800" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button className="text-green-600 hover:text-green-800" title="View">
                                                <Eye size={16} />
                                            </button>
                                            <button className="text-purple-600 hover:text-purple-800" title="Duplicate">
                                                <Copy size={16} />
                                            </button>
                                            <button className="text-orange-600 hover:text-orange-800" title="Archive">
                                                <Archive size={16} />
                                            </button>
                                            <button className="text-red-600 hover:text-red-800" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sales Analytics & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Selling Products */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Top Selling Products</h2>
                        <div className="space-y-3">
                            {productData.salesAnalytics?.topSellingProducts?.map((product, index) => {
                                const maxSales = Math.max(...productData.salesAnalytics.topSellingProducts.map(p => p.sales));
                                const percentage = (product.sales / maxSales) * 100;
                                
                                return (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-xs text-gray-500">{formatCurrency(product.revenue)}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900 w-12 text-right">
                                                {product.sales}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                        <div className="space-y-3">
                            {productData.recentActivity?.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                                    <div className="flex items-center">
                                        {getStatusIcon(activity.status)}
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">
                                                {activity.action} • {activity.product}
                                            </div>
                                            <div className="text-xs text-gray-500">by {activity.user}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">{activity.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Product Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
                    <div className="flex items-center mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Product Portfolio Overview</h3>
                            <p className="text-sm text-gray-600">Complete catalog performance and insights</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white rounded p-4">
                            <strong>Product Health:</strong> {productData.overview?.activeProducts} active products generating {formatCurrency(productData.overview?.totalRevenue || 0)} in total revenue with {productData.overview?.avgRating}/5 average rating.
                        </div>
                        <div className="bg-white rounded p-4">
                            <strong>Customer Satisfaction:</strong> {productData.overview?.totalReviews?.toLocaleString()} customer reviews with {productData.overview?.conversionRate}% conversion rate across all product categories.
                        </div>
                        <div className="bg-white rounded p-4">
                            <strong>Inventory Status:</strong> {productData.overview?.totalProducts} total products across {productData.categories?.length} categories with {productData.inventory?.lowStockProducts?.length || 0} products requiring restocking.
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ProductPage;
