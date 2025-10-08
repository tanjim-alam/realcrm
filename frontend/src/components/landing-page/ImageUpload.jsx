import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';

const ImageUpload = ({
    images = [],
    onImagesChange,
    maxImages = 10,
    maxSize = 5 * 1024 * 1024, // 5MB
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}) => {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (files) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => {
            if (!acceptedTypes.includes(file.type)) {
                alert(`File ${file.name} is not a supported image type.`);
                return false;
            }
            if (file.size > maxSize) {
                alert(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        if (images.length + validFiles.length > maxImages) {
            alert(`Maximum ${maxImages} images allowed.`);
            return;
        }

        setUploading(true);

        try {
            const newImages = await Promise.all(
                validFiles.map(file => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            resolve({
                                id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                url: e.target.result,
                                name: file.name,
                                size: file.size,
                                type: file.type
                            });
                        };
                        reader.readAsDataURL(file);
                    });
                })
            );

            onImagesChange([...images, ...newImages]);
        } catch (error) {
            console.error('Error processing images:', error);
            alert('Error processing images. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = e.dataTransfer.files;
        handleFileSelect(files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const removeImage = (imageId) => {
        onImagesChange(images.filter(img => img.id !== imageId));
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes.join(',')}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                />

                <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        {uploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        ) : (
                            <Upload className="h-8 w-8 text-gray-400" />
                        )}
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {uploading ? 'Uploading images...' : 'Upload Gallery Images'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Drag and drop images here, or click to select files
                        </p>
                        <button
                            onClick={openFileDialog}
                            disabled={uploading}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Select Images
                        </button>
                    </div>

                    <div className="text-xs text-gray-500">
                        <p>Supported formats: JPEG, PNG, WebP, GIF</p>
                        <p>Maximum size: {maxSize / 1024 / 1024}MB per image</p>
                        <p>Maximum images: {maxImages}</p>
                    </div>
                </div>
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">
                            Gallery Images ({images.length}/{maxImages})
                        </h4>
                        <button
                            onClick={openFileDialog}
                            disabled={uploading || images.length >= maxImages}
                            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        >
                            Add More
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((image) => (
                            <div key={image.id} className="relative group">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={image.url}
                                        alt={image.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                                    <button
                                        onClick={() => removeImage(image.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Image Info */}
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 rounded-b-lg">
                                    <p className="text-xs truncate">{image.name}</p>
                                    <p className="text-xs opacity-75">
                                        {(image.size / 1024 / 1024).toFixed(2)}MB
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;

