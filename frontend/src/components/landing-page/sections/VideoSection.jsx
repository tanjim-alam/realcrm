import React from 'react';
import { Play } from 'lucide-react';
import BaseSection from '../BaseSection';

const VideoSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = '',
        subtitle = '',
        videoUrl = '',
        thumbnailUrl = 'https://via.placeholder.com/800x450?text=Video+Thumbnail',
        alignment = 'center',
        backgroundColor = 'transparent',
        textColor = '#1E293B'
    } = section;

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
                        {videoUrl ? (
                            <div className="relative w-full max-w-4xl mx-auto">
                                <video
                                    controls
                                    className="w-full rounded-lg shadow-lg"
                                    poster={thumbnailUrl}
                                >
                                    <source src={videoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ) : (
                            <div className="relative w-full max-w-4xl mx-auto bg-gray-200 rounded-lg shadow-lg aspect-video flex items-center justify-center">
                                <div className="text-center">
                                    <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Add video URL to display video</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BaseSection>
    );
};

export default VideoSection;

