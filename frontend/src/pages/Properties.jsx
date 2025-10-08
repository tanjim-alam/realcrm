import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Building2,
  Calendar,
  Star,
  Eye,
  Phone,
  Mail,
  Download,
  FileText,
  Users,
  Shield,
  Wifi,
  Car,
  TreePine,
  Dumbbell,
  Waves,
  BookOpen,
  Camera,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Helper functions
const formatPropertyPrice = (price) => {
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
};

const getStatusColor = (status) => {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800 border-green-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'sold': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'rented': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'pre_launch': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'launched': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'under_construction': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'ready_to_move': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const Properties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [copiedIds, setCopiedIds] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    developer: '',
    price: {
      value: '',
      unit: 'lakh',
      displayText: '',
      startingPrice: false
    },
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    description: '',
    propertyType: 'apartment',
    status: 'available',
    configuration: {
      bedrooms: '',
      bathrooms: '',
      balconies: '',
      parking: ''
    },
    area: {
      carpet: '',
      builtUp: '',
      superBuiltUp: '',
      unit: 'sqft'
    },
    projectDetails: {
      totalUnits: '',
      totalTowers: '',
      totalFloors: '',
      totalLandArea: '',
      landAreaUnit: 'acres',
      possessionDate: '',
      reraNumber: ''
    },
    amenities: {
      lifestyle: [],
      wellness: [],
      outdoor: [],
      community: [],
      safety: []
    },
    features: [],
    connectivity: {
      metro: { distance: '', station: '' },
      airport: { distance: '', name: '' },
      railway: { distance: '', station: '' },
      highways: [],
      landmarks: []
    },
    investment: {
      rentalYield: '',
      appreciation: 'medium',
      emi: ''
    },
    contact: {
      phone: [''],
      email: '',
      whatsapp: ''
    },
    isFeatured: false,
    isVerified: false
  });

  const statusOptions = ['available', 'pending', 'sold', 'rented', 'pre_launch', 'launched', 'under_construction', 'ready_to_move'];
  const propertyTypes = ['apartment', 'house', 'villa', 'condo', 'townhouse', 'commercial', 'land', 'plot', 'farmhouse', 'penthouse', 'studio', 'other'];
  const priceUnits = ['lakh', 'cr', 'thousand', 'million'];
  const areaUnits = ['sqft', 'sqm', 'sqyd'];
  const landAreaUnits = ['acres', 'sqft', 'sqm', 'hectares'];

  useEffect(() => {
    fetchProperties();
  }, [searchTerm, statusFilter]);

  const fetchProperties = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/properties?${params.toString()}`);
      setProperties(response.data.properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        price: {
          ...formData.price,
          value: parseFloat(formData.price.value) || 0
        },
        configuration: {
          ...formData.configuration,
          bathrooms: formData.configuration.bathrooms ? parseInt(formData.configuration.bathrooms) : 0,
          balconies: formData.configuration.balconies ? parseInt(formData.configuration.balconies) : 0
        },
        area: {
          ...formData.area,
          carpet: formData.area.carpet ? parseFloat(formData.area.carpet) : 0,
          builtUp: formData.area.builtUp ? parseFloat(formData.area.builtUp) : 0,
          superBuiltUp: formData.area.superBuiltUp ? parseFloat(formData.area.superBuiltUp) : 0
        },
        projectDetails: {
          ...formData.projectDetails,
          totalUnits: formData.projectDetails.totalUnits ? parseInt(formData.projectDetails.totalUnits) : 0,
          totalTowers: formData.projectDetails.totalTowers ? parseInt(formData.projectDetails.totalTowers) : 0,
          totalFloors: formData.projectDetails.totalFloors ? parseInt(formData.projectDetails.totalFloors) : 0,
          totalLandArea: formData.projectDetails.totalLandArea ? parseFloat(formData.projectDetails.totalLandArea) : 0,
          possessionDate: formData.projectDetails.possessionDate ? new Date(formData.projectDetails.possessionDate) : null
        },
        investment: {
          ...formData.investment,
          rentalYield: formData.investment.rentalYield ? parseFloat(formData.investment.rentalYield) : 0,
          emi: formData.investment.emi ? parseFloat(formData.investment.emi) : 0
        }
      };

      if (editingProperty) {
        await api.put(`/properties/${editingProperty._id}`, submitData);
        toast.success('Property updated successfully');
      } else {
        await api.post('/properties', submitData);
        toast.success('Property created successfully');
      }

      setShowModal(false);
      setEditingProperty(null);
      resetForm();
      fetchProperties();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save property');
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title || '',
      developer: property.developer || '',
      price: {
        value: property.price?.value?.toString() || '',
        unit: property.price?.unit || 'lakh',
        displayText: property.price?.displayText || '',
        startingPrice: property.price?.startingPrice || false
      },
      location: {
        address: property.location?.address || property.location || '',
        city: property.location?.city || '',
        state: property.location?.state || '',
        pincode: property.location?.pincode || '',
        landmark: property.location?.landmark || ''
      },
      description: property.description || '',
      propertyType: property.propertyType || 'apartment',
      status: property.status || 'available',
      configuration: {
        bedrooms: property.configuration?.bedrooms || '',
        bathrooms: property.configuration?.bathrooms?.toString() || '',
        balconies: property.configuration?.balconies?.toString() || '',
        parking: property.configuration?.parking || ''
      },
      area: {
        carpet: property.area?.carpet?.toString() || '',
        builtUp: property.area?.builtUp?.toString() || '',
        superBuiltUp: property.area?.superBuiltUp?.toString() || '',
        unit: property.area?.unit || 'sqft'
      },
      projectDetails: {
        totalUnits: property.projectDetails?.totalUnits?.toString() || '',
        totalTowers: property.projectDetails?.totalTowers?.toString() || '',
        totalFloors: property.projectDetails?.totalFloors?.toString() || '',
        totalLandArea: property.projectDetails?.totalLandArea?.toString() || '',
        landAreaUnit: property.projectDetails?.landAreaUnit || 'acres',
        possessionDate: property.projectDetails?.possessionDate ?
          new Date(property.projectDetails.possessionDate).toISOString().split('T')[0] : '',
        reraNumber: property.projectDetails?.reraNumber || ''
      },
      amenities: property.amenities || {
        lifestyle: [],
        wellness: [],
        outdoor: [],
        community: [],
        safety: []
      },
      features: property.features || [],
      connectivity: property.connectivity || {
        metro: { distance: '', station: '' },
        airport: { distance: '', name: '' },
        railway: { distance: '', station: '' },
        highways: [],
        landmarks: []
      },
      investment: property.investment || {
        rentalYield: '',
        appreciation: 'medium',
        emi: ''
      },
      contact: property.contact || {
        phone: [''],
        email: '',
        whatsapp: ''
      },
      isFeatured: property.isFeatured || false,
      isVerified: property.isVerified || false
    });
    setShowModal(true);
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await api.delete(`/properties/${propertyId}`);
        toast.success('Property deleted successfully');
        fetchProperties();
      } catch (error) {
        toast.error('Failed to delete property');
      }
    }
  };

  const handleCopyId = async (propertyId) => {
    try {
      await navigator.clipboard.writeText(propertyId);
      setCopiedIds(prev => new Set([...prev, propertyId]));
      toast.success('Property ID copied to clipboard!');

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy property ID:', error);
      toast.error('Failed to copy property ID');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      developer: '',
      price: {
        value: '',
        unit: 'lakh',
        displayText: '',
        startingPrice: false
      },
      location: {
        address: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
      },
      description: '',
      propertyType: 'apartment',
      status: 'available',
      configuration: {
        bedrooms: '',
        bathrooms: '',
        balconies: '',
        parking: ''
      },
      area: {
        carpet: '',
        builtUp: '',
        superBuiltUp: '',
        unit: 'sqft'
      },
      projectDetails: {
        totalUnits: '',
        totalTowers: '',
        totalFloors: '',
        totalLandArea: '',
        landAreaUnit: 'acres',
        possessionDate: '',
        reraNumber: ''
      },
      amenities: {
        lifestyle: [],
        wellness: [],
        outdoor: [],
        community: [],
        safety: []
      },
      features: [],
      connectivity: {
        metro: { distance: '', station: '' },
        airport: { distance: '', name: '' },
        railway: { distance: '', station: '' },
        highways: [],
        landmarks: []
      },
      investment: {
        rentalYield: '',
        appreciation: 'medium',
        emi: ''
      },
      contact: {
        phone: [''],
        email: '',
        whatsapp: ''
      },
      isFeatured: false,
      isVerified: false
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-gray-100 text-gray-800',
      rented: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Properties
              </h1>
              <p className="text-slate-600 mt-2 text-lg">
                Manage your property listings and track their status
              </p>
            </div>
            <button
              onClick={() => navigate('/properties/create')}
              className="mt-6 sm:mt-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center group"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
              Add Property
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 px-4 py-3 border border-slate-300 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status} className="capitalize">
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Loading properties...</p>
              </div>
            </div>
          ) : filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <div key={property._id} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors duration-200">
                      {property.title}
                    </h3>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">
                        ID: {property._id}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold ${getStatusColor(property.status)}`}>
                    {property.status}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Location */}
                  <div className="flex items-start text-slate-600">
                    <MapPin className="h-5 w-5 mr-3 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium block">{property.location?.address || property.location}</span>
                      {property.location?.city && (
                        <span className="text-sm text-slate-500">{property.location.city}</span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    <DollarSign className="h-6 w-6 mr-2 text-green-600" />
                    {property.price?.displayText || formatPropertyPrice(property.price)}
                  </div>

                  {/* Configuration */}
                  <div className="flex flex-wrap gap-2 text-slate-600">
                    {property.configuration?.bedrooms && (
                      <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2">
                        <Bed className="h-4 w-4 mr-2 text-slate-500" />
                        <span className="font-semibold text-sm">{property.configuration.bedrooms}</span>
                      </div>
                    )}
                    {property.configuration?.bathrooms && (
                      <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2">
                        <Bath className="h-4 w-4 mr-2 text-slate-500" />
                        <span className="font-semibold text-sm">{property.configuration.bathrooms} bath</span>
                      </div>
                    )}
                    {property.area?.builtUp && (
                      <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2">
                        <Square className="h-4 w-4 mr-2 text-slate-500" />
                        <span className="font-semibold text-sm">{property.area.builtUp} {property.area.unit}</span>
                      </div>
                    )}
                    {property.configuration?.parking && (
                      <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2">
                        <Car className="h-4 w-4 mr-2 text-slate-500" />
                        <span className="font-semibold text-sm">{property.configuration.parking}</span>
                      </div>
                    )}
                  </div>

                  {/* Property Type and Developer */}
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold capitalize">
                      {property.propertyType}
                    </div>
                    {property.developer && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
                        <Building2 className="h-3 w-3 mr-1" />
                        {property.developer}
                      </div>
                    )}
                    {property.isFeatured && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </div>
                    )}
                    {property.isVerified && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                </div>

                {property.description && (
                  <p className="text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                    {property.description}
                  </p>
                )}

                {/* Project Details */}
                {(property.projectDetails?.totalUnits || property.projectDetails?.possessionDate) && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Project Details</h4>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      {property.projectDetails?.totalUnits && (
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1 text-slate-400" />
                          <span>{property.projectDetails.totalUnits} units</span>
                        </div>
                      )}
                      {property.projectDetails?.possessionDate && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                          <span>Possession: {new Date(property.projectDetails.possessionDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {property.projectDetails?.reraNumber && (
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-1 text-slate-400" />
                          <span>RERA: {property.projectDetails.reraNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Amenities Preview */}
                {property.amenities && (
                  (property.amenities.lifestyle?.length > 0 ||
                    property.amenities.wellness?.length > 0 ||
                    property.amenities.outdoor?.length > 0 ||
                    property.amenities.safety?.length > 0) && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Key Amenities</h4>
                      <div className="flex flex-wrap gap-1">
                        {property.amenities.lifestyle?.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="text-xs bg-white text-slate-600 px-2 py-1 rounded-full">
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.wellness?.slice(0, 2).map((amenity, index) => (
                          <span key={index} className="text-xs bg-white text-slate-600 px-2 py-1 rounded-full">
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.outdoor?.slice(0, 2).map((amenity, index) => (
                          <span key={index} className="text-xs bg-white text-slate-600 px-2 py-1 rounded-full">
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.safety?.slice(0, 2).map((amenity, index) => (
                          <span key={index} className="text-xs bg-white text-slate-600 px-2 py-1 rounded-full">
                            {amenity}
                          </span>
                        ))}
                        {(property.amenities.lifestyle?.length > 3 ||
                          property.amenities.wellness?.length > 2 ||
                          property.amenities.outdoor?.length > 2 ||
                          property.amenities.safety?.length > 2) && (
                            <span className="text-xs bg-white text-slate-500 px-2 py-1 rounded-full">
                              +more
                            </span>
                          )}
                      </div>
                    </div>
                  )
                )}

                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <span className="text-sm text-slate-500 font-medium">
                    {format(new Date(property.createdAt), 'MMM d, yyyy')}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCopyId(property._id)}
                      className={`p-2 rounded-lg transition-all duration-200 group ${copiedIds.has(property._id)
                        ? 'text-green-600 bg-green-50'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                      title="Copy Property ID"
                    >
                      {copiedIds.has(property._id) ? (
                        <Check className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      ) : (
                        <Copy className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      )}
                    </button>
                    <button
                      onClick={() => navigate(`/properties/edit/${property._id}`)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                      title="Edit Property"
                    >
                      <Edit className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    </button>
                    <button
                      onClick={() => handleDelete(property._id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                      title="Delete Property"
                    >
                      <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-12">
                <Home className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No properties found</h3>
                <p className="text-slate-500">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {editingProperty ? 'Edit Property' : 'Add New Property'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Property Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="e.g., Sobha Scarlet Woods"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Developer</label>
                      <input
                        type="text"
                        value={formData.developer}
                        onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="e.g., Sobha Limited"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Price Value *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price.value}
                        onChange={(e) => setFormData({
                          ...formData,
                          price: { ...formData.price, value: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="e.g., 80"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Price Unit *</label>
                      <select
                        value={formData.price.unit}
                        onChange={(e) => setFormData({
                          ...formData,
                          price: { ...formData.price, unit: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                      >
                        {priceUnits.map(unit => (
                          <option key={unit} value={unit} className="capitalize">
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Address *</label>
                      <input
                        type="text"
                        required
                        value={formData.location.address}
                        onChange={(e) => setFormData({
                          ...formData,
                          location: { ...formData.location, address: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="e.g., Near Sobha Royal Pavilion, Sarjapur"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">City *</label>
                      <input
                        type="text"
                        required
                        value={formData.location.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          location: { ...formData.location, city: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="e.g., Bangalore"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">State</label>
                      <input
                        type="text"
                        value={formData.location.state}
                        onChange={(e) => setFormData({
                          ...formData,
                          location: { ...formData.location, state: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="e.g., Karnataka"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Pincode</label>
                      <input
                        type="text"
                        value={formData.location.pincode}
                        onChange={(e) => setFormData({
                          ...formData,
                          location: { ...formData.location, pincode: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="e.g., 560035"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Property Type</label>
                      <select
                        value={formData.propertyType}
                        onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                      >
                        {propertyTypes.map(type => (
                          <option key={type} value={type} className="capitalize">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status} className="capitalize">
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Bedrooms</label>
                      <input
                        type="text"
                        value={formData.configuration.bedrooms}
                        onChange={(e) => setFormData({
                          ...formData,
                          configuration: { ...formData.configuration, bedrooms: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="e.g., 3, 3.5 & 4 BHK"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Bathrooms</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.configuration.bathrooms}
                        onChange={(e) => setFormData({
                          ...formData,
                          configuration: { ...formData.configuration, bathrooms: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="e.g., 3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Built-up Area</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.area.builtUp}
                        onChange={(e) => setFormData({
                          ...formData,
                          area: { ...formData.area, builtUp: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="e.g., 1900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Area Unit</label>
                      <select
                        value={formData.area.unit}
                        onChange={(e) => setFormData({
                          ...formData,
                          area: { ...formData.area, unit: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                      >
                        {areaUnits.map(unit => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                      rows="3"
                      placeholder="Describe the property, its features, and unique selling points..."
                    />
                  </div>

                  {/* Additional Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Price Display Text</label>
                      <input
                        type="text"
                        value={formData.price.displayText}
                        onChange={(e) => setFormData({
                          ...formData,
                          price: { ...formData.price, displayText: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="e.g., Starting from ₹80 Lakhs"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.price.startingPrice}
                          onChange={(e) => setFormData({
                            ...formData,
                            price: { ...formData.price, startingPrice: e.target.checked }
                          })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-700">Starting Price</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Landmark</label>
                      <input
                        type="text"
                        value={formData.location.landmark}
                        onChange={(e) => setFormData({
                          ...formData,
                          location: { ...formData.location, landmark: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="e.g., Sarjapur Road"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Parking</label>
                      <input
                        type="text"
                        value={formData.configuration.parking}
                        onChange={(e) => setFormData({
                          ...formData,
                          configuration: { ...formData.configuration, parking: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="e.g., 2 Covered"
                      />
                    </div>
                  </div>

                  {/* Project Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Project Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Total Units</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.projectDetails.totalUnits}
                          onChange={(e) => setFormData({
                            ...formData,
                            projectDetails: { ...formData.projectDetails, totalUnits: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                          placeholder="e.g., 200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Total Towers</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.projectDetails.totalTowers}
                          onChange={(e) => setFormData({
                            ...formData,
                            projectDetails: { ...formData.projectDetails, totalTowers: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                          placeholder="e.g., 1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Total Floors</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.projectDetails.totalFloors}
                          onChange={(e) => setFormData({
                            ...formData,
                            projectDetails: { ...formData.projectDetails, totalFloors: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                          placeholder="e.g., 9"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Total Land Area</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.projectDetails.totalLandArea}
                          onChange={(e) => setFormData({
                            ...formData,
                            projectDetails: { ...formData.projectDetails, totalLandArea: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                          placeholder="e.g., 5.3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Land Area Unit</label>
                        <select
                          value={formData.projectDetails.landAreaUnit}
                          onChange={(e) => setFormData({
                            ...formData,
                            projectDetails: { ...formData.projectDetails, landAreaUnit: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        >
                          {landAreaUnits.map(unit => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Possession Date</label>
                        <input
                          type="date"
                          value={formData.projectDetails.possessionDate}
                          onChange={(e) => setFormData({
                            ...formData,
                            projectDetails: { ...formData.projectDetails, possessionDate: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">RERA Number</label>
                        <input
                          type="text"
                          value={formData.projectDetails.reraNumber}
                          onChange={(e) => setFormData({
                            ...formData,
                            projectDetails: { ...formData.projectDetails, reraNumber: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                          placeholder="e.g., Coming Soon"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amenities Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Amenities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Lifestyle Amenities</label>
                        <textarea
                          value={formData.amenities.lifestyle.join(', ')}
                          onChange={(e) => setFormData({
                            ...formData,
                            amenities: {
                              ...formData.amenities,
                              lifestyle: e.target.value.split(',').map(item => item.trim()).filter(item => item)
                            }
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                          rows="3"
                          placeholder="e.g., Clubhouse, Lounge, Indoor Games, Library"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Wellness Amenities</label>
                        <textarea
                          value={formData.amenities.wellness.join(', ')}
                          onChange={(e) => setFormData({
                            ...formData,
                            amenities: {
                              ...formData.amenities,
                              wellness: e.target.value.split(',').map(item => item.trim()).filter(item => item)
                            }
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                          rows="3"
                          placeholder="e.g., Swimming Pool, Gym, Spa, Yoga Deck"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Outdoor Amenities</label>
                        <textarea
                          value={formData.amenities.outdoor.join(', ')}
                          onChange={(e) => setFormData({
                            ...formData,
                            amenities: {
                              ...formData.amenities,
                              outdoor: e.target.value.split(',').map(item => item.trim()).filter(item => item)
                            }
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                          rows="3"
                          placeholder="e.g., Gardens, Jogging Track, Play Area, Court"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Safety Amenities</label>
                        <textarea
                          value={formData.amenities.safety.join(', ')}
                          onChange={(e) => setFormData({
                            ...formData,
                            amenities: {
                              ...formData.amenities,
                              safety: e.target.value.split(',').map(item => item.trim()).filter(item => item)
                            }
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                          rows="3"
                          placeholder="e.g., 24/7 CCTV, Security, Smart Locks"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Numbers</label>
                        <textarea
                          value={formData.contact.phone.join(', ')}
                          onChange={(e) => setFormData({
                            ...formData,
                            contact: {
                              ...formData.contact,
                              phone: e.target.value.split(',').map(item => item.trim()).filter(item => item)
                            }
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                          rows="2"
                          placeholder="e.g., +919380660766, +919876543210"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={formData.contact.email}
                          onChange={(e) => setFormData({
                            ...formData,
                            contact: { ...formData.contact, email: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                          placeholder="e.g., info@sobhascarlet.in"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp</label>
                        <input
                          type="text"
                          value={formData.contact.whatsapp}
                          onChange={(e) => setFormData({
                            ...formData,
                            contact: { ...formData.contact, whatsapp: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                          placeholder="e.g., +919380660766"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.isFeatured}
                            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-slate-700">Featured Property</span>
                        </label>

                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.isVerified}
                            onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-slate-700">Verified Property</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {editingProperty ? 'Update Property' : 'Create Property'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
