import React from 'react';
import { X, Home, Users, Building2, MessageSquare, Image, Play, ArrowRight, DollarSign, HelpCircle, UserCheck, BarChart3, Camera, FileText, Download, MapPin } from 'lucide-react';

const SectionLibrary = ({ onClose, onAddSection }) => {
    const sectionTypes = [
        {
            type: 'hero',
            name: 'Hero Section',
            description: 'Eye-catching banner with title, subtitle, and CTA',
            icon: Home,
            color: 'bg-blue-500'
        },
        {
            type: 'features',
            name: 'Features',
            description: 'Highlight key features with icons and descriptions',
            icon: Users,
            color: 'bg-green-500'
        },
        {
            type: 'properties',
            name: 'Properties',
            description: 'Showcase featured properties in a grid layout',
            icon: Building2,
            color: 'bg-purple-500'
        },
        {
            type: 'contact',
            name: 'Contact Form',
            description: 'Contact form with company information',
            icon: MessageSquare,
            color: 'bg-orange-500'
        },
        {
            type: 'text',
            name: 'Text Content',
            description: 'Rich text content with title and description',
            icon: FileText,
            color: 'bg-gray-500'
        },
        {
            type: 'image',
            name: 'Image',
            description: 'Single image with optional title and caption',
            icon: Image,
            color: 'bg-pink-500'
        },
        {
            type: 'video',
            name: 'Video',
            description: 'Embedded video with title and description',
            icon: Play,
            color: 'bg-red-500'
        },
        {
            type: 'cta',
            name: 'Call to Action',
            description: 'Prominent CTA button with title and subtitle',
            icon: ArrowRight,
            color: 'bg-indigo-500'
        },
        {
            type: 'pricing',
            name: 'Pricing',
            description: 'Pricing plans with features and CTA buttons',
            icon: DollarSign,
            color: 'bg-yellow-500'
        },
        {
            type: 'faq',
            name: 'FAQ',
            description: 'Frequently asked questions with expandable answers',
            icon: HelpCircle,
            color: 'bg-teal-500'
        },
        {
            type: 'team',
            name: 'Team',
            description: 'Team members with photos and social links',
            icon: UserCheck,
            color: 'bg-cyan-500'
        },
        {
            type: 'stats',
            name: 'Statistics',
            description: 'Key statistics and numbers with icons',
            icon: BarChart3,
            color: 'bg-emerald-500'
        },
        {
            type: 'gallery',
            name: 'Gallery',
            description: 'Image gallery with lightbox functionality',
            icon: Camera,
            color: 'bg-violet-500'
        },
        {
            type: 'form',
            name: 'Custom Form',
            description: 'Customizable form with various field types',
            icon: MessageSquare,
            color: 'bg-rose-500'
        },
        {
            type: 'testimonials',
            name: 'Testimonials',
            description: 'Customer testimonials with ratings and photos',
            icon: Users,
            color: 'bg-amber-500'
        },
        {
            type: 'lead-magnet',
            name: 'Lead Magnet',
            description: 'Lead capture form with downloadable content',
            icon: Download,
            color: 'bg-lime-500'
        },
        {
            type: 'project-showcase',
            name: 'Project Showcase',
            description: 'Real estate project showcase with tabs and details',
            icon: MapPin,
            color: 'bg-indigo-500'
        },
        {
            type: 'custom',
            name: 'Custom HTML',
            description: 'Custom HTML and CSS content',
            icon: FileText,
            color: 'bg-slate-500'
        }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Add Section</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sectionTypes.map((section) => {
                            const IconComponent = section.icon;
                            return (
                                <div
                                    key={section.type}
                                    onClick={() => onAddSection(section.type)}
                                    className="p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg cursor-pointer transition-all duration-200 group"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className={`p-3 rounded-lg ${section.color} text-white mr-4`}>
                                            <IconComponent className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                                            {section.name}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-600 group-hover:text-gray-700">
                                        {section.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SectionLibrary;
