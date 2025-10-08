import React from 'react';
import BaseSection from '../BaseSection';

const ImageSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = '',
        subtitle = '',
        imageUrl = 'https://via.placeholder.com/800x400?text=Add+Your+Image',
        altText = 'Section Image',
        alignment = 'center',
        imageSize = 'medium',
        backgroundColor = 'transparent',
        textColor = '#1E293B'
    } = section;

    const getImageSizeClass = () => {
        switch (imageSize) {
            case 'small': return 'max-w-sm';
            case 'medium': return 'max-w-2xl';
            case 'large': return 'max-w-4xl';
            case 'full': return 'w-full';
            default: return 'max-w-2xl';
        }
    };

    const getAlignmentClass = () => {
        switch (alignment) {
            case 'left': return 'text-left';
            case 'right': return 'text-right';
            case 'center': return 'text-center';
            default: return 'text-center';
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
            className="py-12"
        >
            <div className="max-w-6xl mx-auto px-6">
                <div className={`${getAlignmentClass()}`}>
                    {title && (
                        <h2
                            className="text-3xl md:text-4xl font-bold mb-4"
                            style={{ color: textColor }}
                        >
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p
                            className="text-xl mb-8 opacity-75"
                            style={{ color: textColor }}
                        >
                            {subtitle}
                        </p>
                    )}
                    <div className={`${getAlignmentClass()}`}>
                        <img
                            src={imageUrl}
                            alt={altText}
                            className={`${getImageSizeClass()} rounded-lg shadow-lg mx-auto`}
                            style={{ maxHeight: '500px', objectFit: 'cover' }}
                        />
                    </div>
                </div>
            </div>
        </BaseSection>
    );
};

export default ImageSection;

