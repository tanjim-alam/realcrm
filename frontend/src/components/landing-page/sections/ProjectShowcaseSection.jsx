import React, { useState } from 'react';
import {
    MapPin,
    Building,
    Home,
    Ruler,
    Calendar,
    Download,
    Phone,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    Star,
    CheckCircle
} from 'lucide-react';
import BaseSection from '../BaseSection';

const ProjectShowcaseSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = 'Sobha Magnus',
        subtitle = 'Bannerghatta Road, Bangalore',
        developer = 'by Sobha Group',
        projectDetails = {
            totalUnits: '294',
            landArea: '4 Acres',
            unitTypes: '3 & 4 BHK',
            startingPrice: '₹..',
            reraNumber: 'Coming Soon',
            estimatedRate: '18,000 Per Sq.Ft',
            possessionTime: 'On Request'
        },
        amenities = [
            'Swimming Pool',
            'Gymnasium',
            'Club House',
            'Landscaped Gardens',
            'Children Play Area',
            'Power Backup',
            'Security',
            'Parking'
        ],
        contactInfo = {
            phone: '+91(IND) +971(UAE) +44(UK) +1(USA)',
            whatsapp: '+919380660766'
        },
        backgroundColor = '#FFFFFF',
        textColor = '#1E293B'
    } = section;

    const [activeTab, setActiveTab] = useState('overview');
    const [showAmenities, setShowAmenities] = useState(false);

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'configuration', label: 'Configuration' },
        { id: 'amenities', label: 'Amenities' },
        { id: 'price', label: 'Price' },
        { id: 'location', label: 'Location' },
        { id: 'gallery', label: 'Gallery' }
    ];

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                <h3 className="text-2xl font-bold mb-4" style={{ color: textColor }}>
                    {title}
                </h3>
                <p className="text-lg mb-4 opacity-75" style={{ color: textColor }}>
                    {subtitle}
                </p>
                <p className="text-sm font-medium text-blue-600 mb-6">
                    {developer}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                        <Building className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="text-sm" style={{ color: textColor }}>
                            Total Units: <strong>{projectDetails.totalUnits}</strong>
                        </span>
                    </div>
                    <div className="flex items-center">
                        <Ruler className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="text-sm" style={{ color: textColor }}>
                            Land Area: <strong>{projectDetails.landArea}</strong>
                        </span>
                    </div>
                </div>
            </div>

            <div className="prose max-w-none" style={{ color: textColor }}>
                <p className="text-lg leading-relaxed">
                    <strong>{title}</strong> is a premium residential enclave by Sobha Limited, located near Meenakshi Mall on Bannerghatta Road, South Bangalore. Spread across 4 acres with four elegant towers, it offers exclusive 3 & 4 BHK apartments designed for space, comfort, and sophistication.
                </p>
                <p className="mt-4 text-lg leading-relaxed">
                    With just ~294 homes, residents enjoy low-density living, world-class amenities, and seamless connectivity to Electronic City, JP Nagar, and top schools, hospitals, and malls. Backed by Sobha's unmatched construction quality, Sobha Magnus is where luxury meets convenience and long-term value.
                </p>
            </div>
        </div>
    );

    const renderConfiguration = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                        <h4 className="text-lg font-semibold" style={{ color: textColor }}>Project Location</h4>
                    </div>
                    <p className="text-gray-600">{subtitle}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <Building className="h-6 w-6 text-blue-600 mr-3" />
                        <h4 className="text-lg font-semibold" style={{ color: textColor }}>Total Units</h4>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{projectDetails.totalUnits}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <Ruler className="h-6 w-6 text-blue-600 mr-3" />
                        <h4 className="text-lg font-semibold" style={{ color: textColor }}>Total Land Area</h4>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{projectDetails.landArea}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <Home className="h-6 w-6 text-blue-600 mr-3" />
                        <h4 className="text-lg font-semibold" style={{ color: textColor }}>Unit Variants</h4>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{projectDetails.unitTypes}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <Ruler className="h-6 w-6 text-blue-600 mr-3" />
                        <h4 className="text-lg font-semibold" style={{ color: textColor }}>Estimated Rate</h4>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{projectDetails.estimatedRate}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <Calendar className="h-6 w-6 text-blue-600 mr-3" />
                        <h4 className="text-lg font-semibold" style={{ color: textColor }}>Possession Time</h4>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{projectDetails.possessionTime}</p>
                </div>
            </div>
        </div>
    );

    const renderAmenities = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center p-4 bg-white border border-gray-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-sm font-medium" style={{ color: textColor }}>{amenity}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPrice = () => (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-xl text-center">
                <h3 className="text-3xl font-bold mb-4" style={{ color: textColor }}>
                    Starting Price: {projectDetails.startingPrice}
                </h3>
                <p className="text-lg mb-6 opacity-75" style={{ color: textColor }}>
                    {projectDetails.unitTypes} Luxury Apartments
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Enquire Now
                    </button>
                    <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                        Download Brochure
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4" style={{ color: textColor }}>RERA Information</h4>
                <p className="text-gray-600">RERA No: {projectDetails.reraNumber}</p>
            </div>
        </div>
    );

    const renderLocation = () => (
        <div className="space-y-6">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
                <h3 className="text-2xl font-bold mb-4" style={{ color: textColor }}>Map View</h3>
                <div className="bg-white border border-gray-300 rounded-lg p-8">
                    <p className="text-gray-600">Interactive map would be embedded here</p>
                </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4" style={{ color: textColor }}>Location Highlights</h4>
                <ul className="space-y-2">
                    <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <span style={{ color: textColor }}>Near Meenakshi Mall</span>
                    </li>
                    <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <span style={{ color: textColor }}>Close to Electronic City</span>
                    </li>
                    <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <span style={{ color: textColor }}>Near JP Nagar</span>
                    </li>
                    <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <span style={{ color: textColor }}>Top schools and hospitals nearby</span>
                    </li>
                </ul>
            </div>
        </div>
    );

    const renderGallery = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
                        <span className="text-gray-500">Gallery Image {item}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return renderOverview();
            case 'configuration': return renderConfiguration();
            case 'amenities': return renderAmenities();
            case 'price': return renderPrice();
            case 'location': return renderLocation();
            case 'gallery': return renderGallery();
            default: return renderOverview();
        }
    };

    return (
        <BaseSection
            section={section}
            isBuilder={isBuilder}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onToggleVisibility={onToggleVisibility}
            className="py-20"
        >
            <div className="max-w-6xl mx-auto px-6">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                        PRE LAUNCH
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: textColor }}>
                        {title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-6 opacity-75" style={{ color: textColor }}>
                        {subtitle}
                    </p>
                    <p className="text-lg font-medium text-blue-600 mb-8">
                        {developer}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">
                            Enquire Now
                        </button>
                        <button className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors">
                            Download Brochure
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{projectDetails.totalUnits}</div>
                        <div className="text-sm opacity-75" style={{ color: textColor }}>Total Units</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{projectDetails.landArea}</div>
                        <div className="text-sm opacity-75" style={{ color: textColor }}>Land Area</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{projectDetails.unitTypes}</div>
                        <div className="text-sm opacity-75" style={{ color: textColor }}>Unit Types</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{projectDetails.estimatedRate}</div>
                        <div className="text-sm opacity-75" style={{ color: textColor }}>Rate per Sq.Ft</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="flex space-x-8 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                {renderTabContent()}

                {/* Contact Section */}
                <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to Book Your Dream Home?</h3>
                    <p className="text-blue-100 mb-6">Contact us now for more details and site visit</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href={`tel:${contactInfo.phone}`}
                            className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            <Phone className="h-5 w-5 mr-2" />
                            Call Now
                        </a>
                        <a
                            href={`https://wa.me/${contactInfo.whatsapp}`}
                            className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            <MessageSquare className="h-5 w-5 mr-2" />
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </BaseSection>
    );
};

export default ProjectShowcaseSection;

