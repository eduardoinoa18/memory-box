import { useState, useEffect } from 'react';
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import AdminLayout from '../../layouts/AdminLayout';
import {
    PlusCircle,
    Edit3,
    Trash2,
    Save,
    Eye,
    EyeOff,
    Calendar,
    User,
    FileText,
    Globe,
    Settings,
    ExternalLink,
    RefreshCw,
    Download
} from 'lucide-react';

const CmsPage = () => {
    const [activeTab, setActiveTab] = useState('landing');
    const [blogPosts, setBlogPosts] = useState([]);
    const [landingData, setLandingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    // Landing page localStorage data
    const [landingPageData, setLandingPageData] = useState({
        users: [],
        cms: {},
        analytics: { pageViews: 0, signUps: 0 }
    });

    // Blog post form state
    const [postForm, setPostForm] = useState({
        title: '',
        body: '',
        excerpt: '',
        author: 'Admin',
        published: false,
        tags: []
    });

    // Landing page form state (updated for our actual landing page)
    const [landingForm, setLandingForm] = useState({
        heroTitle: 'Cherish Family Memories Forever',
        heroDescription: 'The easiest way to store, organize, and share your family\'s most treasured moments.',
        features: [
            {
                title: 'Effortless Uploads',
                description: 'Easily add photos, videos, voice notes, and more to your family memory collection.',
                icon: '📷'
            },
            {
                title: 'Organize & Share',
                description: 'Organize memories into folders and share them with family and friends.',
                icon: '🔗'
            },
            {
                title: 'Secure & Accessible',
                description: 'Your memories are securely stored and accessible on all your devices.',
                icon: '🔒'
            }
        ],
        ctaTitle: 'Ready to preserve your family memories?',
        ctaDescription: 'Join thousands of families already using Memory Box'
    });

    useEffect(() => {
        loadCmsData();
        loadLandingPageData();
    }, []);

    // Load data from localStorage (for landing page integration)
    const loadLandingPageData = () => {
        try {
            const users = JSON.parse(localStorage.getItem('memorybox_users') || '[]');
            const cms = JSON.parse(localStorage.getItem('memorybox_cms') || '{}');
            const pageViews = parseInt(localStorage.getItem('memorybox_pageviews') || '0');
            
            const data = {
                users: users,
                cms: cms,
                analytics: {
                    pageViews: pageViews,
                    signUps: users.length
                }
            };
            
            setLandingPageData(data);
            
            // Load existing CMS data into form
            if (cms.heroTitle || cms.heroDescription) {
                setLandingForm(prev => ({
                    ...prev,
                    heroTitle: cms.heroTitle || prev.heroTitle,
                    heroDescription: cms.heroDescription || prev.heroDescription,
                    ctaTitle: cms.ctaTitle || prev.ctaTitle,
                    ctaDescription: cms.ctaDescription || prev.ctaDescription
                }));
            }
        } catch (error) {
            console.error('Error loading landing page data:', error);
        }
    };

    // Save landing page content to localStorage
    const saveLandingPageContent = () => {
        try {
            setSaving(true);
            const cmsData = {
                heroTitle: landingForm.heroTitle,
                heroDescription: landingForm.heroDescription,
                ctaTitle: landingForm.ctaTitle,
                ctaDescription: landingForm.ctaDescription,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem('memorybox_cms', JSON.stringify(cmsData));
            
            // Refresh the data
            loadLandingPageData();
            
            alert('Landing page content updated successfully!');
        } catch (error) {
            console.error('Error saving landing page content:', error);
            alert('Error saving content. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Export landing page data
    const exportLandingPageData = () => {
        const dataStr = JSON.stringify(landingPageData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `memory-box-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const loadCmsData = async () => {
        try {
            setLoading(true);
            await Promise.all([loadBlogPosts(), loadLandingData()]);
        } catch (error) {
            console.error('Error loading CMS data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadBlogPosts = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'cms/blog/posts'));
            const posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBlogPosts(posts.sort((a, b) => (b.createdAt?.toDate() || new Date()) - (a.createdAt?.toDate() || new Date())));
        } catch (error) {
            console.error('Error loading blog posts:', error);
        }
    };

    const loadLandingData = async () => {
        try {
            const docRef = doc(db, 'cms', 'landing');
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                setLandingData(data);
                setLandingForm(data);
            } else {
                // Initialize with default data
                const defaultData = {
                    heroTagline: 'Preserve Family Memories Forever',
                    heroSubtitle: 'Capture, organize, and share your most precious moments with our AI-powered memory platform.',
                    pricingTable: [
                        {
                            name: 'Free',
                            price: 0,
                            features: ['500 MB Storage', '50 Memories', 'Basic Folders']
                        },
                        {
                            name: 'Premium',
                            price: 9.99,
                            features: ['10 GB Storage', 'Unlimited Memories', 'Advanced Folders', 'AI Letters']
                        },
                        {
                            name: 'Family',
                            price: 19.99,
                            features: ['50 GB Storage', 'Up to 6 Users', 'Family Sharing', 'Priority Support']
                        }
                    ],
                    testimonials: [
                        {
                            name: 'Sarah Johnson',
                            text: 'MemoryBox has transformed how our family shares memories. The AI letters are incredible!',
                            rating: 5
                        }
                    ],
                    features: [
                        {
                            title: 'AI-Powered Organization',
                            description: 'Automatically categorize and tag your memories',
                            icon: 'brain'
                        },
                        {
                            title: 'Family Sharing',
                            description: 'Share memories securely with family members',
                            icon: 'users'
                        },
                        {
                            title: 'Letter Generation',
                            description: 'Create beautiful letters from your memories',
                            icon: 'mail'
                        }
                    ]
                };
                setLandingData(defaultData);
                setLandingForm(defaultData);
            }
        } catch (error) {
            console.error('Error loading landing data:', error);
        }
    };

    const saveBlogPost = async () => {
        try {
            setSaving(true);
            const postData = {
                ...postForm,
                updatedAt: serverTimestamp(),
                ...(editingPost ? {} : { createdAt: serverTimestamp() })
            };

            if (editingPost) {
                await updateDoc(doc(db, 'cms/blog/posts', editingPost.id), postData);
            } else {
                await addDoc(collection(db, 'cms/blog/posts'), postData);
            }

            setEditingPost(null);
            setPostForm({
                title: '',
                body: '',
                excerpt: '',
                author: 'Admin',
                published: false,
                tags: []
            });
            await loadBlogPosts();
        } catch (error) {
            console.error('Error saving blog post:', error);
        } finally {
            setSaving(false);
        }
    };

    const saveLandingData = async () => {
        try {
            setSaving(true);
            await setDoc(doc(db, 'cms', 'landing'), {
                ...landingForm,
                updatedAt: serverTimestamp()
            });
            setLandingData(landingForm);
        } catch (error) {
            console.error('Error saving landing data:', error);
        } finally {
            setSaving(false);
        }
    };

    const deleteBlogPost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await deleteDoc(doc(db, 'cms/blog/posts', postId));
                await loadBlogPosts();
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    const togglePostPublication = async (post) => {
        try {
            await updateDoc(doc(db, 'cms/blog/posts', post.id), {
                published: !post.published,
                updatedAt: serverTimestamp()
            });
            await loadBlogPosts();
        } catch (error) {
            console.error('Error toggling publication:', error);
        }
    };

    const startEditingPost = (post) => {
        setEditingPost(post);
        setPostForm({
            title: post.title || '',
            body: post.body || '',
            excerpt: post.excerpt || '',
            author: post.author || 'Admin',
            published: post.published || false,
            tags: post.tags || []
        });
        setActiveTab('blog-editor');
    };

    const addPricingTier = () => {
        setLandingForm(prev => ({
            ...prev,
            pricingTable: [...prev.pricingTable, {
                name: '',
                price: 0,
                features: ['']
            }]
        }));
    };

    const updatePricingTier = (index, field, value) => {
        setLandingForm(prev => ({
            ...prev,
            pricingTable: prev.pricingTable.map((tier, i) => 
                i === index ? { ...tier, [field]: value } : tier
            )
        }));
    };

    const addTestimonial = () => {
        setLandingForm(prev => ({
            ...prev,
            testimonials: [...prev.testimonials, {
                name: '',
                text: '',
                rating: 5
            }]
        }));
    };

    const updateTestimonial = (index, field, value) => {
        setLandingForm(prev => ({
            ...prev,
            testimonials: prev.testimonials.map((testimonial, i) => 
                i === index ? { ...testimonial, [field]: value } : testimonial
            )
        }));
    };

    if (loading) {
        return (
            <AdminLayout title="Content Management">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Content Management">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
                        <p className="text-gray-600">Manage blog posts and landing page content</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'blog', name: 'Blog Posts', icon: FileText },
                            { id: 'blog-editor', name: 'Post Editor', icon: Edit3 },
                            { id: 'landing', name: 'Landing Page', icon: Globe }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className="w-4 h-4 mr-2" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Blog Posts Tab */}
                {activeTab === 'blog' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Blog Posts</h2>
                            <button
                                onClick={() => {
                                    setEditingPost(null);
                                    setPostForm({
                                        title: '',
                                        body: '',
                                        excerpt: '',
                                        author: 'Admin',
                                        published: false,
                                        tags: []
                                    });
                                    setActiveTab('blog-editor');
                                }}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <PlusCircle className="w-4 h-4 mr-2" />
                                New Post
                            </button>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200">
                            {blogPosts.length === 0 ? (
                                <div className="p-8 text-center">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
                                    <p className="text-gray-600">Create your first blog post to get started</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {blogPosts.map((post) => (
                                        <div key={post.id} className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {post.title}
                                                        </h3>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            post.published 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {post.published ? 'Published' : 'Draft'}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 mt-1">{post.excerpt}</p>
                                                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                        <span className="flex items-center">
                                                            <User className="w-4 h-4 mr-1" />
                                                            {post.author}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            {post.createdAt?.toDate()?.toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => togglePostPublication(post)}
                                                        className={`p-2 rounded-lg ${
                                                            post.published 
                                                                ? 'text-green-600 hover:bg-green-50' 
                                                                : 'text-gray-400 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {post.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => startEditingPost(post)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteBlogPost(post.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Blog Editor Tab */}
                {activeTab === 'blog-editor' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">
                                {editingPost ? 'Edit Post' : 'New Post'}
                            </h2>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setActiveTab('blog')}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveBlogPost}
                                    disabled={saving || !postForm.title || !postForm.body}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Post'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={postForm.title}
                                            onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter post title..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Excerpt
                                        </label>
                                        <textarea
                                            value={postForm.excerpt}
                                            onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Brief description for SEO and previews..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Body
                                        </label>
                                        <textarea
                                            value={postForm.body}
                                            onChange={(e) => setPostForm(prev => ({ ...prev, body: e.target.value }))}
                                            rows={15}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Write your blog post content here..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Author
                                        </label>
                                        <input
                                            type="text"
                                            value={postForm.author}
                                            onChange={(e) => setPostForm(prev => ({ ...prev, author: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={postForm.published}
                                                onChange={(e) => setPostForm(prev => ({ ...prev, published: e.target.checked }))}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Published</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Landing Page Tab */}
                {activeTab === 'landing' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Landing Page Content</h2>
                            <div className="flex space-x-3">
                                <button
                                    onClick={saveLandingData}
                                    disabled={saving}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={saveLandingPageContent}
                                    disabled={saving}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save to LocalStorage'}
                                </button>
                                <button
                                    onClick={exportLandingPageData}
                                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Data
                                </button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Hero Section */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Hero Section</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Main Tagline
                                        </label>
                                        <input
                                            type="text"
                                            value={landingForm.heroTagline}
                                            onChange={(e) => setLandingForm(prev => ({ ...prev, heroTagline: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subtitle
                                        </label>
                                        <textarea
                                            value={landingForm.heroSubtitle}
                                            onChange={(e) => setLandingForm(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Table */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Pricing Table</h3>
                                    <button
                                        onClick={addPricingTier}
                                        className="flex items-center px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                                    >
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                        Add Tier
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {landingForm.pricingTable.map((tier, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <input
                                                type="text"
                                                value={tier.name}
                                                onChange={(e) => updatePricingTier(index, 'name', e.target.value)}
                                                placeholder="Plan name"
                                                className="w-full mb-2 px-2 py-1 border border-gray-300 rounded text-sm"
                                            />
                                            <input
                                                type="number"
                                                value={tier.price}
                                                onChange={(e) => updatePricingTier(index, 'price', parseFloat(e.target.value))}
                                                placeholder="Price"
                                                className="w-full mb-2 px-2 py-1 border border-gray-300 rounded text-sm"
                                            />
                                            <textarea
                                                value={tier.features.join('\n')}
                                                onChange={(e) => updatePricingTier(index, 'features', e.target.value.split('\n'))}
                                                placeholder="Features (one per line)"
                                                rows={4}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Testimonials */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Testimonials</h3>
                                    <button
                                        onClick={addTestimonial}
                                        className="flex items-center px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                                    >
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                        Add Testimonial
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {landingForm.testimonials.map((testimonial, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <input
                                                    type="text"
                                                    value={testimonial.name}
                                                    onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                                                    placeholder="Customer name"
                                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    value={testimonial.rating}
                                                    onChange={(e) => updateTestimonial(index, 'rating', parseInt(e.target.value))}
                                                    min="1"
                                                    max="5"
                                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                                />
                                                <textarea
                                                    value={testimonial.text}
                                                    onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                                                    placeholder="Testimonial text"
                                                    rows={2}
                                                    className="md:col-span-3 px-2 py-1 border border-gray-300 rounded text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default CmsPage;
