const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  developer: {
    type: String,
    trim: true
  },
  price: {
    value: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['lakh', 'cr', 'thousand', 'million'],
      default: 'lakh'
    },
    displayText: {
      type: String,
      trim: true
    },
    startingPrice: {
      type: Boolean,
      default: false
    }
  },
  location: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    pincode: {
      type: String,
      trim: true
    },
    landmark: {
      type: String,
      trim: true
    }
  },
  description: {
    type: String,
    trim: true
  },
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'villa', 'condo', 'townhouse', 'commercial', 'land', 'plot', 'farmhouse', 'penthouse', 'studio', 'other'],
    default: 'apartment'
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold', 'rented', 'pre_launch', 'launched', 'under_construction', 'ready_to_move'],
    default: 'available'
  },
  configuration: {
    bedrooms: {
      type: String,
      trim: true
    },
    bathrooms: {
      type: Number,
      min: 0
    },
    balconies: {
      type: Number,
      min: 0
    },
    parking: {
      type: String,
      trim: true
    }
  },
  area: {
    carpet: {
      type: Number,
      min: 0
    },
    builtUp: {
      type: Number,
      min: 0
    },
    superBuiltUp: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      enum: ['sqft', 'sqm', 'sqyd'],
      default: 'sqft'
    }
  },
  projectDetails: {
    totalUnits: {
      type: Number,
      min: 0
    },
    totalTowers: {
      type: Number,
      min: 0
    },
    totalFloors: {
      type: Number,
      min: 0
    },
    totalLandArea: {
      type: Number,
      min: 0
    },
    landAreaUnit: {
      type: String,
      enum: ['acres', 'sqft', 'sqm', 'hectares'],
      default: 'acres'
    },
    possessionDate: {
      type: Date
    },
    reraNumber: {
      type: String,
      trim: true
    }
  },
  amenities: {
    lifestyle: [{
      type: String,
      trim: true
    }],
    wellness: [{
      type: String,
      trim: true
    }],
    outdoor: [{
      type: String,
      trim: true
    }],
    community: [{
      type: String,
      trim: true
    }],
    safety: [{
      type: String,
      trim: true
    }]
  },
  features: [{
    type: String,
    trim: true
  }],
  connectivity: {
    metro: {
      distance: {
        type: Number,
        min: 0
      },
      station: {
        type: String,
        trim: true
      }
    },
    airport: {
      distance: {
        type: Number,
        min: 0
      },
      name: {
        type: String,
        trim: true
      }
    },
    railway: {
      distance: {
        type: Number,
        min: 0
      },
      station: {
        type: String,
        trim: true
      }
    },
    highways: [{
      name: {
        type: String,
        trim: true
      },
      distance: {
        type: Number,
        min: 0
      }
    }],
    landmarks: [{
      name: {
        type: String,
        trim: true
      },
      distance: {
        type: Number,
        min: 0
      },
      type: {
        type: String,
        trim: true
      }
    }]
  },
  investment: {
    rentalYield: {
      type: Number,
      min: 0
    },
    appreciation: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    emi: {
      type: Number,
      min: 0
    }
  },
  contact: {
    phone: [{
      type: String,
      trim: true
    }],
    email: {
      type: String,
      trim: true
    },
    whatsapp: {
      type: String,
      trim: true
    }
  },
  listedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better search performance
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ 'price.value': 1 });
propertySchema.index({ 'area.builtUp': 1 });
propertySchema.index({ 'configuration.bedrooms': 1 });

module.exports = mongoose.model('Property', propertySchema);