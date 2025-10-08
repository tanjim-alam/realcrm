const mongoose = require('mongoose');
const Property = require('./models/Property');

// Sample property based on Sobha Scarlet Woods
const sampleProperty = {
    companyId: new mongoose.Types.ObjectId('68b9a60d87cbd5d4e94ed0c2'), // Replace with actual company ID
    title: 'Sobha Scarlet Woods',
    developer: 'Sobha Limited',
    price: {
        value: 80, // 80 Lakhs starting price
        unit: 'lakh',
        displayText: 'Starting from ₹80 Lakhs',
        startingPrice: true
    },
    location: {
        address: 'Near Sobha Royal Pavilion, Sarjapur',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560035',
        landmark: 'Sarjapur Road'
    },
    description: 'Welcome to Sobha Scarlet Woods, a landmark residential development that epitomizes luxury, sophistication, and architectural brilliance. Developed by Sobha Limited, one of India\'s most reputed real estate developers, Sobha Scarlet Woods redefines premium living with its exquisite design, unparalleled amenities, and prime location.',
    images: [
        {
            url: 'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Sobha+Scarlet+Woods',
            caption: 'Sobha Scarlet Woods - Main View',
            isPrimary: true
        },
        {
            url: 'https://via.placeholder.com/800x600/10B981/FFFFFF?text=Clubhouse',
            caption: 'Grand Clubhouse',
            isPrimary: false
        },
        {
            url: 'https://via.placeholder.com/800x600/F59E0B/FFFFFF?text=Swimming+Pool',
            caption: 'Swimming Pool',
            isPrimary: false
        }
    ],
    status: 'pre_launch',
    propertyType: 'apartment',
    configuration: {
        bedrooms: '3, 3.5 & 4 BHK',
        bathrooms: 3,
        balconies: 2,
        parking: '2 Covered'
    },
    area: {
        carpet: 1850,
        builtUp: 1900,
        superBuiltUp: 2200,
        unit: 'sqft'
    },
    projectDetails: {
        totalUnits: 200,
        totalTowers: 1,
        totalFloors: 9,
        totalLandArea: 5.3,
        landAreaUnit: 'acres',
        possessionDate: new Date('2026-12-31'),
        reraNumber: 'Coming Soon'
    },
    amenities: {
        lifestyle: [
            'Grand Clubhouse',
            'Multipurpose Hall',
            'Indoor Games Room',
            'Library & Reading Lounge',
            'Co-working Spaces'
        ],
        wellness: [
            'Fully Equipped Gymnasium',
            'Swimming Pool',
            'Kids Pool',
            'Spa & Wellness Center',
            'Yoga & Meditation Deck'
        ],
        outdoor: [
            'Landscaped Gardens',
            'Jogging Tracks',
            'Children\'s Play Area',
            'Multipurpose Court',
            'Amphitheater'
        ],
        community: [
            'Senior Citizen Zone',
            'Children\'s Play Area',
            'Community Hall',
            'Party Lawn'
        ],
        safety: [
            '24/7 CCTV Surveillance',
            'Gated Access-Controlled Community',
            'Video Door Security',
            'Smart Locks',
            'Intercom Facilities'
        ]
    },
    features: [
        'Vastu Compliant',
        'Smart Home Features',
        'Premium Fittings',
        'High-Quality Finishes',
        'Natural Ventilation',
        'Spacious Balconies',
        'Master Bedroom with En-suite',
        'Modern Kitchen',
        'Solar Panels',
        'Rainwater Harvesting'
    ],
    connectivity: {
        metro: {
            distance: 1,
            station: 'Nearest Metro Station'
        },
        airport: {
            distance: 1.5,
            name: 'Kempegowda International Airport'
        },
        railway: {
            distance: 1,
            station: 'Bangalore City Station'
        },
        highways: [
            {
                name: 'ORR (Outer Ring Road)',
                distance: 0.5
            },
            {
                name: 'Sarjapur Road',
                distance: 0.2
            }
        ],
        landmarks: [
            {
                name: 'Electronic City',
                distance: 15,
                type: 'IT Park'
            },
            {
                name: 'Whitefield',
                distance: 20,
                type: 'IT Park'
            },
            {
                name: 'Manyata Tech Park',
                distance: 25,
                type: 'IT Park'
            }
        ]
    },
    investment: {
        rentalYield: 6.5,
        appreciation: 'high',
        emi: 65000
    },
    documents: [
        {
            name: 'Brochure',
            url: '/documents/sobhascarlet-brochure.pdf',
            type: 'brochure'
        },
        {
            name: 'Floor Plan - 3 BHK',
            url: '/documents/sobhascarlet-3bhk-plan.pdf',
            type: 'floor_plan'
        },
        {
            name: 'Floor Plan - 4 BHK',
            url: '/documents/sobhascarlet-4bhk-plan.pdf',
            type: 'floor_plan'
        },
        {
            name: 'Cost Sheet',
            url: '/documents/sobhascarlet-costsheet.pdf',
            type: 'cost_sheet'
        }
    ],
    contact: {
        phone: ['+919380660766', '+91 9380660766'],
        email: 'info@sobhascarlet.in',
        whatsapp: '+919380660766'
    },
    listedBy: new mongoose.Types.ObjectId('68b9a60d87cbd5d4e94ed0c4'), // Replace with actual user ID
    isFeatured: true,
    isVerified: true,
    views: 0,
    inquiries: 0
};

// Function to create sample property
async function createSampleProperty() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/realcrm', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Check if property already exists
        const existingProperty = await Property.findOne({ title: 'Sobha Scarlet Woods' });
        if (existingProperty) {
            console.log('✅ Sample property already exists');
            return;
        }

        // Create the property
        const property = new Property(sampleProperty);
        await property.save();

        console.log('✅ Sample property created successfully:', property.title);
        console.log('📍 Location:', property.location.address);
        console.log('💰 Price:', property.price.displayText);
        console.log('🏠 Configuration:', property.configuration.bedrooms);
        console.log('📐 Area:', property.area.builtUp, property.area.unit);

    } catch (error) {
        console.error('❌ Error creating sample property:', error);
    } finally {
        await mongoose.disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    createSampleProperty();
}

module.exports = { createSampleProperty, sampleProperty };



