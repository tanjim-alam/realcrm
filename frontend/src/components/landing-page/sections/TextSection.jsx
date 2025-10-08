import React from 'react';
import BaseSection from '../BaseSection';

const TextSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = '',
        subtitle = '',
        content = 'Add your text content here...',
        alignment = 'left',
        backgroundColor = 'transparent',
        textColor = '#1E293B'
    } = section;

    const getAlignmentClass = () => {
        switch (alignment) {
            case 'center': return 'text-center';
            case 'right': return 'text-right';
            case 'justify': return 'text-justify';
            default: return 'text-left';
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
            <div className="max-w-4xl mx-auto px-6">
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
                            className="text-xl mb-6 opacity-75"
                            style={{ color: textColor }}
                        >
                            {subtitle}
                        </p>
                    )}
                    <div
                        className="prose prose-lg max-w-none"
                        style={{ color: textColor }}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
        </BaseSection>
    );
};

export default TextSection;

