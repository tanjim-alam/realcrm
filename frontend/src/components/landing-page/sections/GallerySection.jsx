import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import BaseSection from '../BaseSection';
import ImageUpload from '../ImageUpload';

const GallerySection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = 'Gallery',
        subtitle = 'Explore our featured properties',
        images = [],
        columns = 3,
        backgroundColor = '#F8FAFC',
        textColor = '#1E293B'
    } = section;

    const [selectedImage, setSelectedImage] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const getGridClass = () => {
        switch (columns) {
            case 1: return 'grid-cols-1 max-w-md mx-auto';
            case 2: return 'grid-cols-1 md:grid-cols-2';
            case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
            case 6: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';
            default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        }
    };

    const openLightbox = (index) => {
        setSelectedImage(images[index]);
        setCurrentIndex(index);
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    const nextImage = () => {
        const nextIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(nextIndex);
        setSelectedImage(images[nextIndex]);
    };

    const prevImage = () => {
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        setCurrentIndex(prevIndex);
        setSelectedImage(images[prevIndex]);
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

                {isBuilder ? (
                    <ImageUpload
                        images={images}
                        onImagesChange={(newImages) => {
                            // This would need to be handled by the parent component
                            console.log('Images updated:', newImages);
                        }}
                        maxImages={20}
                    />
                ) : (
                    <div className={`grid ${getGridClass()} gap-4`}>
                        {images.length > 0 ? (
                            images.map((image, index) => (
                                <div
                                    key={image.id || index}
                                    className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                                    onClick={() => openLightbox(index)}
                                >
                                    <img
                                        src={image.url || image}
                                        alt={image.name || `Gallery image ${index + 1}`}
                                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white bg-opacity-90 rounded-full p-3">
                                                <ChevronRight className="h-6 w-6 text-gray-800" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500">No images uploaded yet</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Lightbox */}
                {selectedImage && (
                    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                        >
                            <X className="h-8 w-8" />
                        </button>

                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </button>

                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </button>

                        <img
                            src={selectedImage.url || selectedImage}
                            alt={selectedImage.name || "Gallery image"}
                            className="max-w-full max-h-full object-contain"
                        />

                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                            {currentIndex + 1} of {images.length}
                        </div>
                    </div>
                )}
            </div>
        </BaseSection>
    );
};

export default GallerySection;
