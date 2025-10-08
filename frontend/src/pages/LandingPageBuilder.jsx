import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus,
    Save,
    Eye,
    Settings,
    Palette,
    Type,
    Layout,
    ArrowLeft,
    Trash2,
    Copy,
    MoveUp,
    MoveDown,
    Edit3
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import SectionRenderer from '../components/landing-page/SectionRenderer';
import SectionEditor from '../components/landing-page/SectionEditor';
import SectionLibrary from '../components/landing-page/SectionLibrary';
import BulkTextEditor from '../components/landing-page/BulkTextEditor';
// Generate unique ID function
const generateId = () => {
    return 'section_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

const LandingPageBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [landingPage, setLandingPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSectionLibrary, setShowSectionLibrary] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [activeTab, setActiveTab] = useState('content');
    const [previewMode, setPreviewMode] = useState(false);
    const [showBulkEditor, setShowBulkEditor] = useState(false);

    useEffect(() => {
        if (id) {
            fetchLandingPage();
        } else {
            // Create new landing page
            setLandingPage({
                title: 'New Landing Page',
                slug: 'new-landing-page',
                description: '',
                template: 'custom',
                content: {
                    hero: {
                        title: 'Welcome to Our Platform',
                        subtitle: 'Discover amazing properties and find your dream home',
                        ctaText: 'Get Started',
                        ctaLink: '#contact',
                        backgroundColor: '#3B82F6',
                        textColor: '#FFFFFF'
                    },
                    sections: [],
                    footer: {
                        text: 'Your trusted partner in real estate',
                        links: [],
                        socialLinks: [],
                        backgroundColor: '#1E293B',
                        textColor: '#FFFFFF'
                    }
                },
                styling: {
                    primaryColor: '#3B82F6',
                    secondaryColor: '#1E40AF',
                    fontFamily: 'Inter',
                    customCss: ''
                },
                seo: {
                    metaTitle: '',
                    metaDescription: '',
                    keywords: []
                },
                isPublished: false,
                isActive: true
            });
            setLoading(false);
        }
    }, [id]);

    const fetchLandingPage = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/lead-generation/landing-pages/${id}`);
            setLandingPage(response.data);
        } catch (error) {
            console.error('Error fetching landing page:', error);
            toast.error('Failed to load landing page');
        } finally {
            setLoading(false);
        }
    };

    const saveLandingPage = async () => {
        try {
            setSaving(true);
            if (id) {
                await api.put(`/lead-generation/landing-pages/${id}`, landingPage);
                toast.success('Landing page updated successfully');
            } else {
                const response = await api.post('/lead-generation/landing-pages', landingPage);
                setLandingPage(response.data);
                navigate(`/landing-pages/builder/${response.data._id}`);
                toast.success('Landing page created successfully');
            }
        } catch (error) {
            console.error('Error saving landing page:', error);
            toast.error('Failed to save landing page');
        } finally {
            setSaving(false);
        }
    };

    const addSection = (sectionType) => {
        const newSection = {
            id: generateId(),
            type: sectionType,
            title: '',
            subtitle: '',
            content: '',
            backgroundColor: 'transparent',
            textColor: '#1E293B',
            padding: '2rem 0',
            margin: '0',
            order: landingPage.content.sections.length,
            isVisible: true,
            styling: {},
            layout: {
                columns: 3,
                alignment: 'center',
                spacing: 'normal'
            }
        };

        setLandingPage({
            ...landingPage,
            content: {
                ...landingPage.content,
                sections: [...landingPage.content.sections, newSection]
            }
        });
        setShowSectionLibrary(false);
        setEditingSection(newSection);
    };

    const updateSection = (sectionId, updates) => {
        setLandingPage({
            ...landingPage,
            content: {
                ...landingPage.content,
                sections: landingPage.content.sections.map(section =>
                    section.id === sectionId ? { ...section, ...updates } : section
                )
            }
        });
    };

    const deleteSection = (sectionId) => {
        setLandingPage({
            ...landingPage,
            content: {
                ...landingPage.content,
                sections: landingPage.content.sections.filter(section => section.id !== sectionId)
            }
        });
    };

    const moveSection = (sectionId, direction) => {
        const sections = [...landingPage.content.sections];
        const index = sections.findIndex(section => section.id === sectionId);

        if (direction === 'up' && index > 0) {
            [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
        } else if (direction === 'down' && index < sections.length - 1) {
            [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
        }

        // Update order values
        sections.forEach((section, idx) => {
            section.order = idx;
        });

        setLandingPage({
            ...landingPage,
            content: {
                ...landingPage.content,
                sections
            }
        });
    };

    const duplicateSection = (sectionId) => {
        const section = landingPage.content.sections.find(s => s.id === sectionId);
        if (section) {
            const duplicatedSection = {
                ...section,
                id: generateId(),
                title: section.title ? `${section.title} (Copy)` : section.title,
                order: landingPage.content.sections.length
            };

            setLandingPage({
                ...landingPage,
                content: {
                    ...landingPage.content,
                    sections: [...landingPage.content.sections, duplicatedSection]
                }
            });
        }
    };

    const toggleSectionVisibility = (sectionId) => {
        updateSection(sectionId, {
            isVisible: !landingPage.content.sections.find(s => s.id === sectionId).isVisible
        });
    };

    const updatePageSettings = (updates) => {
        setLandingPage({
            ...landingPage,
            ...updates
        });
    };

    const updateSections = (updatedSections) => {
        setLandingPage({
            ...landingPage,
            content: {
                ...landingPage.content,
                sections: updatedSections
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading landing page builder...</p>
                </div>
            </div>
        );
    }

    if (!landingPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Landing page not found</h1>
                    <button
                        onClick={() => navigate('/landing-pages')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                        Back to Landing Pages
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/landing-pages')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">
                                {landingPage.title || 'Untitled Landing Page'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {previewMode ? 'Preview Mode' : 'Builder Mode'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className={`flex items-center px-4 py-2 rounded-lg ${previewMode
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-blue-100 text-blue-700'
                                }`}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {previewMode ? 'Edit' : 'Preview'}
                        </button>

                        <button
                            onClick={saveLandingPage}
                            disabled={saving}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                {!previewMode && (
                    <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
                        <div className="p-6">
                            <div className="flex space-x-1 mb-6">
                                <button
                                    onClick={() => setActiveTab('content')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'content'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Layout className="h-4 w-4 mr-2 inline" />
                                    Content
                                </button>
                                <button
                                    onClick={() => setActiveTab('design')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'design'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Palette className="h-4 w-4 mr-2 inline" />
                                    Design
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'settings'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Settings className="h-4 w-4 mr-2 inline" />
                                    Settings
                                </button>
                            </div>

                            {activeTab === 'content' && (
                                <div>
                                    <button
                                        onClick={() => setShowSectionLibrary(true)}
                                        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
                                    >
                                        <Plus className="h-5 w-5 mr-2" />
                                        Add Section
                                    </button>

                                    <button
                                        onClick={() => setShowBulkEditor(true)}
                                        className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 mb-6"
                                    >
                                        <Edit3 className="h-5 w-5 mr-2" />
                                        Bulk Edit Text
                                    </button>

                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-gray-700 mb-3">Sections</h3>
                                        {landingPage.content.sections.map((section, index) => (
                                            <div
                                                key={section.id}
                                                className={`p-3 rounded-lg border cursor-pointer ${editingSection?.id === section.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => setEditingSection(section)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-3"></div>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {section.title || `${section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section`}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleSectionVisibility(section.id);
                                                            }}
                                                            className="p-1 hover:bg-gray-200 rounded"
                                                        >
                                                            <Eye className={`h-4 w-4 ${section.isVisible ? 'text-gray-600' : 'text-gray-400'}`} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                duplicateSection(section.id);
                                                            }}
                                                            className="p-1 hover:bg-gray-200 rounded"
                                                        >
                                                            <Copy className="h-4 w-4 text-gray-600" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteSection(section.id);
                                                            }}
                                                            className="p-1 hover:bg-red-100 rounded"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'design' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Primary Color
                                        </label>
                                        <input
                                            type="color"
                                            value={landingPage.styling.primaryColor}
                                            onChange={(e) => updatePageSettings({
                                                styling: { ...landingPage.styling, primaryColor: e.target.value }
                                            })}
                                            className="w-full h-10 rounded-lg border border-gray-300"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Secondary Color
                                        </label>
                                        <input
                                            type="color"
                                            value={landingPage.styling.secondaryColor}
                                            onChange={(e) => updatePageSettings({
                                                styling: { ...landingPage.styling, secondaryColor: e.target.value }
                                            })}
                                            className="w-full h-10 rounded-lg border border-gray-300"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Font Family
                                        </label>
                                        <select
                                            value={landingPage.styling.fontFamily}
                                            onChange={(e) => updatePageSettings({
                                                styling: { ...landingPage.styling, fontFamily: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="Inter">Inter</option>
                                            <option value="Roboto">Roboto</option>
                                            <option value="Open Sans">Open Sans</option>
                                            <option value="Lato">Lato</option>
                                            <option value="Poppins">Poppins</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Page Title
                                        </label>
                                        <input
                                            type="text"
                                            value={landingPage.title}
                                            onChange={(e) => updatePageSettings({ title: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Slug
                                        </label>
                                        <input
                                            type="text"
                                            value={landingPage.slug}
                                            onChange={(e) => updatePageSettings({ slug: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={landingPage.description}
                                            onChange={(e) => updatePageSettings({ description: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Meta Title
                                        </label>
                                        <input
                                            type="text"
                                            value={landingPage.seo.metaTitle}
                                            onChange={(e) => updatePageSettings({
                                                seo: { ...landingPage.seo, metaTitle: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Meta Description
                                        </label>
                                        <textarea
                                            value={landingPage.seo.metaDescription}
                                            onChange={(e) => updatePageSettings({
                                                seo: { ...landingPage.seo, metaDescription: e.target.value }
                                            })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="min-h-screen bg-white" style={{ fontFamily: landingPage.styling.fontFamily }}>
                        {/* Hero Section */}
                        {landingPage.content.hero && (
                            <SectionRenderer
                                section={{
                                    id: 'hero',
                                    type: 'hero',
                                    ...landingPage.content.hero
                                }}
                                isBuilder={!previewMode}
                                onEdit={() => setEditingSection({ id: 'hero', type: 'hero', ...landingPage.content.hero })}
                                onDelete={() => { }}
                                onMoveUp={() => { }}
                                onMoveDown={() => { }}
                                onToggleVisibility={() => { }}
                            />
                        )}

                        {/* Dynamic Sections */}
                        {landingPage.content.sections
                            .sort((a, b) => a.order - b.order)
                            .map((section) => (
                                <SectionRenderer
                                    key={section.id}
                                    section={section}
                                    isBuilder={!previewMode}
                                    onEdit={() => setEditingSection(section)}
                                    onDelete={deleteSection}
                                    onMoveUp={() => moveSection(section.id, 'up')}
                                    onMoveDown={() => moveSection(section.id, 'down')}
                                    onToggleVisibility={toggleSectionVisibility}
                                />
                            ))}

                        {/* Footer */}
                        {landingPage.content.footer && (
                            <footer
                                className="py-12"
                                style={{
                                    backgroundColor: landingPage.content.footer.backgroundColor,
                                    color: landingPage.content.footer.textColor
                                }}
                            >
                                <div className="max-w-6xl mx-auto px-6">
                                    <div className="text-center">
                                        <p className="text-lg mb-4">{landingPage.content.footer.text}</p>
                                        <div className="flex justify-center space-x-6">
                                            {landingPage.content.footer.links?.map((link, index) => (
                                                <a
                                                    key={index}
                                                    href={link.url}
                                                    className="hover:underline"
                                                    style={{ color: landingPage.content.footer.textColor }}
                                                >
                                                    {link.text}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </footer>
                        )}
                    </div>
                </div>
            </div>

            {/* Section Library Modal */}
            {showSectionLibrary && (
                <SectionLibrary
                    onClose={() => setShowSectionLibrary(false)}
                    onAddSection={addSection}
                />
            )}

            {/* Section Editor Modal */}
            {editingSection && (
                <SectionEditor
                    section={editingSection}
                    onClose={() => setEditingSection(null)}
                    onSave={(updates) => {
                        if (editingSection.id === 'hero') {
                            updatePageSettings({
                                content: {
                                    ...landingPage.content,
                                    hero: { ...landingPage.content.hero, ...updates }
                                }
                            });
                        } else {
                            updateSection(editingSection.id, updates);
                        }
                        setEditingSection(null);
                    }}
                />
            )}

            {/* Bulk Text Editor Modal */}
            {showBulkEditor && (
                <BulkTextEditor
                    sections={landingPage.content.sections}
                    onUpdateSections={updateSections}
                    onClose={() => setShowBulkEditor(false)}
                />
            )}
        </div>
    );
};

export default LandingPageBuilder;
