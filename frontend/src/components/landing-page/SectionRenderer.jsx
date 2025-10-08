import React from 'react';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import PropertiesSection from './sections/PropertiesSection';
import ContactSection from './sections/ContactSection';
import TextSection from './sections/TextSection';
import ImageSection from './sections/ImageSection';
import VideoSection from './sections/VideoSection';
import CtaSection from './sections/CtaSection';
import PricingSection from './sections/PricingSection';
import FaqSection from './sections/FaqSection';
import TeamSection from './sections/TeamSection';
import StatsSection from './sections/StatsSection';
import GallerySection from './sections/GallerySection';
import FormSection from './sections/FormSection';
import TestimonialsSection from './sections/TestimonialsSection';
import LeadMagnetSection from './sections/LeadMagnetSection';
import ProjectShowcaseSection from './sections/ProjectShowcaseSection';
import CustomSection from './sections/CustomSection';

const SectionRenderer = ({ section, isBuilder = false, onEdit, onDelete, onMoveUp, onMoveDown }) => {
    if (!section || !section.isVisible) return null;

    const sectionProps = {
        section,
        isBuilder,
        onEdit,
        onDelete,
        onMoveUp,
        onMoveDown
    };

    switch (section.type) {
        case 'hero':
            return <HeroSection {...sectionProps} />;
        case 'features':
            return <FeaturesSection {...sectionProps} />;
        case 'properties':
            return <PropertiesSection {...sectionProps} />;
        case 'contact':
            return <ContactSection {...sectionProps} />;
        case 'text':
            return <TextSection {...sectionProps} />;
        case 'image':
            return <ImageSection {...sectionProps} />;
        case 'video':
            return <VideoSection {...sectionProps} />;
        case 'cta':
            return <CtaSection {...sectionProps} />;
        case 'pricing':
            return <PricingSection {...sectionProps} />;
        case 'faq':
            return <FaqSection {...sectionProps} />;
        case 'team':
            return <TeamSection {...sectionProps} />;
        case 'stats':
            return <StatsSection {...sectionProps} />;
        case 'gallery':
            return <GallerySection {...sectionProps} />;
        case 'form':
            return <FormSection {...sectionProps} />;
        case 'testimonials':
            return <TestimonialsSection {...sectionProps} />;
        case 'lead-magnet':
            return <LeadMagnetSection {...sectionProps} />;
        case 'project-showcase':
            return <ProjectShowcaseSection {...sectionProps} />;
        case 'custom':
            return <CustomSection {...sectionProps} />;
        default:
            return <div className="p-4 border-2 border-dashed border-gray-300 text-center text-gray-500">
                Unknown section type: {section.type}
            </div>;
    }
};

export default SectionRenderer;
