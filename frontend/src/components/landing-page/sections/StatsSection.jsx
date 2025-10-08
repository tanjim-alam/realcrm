import React from 'react';
import { TrendingUp, Users, Home, Award } from 'lucide-react';
import BaseSection from '../BaseSection';

const StatsSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = 'Our Impact',
        subtitle = 'Numbers that speak for themselves',
        stats = [
            { number: '500+', label: 'Properties Sold', icon: 'Home' },
            { number: '1000+', label: 'Happy Clients', icon: 'Users' },
            { number: '15+', label: 'Years Experience', icon: 'Award' },
            { number: '98%', label: 'Client Satisfaction', icon: 'TrendingUp' }
        ],
        columns = 4,
        backgroundColor = '#F8FAFC',
        textColor = '#1E293B'
    } = section;

    const iconMap = {
        TrendingUp, Users, Home, Award
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
                    {stats.map((stat, index) => {
                        const IconComponent = iconMap[stat.icon] || TrendingUp;
                        return (
                            <div key={index} className="text-center">
                                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <IconComponent className="h-8 w-8 text-blue-600" />
                                </div>
                                <div
                                    className="text-4xl md:text-5xl font-bold mb-2"
                                    style={{ color: textColor }}
                                >
                                    {stat.number}
                                </div>
                                <p
                                    className="text-lg opacity-75"
                                    style={{ color: textColor }}
                                >
                                    {stat.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </BaseSection>
    );
};

export default StatsSection;

