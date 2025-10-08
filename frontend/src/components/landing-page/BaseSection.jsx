import React from 'react';
import { Edit, Trash2, MoveUp, MoveDown, Eye, EyeOff } from 'lucide-react';

const BaseSection = ({
    children,
    section,
    isBuilder = false,
    onEdit,
    onDelete,
    onMoveUp,
    onMoveDown,
    onToggleVisibility,
    className = ""
}) => {
    const sectionStyle = {
        backgroundColor: section.backgroundColor || 'transparent',
        color: section.textColor || 'inherit',
        padding: section.padding || '2rem 0',
        margin: section.margin || '0',
        ...section.styling
    };

    if (section.styling?.backgroundImage) {
        sectionStyle.backgroundImage = `url(${section.styling.backgroundImage})`;
        sectionStyle.backgroundSize = section.styling.backgroundSize || 'cover';
        sectionStyle.backgroundPosition = section.styling.backgroundPosition || 'center';
    }

    return (
        <div
            className={`relative ${className}`}
            style={sectionStyle}
            data-section-id={section.id}
            data-section-type={section.type}
        >
            {isBuilder && (
                <div className="absolute top-0 left-0 right-0 z-50 bg-blue-600 text-white p-2 flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                            {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section
                        </span>
                        {section.title && (
                            <span className="text-xs opacity-75">- {section.title}</span>
                        )}
                    </div>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => onToggleVisibility?.(section.id)}
                            className="p-1 hover:bg-blue-700 rounded"
                            title={section.isVisible ? 'Hide section' : 'Show section'}
                        >
                            {section.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                            onClick={() => onMoveUp?.(section.id)}
                            className="p-1 hover:bg-blue-700 rounded"
                            title="Move up"
                        >
                            <MoveUp className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onMoveDown?.(section.id)}
                            className="p-1 hover:bg-blue-700 rounded"
                            title="Move down"
                        >
                            <MoveDown className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onEdit?.(section)}
                            className="p-1 hover:bg-blue-700 rounded"
                            title="Edit section"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete?.(section.id)}
                            className="p-1 hover:bg-red-600 rounded"
                            title="Delete section"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
            {children}
        </div>
    );
};

export default BaseSection;

