import React from 'react';
import { Linkedin, Twitter, Mail } from 'lucide-react';
import BaseSection from '../BaseSection';

const TeamSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = 'Meet Our Team',
        subtitle = 'The experts behind our success',
        team = [
            {
                name: 'John Smith',
                role: 'CEO & Founder',
                bio: 'With over 15 years of experience in real estate, John leads our team with passion and expertise.',
                image: 'https://via.placeholder.com/300x300?text=JS',
                social: {
                    linkedin: '#',
                    twitter: '#',
                    email: 'john@example.com'
                }
            },
            {
                name: 'Sarah Johnson',
                role: 'Lead Agent',
                bio: 'Sarah specializes in luxury properties and has helped hundreds of families find their dream homes.',
                image: 'https://via.placeholder.com/300x300?text=SJ',
                social: {
                    linkedin: '#',
                    twitter: '#',
                    email: 'sarah@example.com'
                }
            },
            {
                name: 'Mike Davis',
                role: 'Property Consultant',
                bio: 'Mike brings deep market knowledge and helps clients make informed investment decisions.',
                image: 'https://via.placeholder.com/300x300?text=MD',
                social: {
                    linkedin: '#',
                    twitter: '#',
                    email: 'mike@example.com'
                }
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
                    {team.map((member, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden text-center">
                            <div className="p-8">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
                                />
                                <h3
                                    className="text-2xl font-bold mb-2"
                                    style={{ color: textColor }}
                                >
                                    {member.name}
                                </h3>
                                <p
                                    className="text-lg font-semibold text-blue-600 mb-4"
                                >
                                    {member.role}
                                </p>
                                <p
                                    className="text-gray-600 mb-6 leading-relaxed"
                                    style={{ color: textColor, opacity: 0.8 }}
                                >
                                    {member.bio}
                                </p>

                                <div className="flex justify-center space-x-4">
                                    {member.social.linkedin && (
                                        <a
                                            href={member.social.linkedin}
                                            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                                        >
                                            <Linkedin className="h-5 w-5" />
                                        </a>
                                    )}
                                    {member.social.twitter && (
                                        <a
                                            href={member.social.twitter}
                                            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                                        >
                                            <Twitter className="h-5 w-5" />
                                        </a>
                                    )}
                                    {member.social.email && (
                                        <a
                                            href={`mailto:${member.social.email}`}
                                            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                                        >
                                            <Mail className="h-5 w-5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </BaseSection>
    );
};

export default TeamSection;

