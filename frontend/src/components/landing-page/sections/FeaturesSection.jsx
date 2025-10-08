import React from 'react';
import { Home, Users, TrendingUp, Shield, Award, CheckCircle } from 'lucide-react';
import BaseSection from '../BaseSection';

const FeaturesSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = '',
        subtitle = '',
        features = [],
        columns = 4,
        backgroundColor = '#F8FAFC',
        textColor = '#1E293B'
    } = section;

    // Helper function to get default dummy data
    const getDefaultFeatures = () => [
        {
            id: 'demo-1',
            icon: 'Home',
            title: 'Premium Properties',
            description: 'Handpicked properties in prime locations'
        },
        {
            id: 'demo-2',
            icon: 'Users',
            title: 'Expert Guidance',
            description: 'Professional agents to guide you'
        },
        {
            id: 'demo-3',
            icon: 'TrendingUp',
            title: 'Best Investment',
            description: 'Properties with high appreciation potential'
        },
        {
            id: 'demo-4',
            icon: 'Shield',
            title: 'Secure Process',
            description: 'Transparent and secure transactions'
        }
    ];

    // Use dummy data if no features exist and we're in builder mode
    const displayFeatures = features.length > 0 ? features : (isBuilder ? getDefaultFeatures() : []);
    const isUsingDummyData = features.length === 0 && isBuilder;

    const iconMap = {
        Home, Users, TrendingUp, Shield, Award, CheckCircle
    };

    const getGridClass = () => {
        switch (columns) {
            case 1: return 'grid-cols-1';
            case 2: return 'grid-cols-1 md:grid-cols-2';
            case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
            case 6: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';
            default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
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
                {(title || subtitle) && (
                    <div className="text-center mb-16">
                        {title && (
                            <h2
                                className="text-4xl font-bold mb-4"
                                style={{ color: textColor }}
                            >
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p
                                className="text-xl opacity-75"
                                style={{ color: textColor }}
                            >
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                {displayFeatures.length > 0 ? (
                    <div>
                        {isUsingDummyData && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="text-yellow-600 mr-3">
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">Demo Content</p>
                                            <p className="text-xs text-yellow-600">This is sample data. Click "Edit Section" to replace with your content.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onEdit && onEdit()}
                                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                                    >
                                        Replace
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={`grid ${getGridClass()} gap-8`}>
                            {displayFeatures.map((feature, index) => {
                                const IconComponent = iconMap[feature.icon] || Home;
                                return (
                                    <div key={feature.id || index} className="text-center">
                                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <IconComponent className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <h3
                                            className="text-xl font-semibold mb-2"
                                            style={{ color: textColor }}
                                        >
                                            {feature.title}
                                        </h3>
                                        <p
                                            className="opacity-75"
                                            style={{ color: textColor }}
                                        >
                                            {feature.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Home className="h-12 w-12 mx-auto" />
                        </div>
                        <p className="text-gray-500">No features added yet</p>
                        {isBuilder && (
                            <p className="text-sm text-gray-400 mt-2">Click "Add Feature" to get started</p>
                        )}
                    </div>
                )}
            </div>
        </BaseSection>
    );
};

export default FeaturesSection;
