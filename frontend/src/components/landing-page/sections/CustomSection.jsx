import React from 'react';
import BaseSection from '../BaseSection';

const CustomSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = '',
        subtitle = '',
        customHtml = '<div class="p-8 text-center"><h3 class="text-2xl font-bold mb-4">Custom Section</h3><p>Add your custom HTML content here...</p></div>',
        customCss = '',
        backgroundColor = 'transparent',
        textColor = '#1E293B'
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
            className="py-12"
        >
            <div className="max-w-6xl mx-auto px-6">
                {(title || subtitle) && (
                    <div className="text-center mb-8">
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
                                className="text-xl opacity-75"
                                style={{ color: textColor }}
                            >
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                <div
                    className="custom-section-content"
                    dangerouslySetInnerHTML={{ __html: customHtml }}
                />

                {customCss && (
                    <style dangerouslySetInnerHTML={{ __html: customCss }} />
                )}
            </div>
        </BaseSection>
    );
};

export default CustomSection;

