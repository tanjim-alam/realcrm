import React from 'react';
import { Check, X } from 'lucide-react';
import BaseSection from '../BaseSection';

const PricingSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = 'Pricing Plans',
        subtitle = 'Choose the plan that works for you',
        plans = [
            {
                name: 'Basic',
                price: '$99',
                period: '/month',
                description: 'Perfect for individuals',
                features: ['Feature 1', 'Feature 2', 'Feature 3'],
                ctaText: 'Get Started',
                ctaLink: '#contact',
                popular: false
            },
            {
                name: 'Professional',
                price: '$199',
                period: '/month',
                description: 'Best for growing businesses',
                features: ['All Basic features', 'Advanced Feature 1', 'Advanced Feature 2', 'Priority Support'],
                ctaText: 'Get Started',
                ctaLink: '#contact',
                popular: true
            },
            {
                name: 'Enterprise',
                price: '$399',
                period: '/month',
                description: 'For large organizations',
                features: ['All Professional features', 'Custom Integration', 'Dedicated Support', 'Custom Features'],
                ctaText: 'Contact Sales',
                ctaLink: '#contact',
                popular: false
            }
        ],
        columns = 3,
        backgroundColor = '#F8FAFC',
        textColor = '#1E293B'
    } = section;

    const getGridClass = () => {
        switch (columns) {
            case 1: return 'grid-cols-1 max-w-md mx-auto';
            case 2: return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
            case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
            default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
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

                <div className={`grid ${getGridClass()} gap-8`}>
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-2xl shadow-lg p-8 relative ${plan.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3
                                    className="text-2xl font-bold mb-2"
                                    style={{ color: textColor }}
                                >
                                    {plan.name}
                                </h3>
                                <p
                                    className="text-sm opacity-75 mb-4"
                                    style={{ color: textColor }}
                                >
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline justify-center">
                                    <span
                                        className="text-5xl font-bold"
                                        style={{ color: textColor }}
                                    >
                                        {plan.price}
                                    </span>
                                    <span
                                        className="text-lg opacity-75 ml-1"
                                        style={{ color: textColor }}
                                    >
                                        {plan.period}
                                    </span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-center">
                                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                        <span style={{ color: textColor }}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <a
                                href={plan.ctaLink}
                                className={`w-full block text-center py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${plan.popular
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                    }`}
                            >
                                {plan.ctaText}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </BaseSection>
    );
};

export default PricingSection;

