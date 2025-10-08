import React from 'react';
import { MapPin, Bed, Bath, Square, Star } from 'lucide-react';
import BaseSection from '../BaseSection';

const PropertiesSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = 'Featured Properties',
        subtitle = 'Discover our handpicked selection of premium properties',
        properties = [],
        columns = 3,
        backgroundColor = '#FFFFFF',
        textColor = '#1E293B'
    } = section;

    const getGridClass = () => {
        switch (columns) {
            case 1: return 'grid-cols-1';
            case 2: return 'grid-cols-1 md:grid-cols-2';
            case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
            default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
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
                <div className="text-center mb-16">
                    <h2
                        className="text-4xl font-bold mb-4"
                        style={{ color: textColor }}
                    >
                        {title}
                    </h2>
                    <p
                        className="text-xl opacity-75"
                        style={{ color: textColor }}
                    >
                        {subtitle}
                    </p>
                </div>

                <div className={`grid ${getGridClass()} gap-8`}>
                    {properties.slice(0, 6).map((property, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                            <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500"></div>
                            <div className="p-6">
                                <h3
                                    className="text-xl font-semibold mb-2"
                                    style={{ color: textColor }}
                                >
                                    {property.title || 'Property Title'}
                                </h3>
                                <p
                                    className="mb-4 flex items-center opacity-75"
                                    style={{ color: textColor }}
                                >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {property.location?.address || 'Property Address'}
                                </p>
                                <div className="flex items-center justify-between text-sm opacity-75 mb-4" style={{ color: textColor }}>
                                    <span className="flex items-center">
                                        <Bed className="h-4 w-4 mr-1" />
                                        {property.configuration?.bedrooms || 'N/A'}
                                    </span>
                                    <span className="flex items-center">
                                        <Bath className="h-4 w-4 mr-1" />
                                        {property.configuration?.bathrooms || 'N/A'}
                                    </span>
                                    <span className="flex items-center">
                                        <Square className="h-4 w-4 mr-1" />
                                        {property.area?.builtUp || 'N/A'} {property.area?.unit || 'sqft'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-blue-600 mb-4">
                                    ₹{property.price?.value || '0'} {property.price?.unit || 'Lakhs'}
                                </div>
                                <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </BaseSection>
    );
};

export default PropertiesSection;

