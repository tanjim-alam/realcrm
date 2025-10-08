import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Home,
    MapPin,
    DollarSign,
    Bed,
    Bath,
    Square,
    Building2,
    Calendar,
    Star,
    Phone,
    Mail,
    Wifi,
    Car,
    TreePine,
    Dumbbell,
    Waves,
    BookOpen,
    Camera,
    Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreateProperty = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

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

            await api.post('/properties', submitData);
            toast.success('Property created successfully!');
            navigate('/properties');
        } catch (error) {
            console.error('Error creating property:', error);
            toast.error(error.response?.data?.message || 'Failed to create property');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-6">
                        <button
                            onClick={() => navigate('/properties')}
                            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">Back to Properties</span>
                        </button>
                    </div>

                    <div className="text-center">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                            Create New Property
                        </h1>
                        <p className="text-slate-600 text-lg">
                            Add a new property to your portfolio with complete details
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Home className="h-6 w-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Basic Information</h2>
                            </div>

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
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Property Type *</label>
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
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Status *</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status} value={status} className="capitalize">
                                                {status.replace('_', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Price Information */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Price Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                                <div className="md:col-span-3">
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
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <MapPin className="h-6 w-6 text-purple-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Location Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
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
                            </div>
                        </div>

                        {/* Configuration */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Building2 className="h-6 w-6 text-orange-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Configuration</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Balconies</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.configuration.balconies}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            configuration: { ...formData.configuration, balconies: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        placeholder="e.g., 2"
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
                        </div>

                        {/* Area Information */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-teal-100 rounded-lg">
                                    <Square className="h-6 w-6 text-teal-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Area Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Carpet Area</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.area.carpet}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            area: { ...formData.area, carpet: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        placeholder="e.g., 1850"
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
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Super Built-up Area</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.area.superBuiltUp}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            area: { ...formData.area, superBuiltUp: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        placeholder="e.g., 2200"
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
                        </div>

                        {/* Description */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <BookOpen className="h-6 w-6 text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Description</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Property Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                    rows="4"
                                    placeholder="Describe the property, its features, and unique selling points..."
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>Creating Property...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        <span>Create Property</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateProperty;



