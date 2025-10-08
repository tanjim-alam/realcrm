import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import BaseSection from '../BaseSection';

const FaqSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = '',
        subtitle = '',
        faqs = [],
        backgroundColor = '#F8FAFC',
        textColor = '#1E293B'
    } = section;

    // Helper function to get default dummy data
    const getDefaultFaqs = () => [
        {
            id: 'demo-1',
            question: 'How do I get started?',
            answer: 'Simply contact us through our form or give us a call. We\'ll schedule a consultation to understand your needs.'
        },
        {
            id: 'demo-2',
            question: 'What areas do you cover?',
            answer: 'We cover all major metropolitan areas and surrounding regions. Contact us to confirm coverage in your specific area.'
        },
        {
            id: 'demo-3',
            question: 'How long does the process take?',
            answer: 'The timeline varies depending on your requirements, but typically ranges from 2-6 weeks for most transactions.'
        },
        {
            id: 'demo-4',
            question: 'What are your fees?',
            answer: 'Our fees are competitive and transparent. We\'ll provide a detailed breakdown during our initial consultation.'
        }
    ];

    // Use dummy data if no FAQs exist and we're in builder mode
    const displayFaqs = faqs.length > 0 ? faqs : (isBuilder ? getDefaultFaqs() : []);
    const isUsingDummyData = faqs.length === 0 && isBuilder;

    const [openItems, setOpenItems] = useState(new Set());

    const toggleItem = (index) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(index)) {
            newOpenItems.delete(index);
        } else {
            newOpenItems.add(index);
        }
        setOpenItems(newOpenItems);
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

                {displayFaqs.length > 0 ? (
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

                        <div className="space-y-4">
                            {displayFaqs.map((faq, index) => (
                                <div
                                    key={faq.id || index}
                                    className="bg-white rounded-lg shadow-md overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleItem(index)}
                                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                    >
                                        <h3
                                            className="text-lg font-semibold"
                                            style={{ color: textColor }}
                                        >
                                            {faq.question}
                                        </h3>
                                        {openItems.has(index) ? (
                                            <ChevronUp className="h-5 w-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-500" />
                                        )}
                                    </button>
                                    {openItems.has(index) && (
                                        <div className="px-6 pb-4">
                                            <p
                                                className="text-gray-600 leading-relaxed"
                                                style={{ color: textColor, opacity: 0.8 }}
                                            >
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-500">No FAQs added yet</p>
                        {isBuilder && (
                            <p className="text-sm text-gray-400 mt-2">Click "Add FAQ" to get started</p>
                        )}
                    </div>
                )}
            </div>
        </BaseSection>
    );
};

export default FaqSection;
