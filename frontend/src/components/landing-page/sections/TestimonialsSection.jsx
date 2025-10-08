import React from 'react';
import { Star, Quote } from 'lucide-react';
import BaseSection from '../BaseSection';

const TestimonialsSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = '',
        subtitle = '',
        testimonials = [],
        columns = 3,
        backgroundColor = '#F8FAFC',
        textColor = '#1E293B'
    } = section;

    // Helper function to get default dummy data
    const getDefaultTestimonials = () => [
        {
            id: 'demo-1',
            name: 'John Doe',
            role: 'Property Owner',
            content: 'Excellent service! They helped me find my dream home in just two weeks.',
            rating: 5,
            avatar: 'https://via.placeholder.com/64x64?text=JD'
        },
        {
            id: 'demo-2',
            name: 'Jane Smith',
            role: 'Investor',
            content: 'Professional team with great market knowledge. Highly recommended!',
            rating: 5,
            avatar: 'https://via.placeholder.com/64x64?text=JS'
        },
        {
            id: 'demo-3',
            name: 'Mike Johnson',
            role: 'First-time Buyer',
            content: 'They made the entire process smooth and stress-free. Thank you!',
            rating: 5,
            avatar: 'https://via.placeholder.com/64x64?text=MJ'
        }
    ];

    // Use dummy data if no testimonials exist and we're in builder mode
    const displayTestimonials = testimonials.length > 0 ? testimonials : (isBuilder ? getDefaultTestimonials() : []);
    const isUsingDummyData = testimonials.length === 0 && isBuilder;

    const getGridClass = () => {
        switch (columns) {
            case 1: return 'grid-cols-1';
            case 2: return 'grid-cols-1 md:grid-cols-2';
            case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
            default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
        ));
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
                {(title || subtitle) && (
                    <div className="text-center mb-16">
                        {title && (
                            <h2
                                className="text-4xl font-bold mb-4"
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

                {displayTestimonials.length > 0 ? (
                    <div>
                        {isUsingDummyData && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="text-yellow-600 mr-3">
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">Demo Content</p>
                                            <p className="text-xs text-yellow-600">This is sample data. Click "Edit Section" to replace with your content.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onEdit && onEdit()}
                                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                                    >
                                        Replace
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={`grid ${getGridClass()} gap-8`}>
                            {displayTestimonials.map((testimonial, index) => (
                                <div key={testimonial.id || index} className="bg-white rounded-2xl shadow-lg p-8 relative">
                                    <Quote className="h-8 w-8 text-blue-100 absolute top-4 right-4" />
                                    <div className="flex items-center mb-4">
                                        {renderStars(testimonial.rating)}
                                    </div>
                                    <p
                                        className="text-lg mb-6 italic"
                                        style={{ color: textColor }}
                                    >
                                        "{testimonial.content}"
                                    </p>
                                    <div className="flex items-center">
                                        <img
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            className="h-12 w-12 rounded-full mr-4"
                                        />
                                        <div>
                                            <h4
                                                className="font-semibold"
                                                style={{ color: textColor }}
                                            >
                                                {testimonial.name}
                                            </h4>
                                            <p
                                                className="text-sm opacity-75"
                                                style={{ color: textColor }}
                                            >
                                                {testimonial.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Quote className="h-12 w-12 mx-auto" />
                        </div>
                        <p className="text-gray-500">No testimonials added yet</p>
                        {isBuilder && (
                            <p className="text-sm text-gray-400 mt-2">Click "Add Testimonial" to get started</p>
                        )}
                    </div>
                )}
            </div>
        </BaseSection>
    );
};

export default TestimonialsSection;
