import React from 'react';
import { ArrowRight } from 'lucide-react';
import BaseSection from '../BaseSection';

const HeroSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = 'Welcome to Our Platform',
        subtitle = 'Discover amazing properties and find your dream home',
        ctaText = 'Get Started',
        ctaLink = '#contact',
        backgroundColor = '#3B82F6',
        textColor = '#FFFFFF'
    } = section;

    return (
        <BaseSection
            section={section}
            isBuilder={isBuilder}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onToggleVisibility={onToggleVisibility}
            className="min-h-screen flex items-center justify-center"
        >
            <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                <h1
                    className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
                    style={{ color: textColor }}
                >
                    {title}
                </h1>
                <p
                    className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90"
                    style={{ color: textColor }}
                >
                    {subtitle}
                </p>
                {ctaText && (
                    <a
                        href={ctaLink}
                        className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        {ctaText}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                )}
            </div>
        </BaseSection>
    );
};

export default HeroSection;

