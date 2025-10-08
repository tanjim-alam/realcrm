import React from 'react';
import { ArrowRight, Download, Phone, Mail } from 'lucide-react';
import BaseSection from '../BaseSection';

const CtaSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = 'Ready to Get Started?',
        subtitle = 'Take the next step towards your goals',
        ctaText = 'Get Started Now',
        ctaLink = '#contact',
        ctaType = 'primary',
        secondaryCtaText = '',
        secondaryCtaLink = '',
        alignment = 'center',
        backgroundColor = '#3B82F6',
        textColor = '#FFFFFF'
    } = section;

    const getAlignmentClass = () => {
        switch (alignment) {
            case 'left': return 'text-left';
            case 'right': return 'text-right';
            case 'center': return 'text-center';
            default: return 'text-center';
        }
    };

    const getCtaButtonClass = (type) => {
        const baseClass = "inline-flex items-center px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105";

        switch (type) {
            case 'secondary':
                return `${baseClass} bg-white text-blue-600 hover:bg-blue-50`;
            case 'outline':
                return `${baseClass} border-2 border-white text-white hover:bg-white hover:text-blue-600`;
            default:
                return `${baseClass} bg-white text-blue-600 hover:bg-blue-50`;
        }
    };

    const getCtaIcon = (text) => {
        if (text.toLowerCase().includes('download')) return <Download className="ml-2 h-5 w-5" />;
        if (text.toLowerCase().includes('call') || text.toLowerCase().includes('phone')) return <Phone className="ml-2 h-5 w-5" />;
        if (text.toLowerCase().includes('email') || text.toLowerCase().includes('contact')) return <Mail className="ml-2 h-5 w-5" />;
        return <ArrowRight className="ml-2 h-5 w-5" />;
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
            <div className="max-w-4xl mx-auto px-6">
                <div className={`${getAlignmentClass()}`}>
                    <h2
                        className="text-4xl md:text-5xl font-bold mb-6"
                        style={{ color: textColor }}
                    >
                        {title}
                    </h2>
                    {subtitle && (
                        <p
                            className="text-xl mb-8 opacity-90"
                            style={{ color: textColor }}
                        >
                            {subtitle}
                        </p>
                    )}

                    <div className={`flex flex-wrap gap-4 ${alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
                        <a
                            href={ctaLink}
                            className={getCtaButtonClass(ctaType)}
                        >
                            {ctaText}
                            {getCtaIcon(ctaText)}
                        </a>

                        {secondaryCtaText && secondaryCtaLink && (
                            <a
                                href={secondaryCtaLink}
                                className={getCtaButtonClass('secondary')}
                            >
                                {secondaryCtaText}
                                {getCtaIcon(secondaryCtaText)}
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </BaseSection>
    );
};

export default CtaSection;

