const Property = require('../models/Property');
const Lead = require('../models/Lead');

class PropertyMatchingService {
    /**
     * Find properties that match lead requirements
     * @param {Object} lead - Lead object with requirements
     * @param {Object} options - Matching options
     * @returns {Array} Array of matching properties with scores
     */
    async findMatchingProperties(lead, options = {}) {
        try {
            const {
                companyId,
                propertyType,
                budget,
                location,
                timeline,
                priority
            } = lead;

            // Build match criteria
            const matchCriteria = {
                companyId: companyId,
                status: 'available'
            };

            // Add property type filter if specified
            if (propertyType && propertyType !== 'other') {
                matchCriteria.propertyType = propertyType;
            }

            // Add location filter if specified
            if (location) {
                matchCriteria['location.address'] = { $regex: location, $options: 'i' };
            }

            // Add budget range filter
            if (budget) {
                const budgetRange = this.calculateBudgetRange(budget, priority);
                matchCriteria['price.value'] = {
                    $gte: budgetRange.min,
                    $lte: budgetRange.max
                };
            }

            console.log('🔍 Property matching criteria:', matchCriteria);

            // Find matching properties
            const properties = await Property.find(matchCriteria)
                .populate('listedBy', 'name email')
                .sort({ createdAt: -1 })
                .limit(options.limit || 10);

            console.log(`📋 Found ${properties.length} matching properties`);

            // Calculate match scores for each property
            const propertiesWithScores = properties.map(property => {
                const score = this.calculateMatchScore(lead, property);
                return {
                    ...property.toObject(),
                    matchScore: score,
                    matchPercentage: Math.round(score * 100)
                };
            });

            // Sort by match score (highest first)
            propertiesWithScores.sort((a, b) => b.matchScore - a.matchScore);

            return propertiesWithScores;

        } catch (error) {
            console.error('❌ Error finding matching properties:', error);
            throw error;
        }
    }

    /**
     * Calculate budget range based on lead budget and priority
     * @param {Number} budget - Lead's budget
     * @param {String} priority - Lead priority (hot, warm, cold)
     * @returns {Object} Budget range with min and max
     */
    calculateBudgetRange(budget, priority) {
        if (!budget) return { min: 0, max: Infinity };

        // Adjust range based on priority
        let rangeMultiplier = 0.2; // 20% range by default
        switch (priority) {
            case 'hot':
                rangeMultiplier = 0.1; // 10% range for hot leads
                break;
            case 'warm':
                rangeMultiplier = 0.2; // 20% range for warm leads
                break;
            case 'cold':
                rangeMultiplier = 0.3; // 30% range for cold leads
                break;
        }

        const range = budget * rangeMultiplier;
        return {
            min: Math.max(0, budget - range),
            max: budget + range
        };
    }

    /**
     * Calculate match score between lead and property
     * @param {Object} lead - Lead object
     * @param {Object} property - Property object
     * @returns {Number} Match score between 0 and 1
     */
    calculateMatchScore(lead, property) {
        let score = 0;
        let factors = 0;

        // Property type match (40% weight)
        if (lead.propertyType && property.propertyType) {
            if (lead.propertyType === property.propertyType) {
                score += 0.4;
            } else if (this.isCompatiblePropertyType(lead.propertyType, property.propertyType)) {
                score += 0.2;
            }
            factors += 0.4;
        }

        // Budget match (30% weight)
        if (lead.budget && property.price && property.price.value) {
            const budgetRange = this.calculateBudgetRange(lead.budget, lead.priority);
            if (property.price.value >= budgetRange.min && property.price.value <= budgetRange.max) {
                score += 0.3;
            } else {
                // Partial score based on how close it is
                const distance = Math.min(
                    Math.abs(property.price.value - budgetRange.min),
                    Math.abs(property.price.value - budgetRange.max)
                );
                const maxDistance = lead.budget * 0.5; // 50% of budget
                const partialScore = Math.max(0, 0.3 - (distance / maxDistance) * 0.3);
                score += partialScore;
            }
            factors += 0.3;
        }

        // Location match (20% weight)
        if (lead.location && property.location && property.location.address) {
            const locationMatch = this.calculateLocationMatch(lead.location, property.location.address);
            score += locationMatch * 0.2;
            factors += 0.2;
        }

        // Timeline match (10% weight)
        if (lead.timeline && property.status) {
            const timelineMatch = this.calculateTimelineMatch(lead.timeline, property.status);
            score += timelineMatch * 0.1;
            factors += 0.1;
        }

        // Return normalized score
        return factors > 0 ? score / factors : 0;
    }

    /**
     * Check if property types are compatible
     * @param {String} leadType - Lead's preferred property type
     * @param {String} propertyType - Property's type
     * @returns {Boolean} True if compatible
     */
    isCompatiblePropertyType(leadType, propertyType) {
        const compatibility = {
            'apartment': ['condo', 'house'],
            'house': ['apartment', 'condo', 'townhouse'],
            'condo': ['apartment', 'house'],
            'townhouse': ['house', 'condo'],
            'commercial': ['other'],
            'land': ['other'],
            'other': ['apartment', 'house', 'condo', 'townhouse', 'commercial', 'land']
        };

        return compatibility[leadType]?.includes(propertyType) || false;
    }

    /**
     * Calculate location match score
     * @param {String} leadLocation - Lead's preferred location
     * @param {String} propertyLocation - Property's location
     * @returns {Number} Match score between 0 and 1
     */
    calculateLocationMatch(leadLocation, propertyLocation) {
        if (!leadLocation || !propertyLocation) return 0;

        const leadLoc = leadLocation.toLowerCase();
        const propLoc = propertyLocation.toLowerCase();

        // Exact match
        if (leadLoc === propLoc) return 1;

        // Contains match
        if (propLoc.includes(leadLoc) || leadLoc.includes(propLoc)) return 0.8;

        // Word match
        const leadWords = leadLoc.split(/\s+/);
        const propWords = propLoc.split(/\s+/);
        const commonWords = leadWords.filter(word => propWords.includes(word));

        if (commonWords.length > 0) {
            return commonWords.length / Math.max(leadWords.length, propWords.length);
        }

        return 0;
    }

    /**
     * Calculate timeline match score
     * @param {String} leadTimeline - Lead's timeline
     * @param {String} propertyStatus - Property's status
     * @returns {Number} Match score between 0 and 1
     */
    calculateTimelineMatch(leadTimeline, propertyStatus) {
        if (propertyStatus !== 'available') return 0;

        switch (leadTimeline) {
            case 'immediate':
                return 1;
            case '1-3_months':
                return 0.9;
            case '3-6_months':
                return 0.7;
            case '6+_months':
                return 0.5;
            case 'just_browsing':
                return 0.3;
            default:
                return 0.5;
        }
    }

    /**
     * Get property recommendations for a lead
     * @param {String} leadId - Lead ID
     * @param {Object} options - Recommendation options
     * @returns {Array} Array of recommended properties
     */
    async getPropertyRecommendations(leadId, options = {}) {
        try {
            const lead = await Lead.findById(leadId).populate('companyId');
            if (!lead) {
                throw new Error('Lead not found');
            }

            const recommendations = await this.findMatchingProperties(lead, {
                limit: options.limit || 5
            });

            // Add recommendation reasons
            const recommendationsWithReasons = recommendations.map(property => ({
                ...property,
                reasons: this.getRecommendationReasons(lead, property)
            }));

            return recommendationsWithReasons;

        } catch (error) {
            console.error('❌ Error getting property recommendations:', error);
            throw error;
        }
    }

    /**
     * Get reasons why a property was recommended
     * @param {Object} lead - Lead object
     * @param {Object} property - Property object
     * @returns {Array} Array of recommendation reasons
     */
    getRecommendationReasons(lead, property) {
        const reasons = [];

        // Property type match
        if (lead.propertyType === property.propertyType) {
            reasons.push(`Perfect match for ${property.propertyType} requirement`);
        } else if (this.isCompatiblePropertyType(lead.propertyType, property.propertyType)) {
            reasons.push(`Compatible with your ${lead.propertyType} preference`);
        }

        // Budget match
        if (lead.budget && property.price && property.price.value) {
            const budgetRange = this.calculateBudgetRange(lead.budget, lead.priority);
            if (property.price.value >= budgetRange.min && property.price.value <= budgetRange.max) {
                const priceText = this.formatPrice(property.price);
                reasons.push(`Within your budget range (₹${budgetRange.min.toLocaleString()} - ₹${budgetRange.max.toLocaleString()}) - ${priceText}`);
            }
        }

        // Location match
        if (lead.location && property.location && property.location.address) {
            const locationMatch = this.calculateLocationMatch(lead.location, property.location.address);
            if (locationMatch > 0.8) {
                reasons.push(`Located in your preferred area: ${property.location.address}`);
            } else if (locationMatch > 0.5) {
                reasons.push(`Near your preferred location: ${property.location.address}`);
            }
        }

        // High match score
        if (property.matchScore > 0.8) {
            reasons.push('High compatibility with your requirements');
        }

        return reasons;
    }

    /**
     * Format price for display
     * @param {Object} price - Price object with value and unit
     * @returns {String} Formatted price string
     */
    formatPrice(price) {
        if (!price || !price.value) return 'Price not available';

        const { value, unit, startingPrice } = price;
        let formattedPrice = '';

        switch (unit) {
            case 'lakh':
                formattedPrice = `₹${value} Lakh${value > 1 ? 's' : ''}`;
                break;
            case 'cr':
                formattedPrice = `₹${value} Cr${value > 1 ? 's' : ''}`;
                break;
            case 'thousand':
                formattedPrice = `₹${value}K`;
                break;
            case 'million':
                formattedPrice = `₹${value}M`;
                break;
            default:
                formattedPrice = `₹${value.toLocaleString()}`;
        }

        if (startingPrice) {
            formattedPrice = `Starting from ${formattedPrice}`;
        }

        return formattedPrice;
    }

    /**
     * Track property interest for a lead
     * @param {String} leadId - Lead ID
     * @param {String} propertyId - Property ID
     * @param {Object} interestData - Interest data
     * @returns {Object} Updated lead with property interest
     */
    async trackPropertyInterest(leadId, propertyId, interestData = {}) {
        try {
            const lead = await Lead.findById(leadId);
            if (!lead) {
                throw new Error('Lead not found');
            }

            // Check if property interest already exists
            const existingInterest = lead.propertyInterests.find(
                interest => interest.propertyId.toString() === propertyId
            );

            if (existingInterest) {
                // Update existing interest
                Object.assign(existingInterest, {
                    ...interestData,
                    lastContacted: new Date()
                });
            } else {
                // Add new property interest
                lead.propertyInterests.push({
                    propertyId,
                    interestLevel: interestData.interestLevel || 'medium',
                    notes: interestData.notes || '',
                    status: interestData.status || 'interested',
                    viewedAt: new Date(),
                    lastContacted: new Date()
                });
            }

            await lead.save();
            return lead;

        } catch (error) {
            console.error('❌ Error tracking property interest:', error);
            throw error;
        }
    }
}

module.exports = new PropertyMatchingService();
