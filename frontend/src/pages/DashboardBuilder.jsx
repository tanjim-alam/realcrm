import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import {
    Plus,
    Settings,
    Trash2,
    Edit,
    Save,
    RefreshCw,
    BarChart3,
    PieChart,
    TrendingUp,
    Users,
    Building2,
    Target,
    Activity,
    Calendar,
    Filter,
    Eye,
    EyeOff,
    Move,
    GripVertical,
    Download,
    Upload,
    Copy,
    Share2,
    X,
    Check,
    AlertCircle,
    Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardBuilder = () => {
    const { user } = useAuth();
    const [widgets, setWidgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showWidgetModal, setShowWidgetModal] = useState(false);
    const [editingWidget, setEditingWidget] = useState(null);
    const [draggedWidget, setDraggedWidget] = useState(null);
    const [widgetData, setWidgetData] = useState({});

    // Widget form state
    const [widgetForm, setWidgetForm] = useState({
        name: '',
        type: 'leads_count',
        position: { x: 0, y: 0, w: 4, h: 3 },
        config: {
            title: '',
            description: '',
            chartType: 'line',
            dateRange: 'this_month',
            customDateRange: { start: '', end: '' },
            filters: {
                leadStatus: [],
                propertyType: [],
                assignedTo: [],
                leadSource: []
            },
            refreshInterval: 300,
            showDataLabels: true,
            showLegend: true,
            colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
        }
    });

    const widgetTypes = [
        { id: 'leads_count', name: 'Leads Count', icon: Users, description: 'Total number of leads' },
        { id: 'properties_count', name: 'Properties Count', icon: Building2, description: 'Total number of properties' },
        { id: 'conversion_rate', name: 'Conversion Rate', icon: Target, description: 'Lead conversion percentage' },
        { id: 'revenue', name: 'Revenue', icon: TrendingUp, description: 'Total revenue generated' },
        { id: 'leads_chart', name: 'Leads Chart', icon: BarChart3, description: 'Leads over time chart' },
        { id: 'properties_chart', name: 'Properties Chart', icon: PieChart, description: 'Properties by type chart' },
        { id: 'conversion_funnel', name: 'Conversion Funnel', icon: Activity, description: 'Lead conversion funnel' },
        { id: 'top_agents', name: 'Top Agents', icon: Users, description: 'Best performing agents' },
        { id: 'recent_leads', name: 'Recent Leads', icon: Users, description: 'Latest leads' },
        { id: 'recent_properties', name: 'Recent Properties', icon: Building2, description: 'Latest properties' },
        { id: 'lead_sources', name: 'Lead Sources', icon: Target, description: 'Leads by source' },
        { id: 'property_types', name: 'Property Types', icon: Building2, description: 'Properties by type' },
        { id: 'monthly_trends', name: 'Monthly Trends', icon: TrendingUp, description: 'Monthly performance trends' }
    ];

    const chartTypes = [
        { id: 'line', name: 'Line Chart' },
        { id: 'bar', name: 'Bar Chart' },
        { id: 'pie', name: 'Pie Chart' },
        { id: 'doughnut', name: 'Doughnut Chart' },
        { id: 'area', name: 'Area Chart' },
        { id: 'scatter', name: 'Scatter Plot' }
    ];

    const dateRanges = [
        { id: 'today', name: 'Today' },
        { id: 'yesterday', name: 'Yesterday' },
        { id: 'this_week', name: 'This Week' },
        { id: 'last_week', name: 'Last Week' },
        { id: 'this_month', name: 'This Month' },
        { id: 'last_month', name: 'Last Month' },
        { id: 'this_year', name: 'This Year' },
        { id: 'last_year', name: 'Last Year' },
        { id: 'custom', name: 'Custom Range' }
    ];

    useEffect(() => {
        fetchWidgets();
    }, []);

    const fetchWidgets = async () => {
        try {
            setLoading(true);
            const response = await api.get('/dashboard-builder/widgets');
            setWidgets(response.data);

            // Fetch data for each widget
            const dataPromises = response.data.map(widget =>
                api.get(`/dashboard-builder/widgets/${widget._id}/data`)
                    .then(res => ({ widgetId: widget._id, data: res.data }))
                    .catch(err => ({ widgetId: widget._id, data: null, error: err.message }))
            );

            const dataResults = await Promise.all(dataPromises);
            const dataMap = {};
            dataResults.forEach(result => {
                dataMap[result.widgetId] = result.data;
            });
            setWidgetData(dataMap);
        } catch (error) {
            console.error('Error fetching widgets:', error);
            toast.error('Failed to fetch widgets');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWidget = () => {
        setEditingWidget(null);
        setWidgetForm({
            name: '',
            type: 'leads_count',
            position: { x: 0, y: 0, w: 4, h: 3 },
            config: {
                title: '',
                description: '',
                chartType: 'line',
                dateRange: 'this_month',
                customDateRange: { start: '', end: '' },
                filters: {
                    leadStatus: [],
                    propertyType: [],
                    assignedTo: [],
                    leadSource: []
                },
                refreshInterval: 300,
                showDataLabels: true,
                showLegend: true,
                colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
            }
        });
        setShowWidgetModal(true);
    };

    const handleEditWidget = (widget) => {
        setEditingWidget(widget);
        setWidgetForm(widget);
        setShowWidgetModal(true);
    };

    const handleSaveWidget = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);

            if (editingWidget) {
                await api.put(`/dashboard-builder/widgets/${editingWidget._id}`, widgetForm);
                toast.success('Widget updated successfully');
            } else {
                await api.post('/dashboard-builder/widgets', widgetForm);
                toast.success('Widget created successfully');
            }

            setShowWidgetModal(false);
            setEditingWidget(null);
            fetchWidgets();
        } catch (error) {
            console.error('Error saving widget:', error);
            toast.error('Failed to save widget');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteWidget = async (widgetId) => {
        if (!window.confirm('Are you sure you want to delete this widget?')) return;

        try {
            await api.delete(`/dashboard-builder/widgets/${widgetId}`);
            toast.success('Widget deleted successfully');
            fetchWidgets();
        } catch (error) {
            console.error('Error deleting widget:', error);
            toast.error('Failed to delete widget');
        }
    };

    const handleDragStart = (e, widget) => {
        setDraggedWidget(widget);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (!draggedWidget) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / 100);
        const y = Math.floor((e.clientY - rect.top) / 100);

        const updatedWidget = {
            ...draggedWidget,
            position: { ...draggedWidget.position, x, y }
        };

        handleUpdateWidgetPosition(updatedWidget);
        setDraggedWidget(null);
    };

    const handleUpdateWidgetPosition = async (widget) => {
        try {
            await api.put(`/dashboard-builder/widgets/${widget._id}`, {
                position: widget.position
            });

            setWidgets(prev =>
                prev.map(w => w._id === widget._id ? widget : w)
            );
        } catch (error) {
            console.error('Error updating widget position:', error);
            toast.error('Failed to update widget position');
        }
    };

    const handleResizeWidget = async (widget, newSize) => {
        try {
            const updatedWidget = {
                ...widget,
                position: { ...widget.position, ...newSize }
            };

            await api.put(`/dashboard-builder/widgets/${widget._id}`, {
                position: updatedWidget.position
            });

            setWidgets(prev =>
                prev.map(w => w._id === widget._id ? updatedWidget : w)
            );
        } catch (error) {
            console.error('Error resizing widget:', error);
            toast.error('Failed to resize widget');
        }
    };

    const renderWidget = (widget) => {
        const data = widgetData[widget._id];
        const widgetType = widgetTypes.find(t => t.id === widget.type);

        return (
            <div
                key={widget._id}
                className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 hover:shadow-xl transition-all duration-300"
                style={{
                    gridColumn: `span ${widget.position.w}`,
                    gridRow: `span ${widget.position.h}`,
                    minHeight: `${widget.position.h * 100}px`
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, widget)}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <widgetType.icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">{widget.name}</h3>
                            <p className="text-sm text-slate-600">{widgetType.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleEditWidget(widget)}
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDeleteWidget(widget._id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="p-2 text-slate-400 cursor-move">
                            <GripVertical className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                <div className="h-full">
                    {data ? (
                        <WidgetContent widget={widget} data={data} />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <RefreshCw className="h-8 w-8 text-slate-400 animate-spin mx-auto mb-2" />
                                <p className="text-sm text-slate-500">Loading data...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const WidgetContent = ({ widget, data }) => {
        switch (widget.type) {
            case 'leads_count':
            case 'properties_count':
                return (
                    <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">{data.count}</div>
                        <div className="text-sm text-slate-600">Total {widget.type.replace('_', ' ')}</div>
                    </div>
                );

            case 'conversion_rate':
                return (
                    <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">{data.rate}%</div>
                        <div className="text-sm text-slate-600">
                            {data.converted} of {data.total} leads
                        </div>
                    </div>
                );

            case 'revenue':
                return (
                    <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                            ₹{data.revenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-600">Total Revenue</div>
                    </div>
                );

            case 'leads_chart':
            case 'properties_chart':
            case 'lead_sources':
            case 'property_types':
            case 'monthly_trends':
                return (
                    <div className="h-full">
                        <div className="text-sm text-slate-600 mb-2">Chart Data</div>
                        <div className="text-xs text-slate-500">
                            {data.labels ? `${data.labels.length} data points` : 'No data available'}
                        </div>
                    </div>
                );

            case 'conversion_funnel':
                return (
                    <div className="space-y-2">
                        {data.map((stage, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">{stage.name}</span>
                                <span className="font-semibold text-slate-900">{stage.value}</span>
                            </div>
                        ))}
                    </div>
                );

            case 'top_agents':
                return (
                    <div className="space-y-2">
                        {data.slice(0, 5).map((agent, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">{agent.name}</span>
                                <span className="font-semibold text-slate-900">{agent.leadsCount} leads</span>
                            </div>
                        ))}
                    </div>
                );

            case 'recent_leads':
                return (
                    <div className="space-y-2">
                        {data.leads.slice(0, 5).map((lead, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">{lead.name}</span>
                                <span className="text-xs text-slate-500">{lead.status}</span>
                            </div>
                        ))}
                    </div>
                );

            case 'recent_properties':
                return (
                    <div className="space-y-2">
                        {data.properties.slice(0, 5).map((property, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">{property.title}</span>
                                <span className="text-xs text-slate-500">{property.propertyType}</span>
                            </div>
                        ))}
                    </div>
                );

            default:
                return (
                    <div className="text-center text-slate-500">
                        <Info className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Widget type not supported</p>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading dashboard builder...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Custom Dashboard Builder
                        </h1>
                        <p className="text-slate-600 mt-1">
                            Create personalized dashboards with drag-and-drop widgets.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchWidgets}
                            className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
                        >
                            <RefreshCw className="h-5 w-5 mr-2" />
                            Refresh
                        </button>
                        <button
                            onClick={handleCreateWidget}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Widget
                        </button>
                    </div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 min-h-[600px]"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {widgets.length === 0 ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <BarChart3 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-600 mb-2">No widgets yet</h3>
                            <p className="text-slate-500 mb-4">Start building your dashboard by adding widgets</p>
                            <button
                                onClick={handleCreateWidget}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center mx-auto"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Add Your First Widget
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-12 gap-4">
                        {widgets.map(renderWidget)}
                    </div>
                )}
            </div>

            {/* Widget Modal */}
            {showWidgetModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {editingWidget ? 'Edit Widget' : 'Create Widget'}
                                </h2>
                                <button
                                    onClick={() => setShowWidgetModal(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSaveWidget} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Widget Name</label>
                                    <input
                                        type="text"
                                        value={widgetForm.name}
                                        onChange={(e) => setWidgetForm({ ...widgetForm, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Widget Type</label>
                                    <select
                                        value={widgetForm.type}
                                        onChange={(e) => setWidgetForm({ ...widgetForm, type: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                    >
                                        {widgetTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={widgetForm.config.title}
                                    onChange={(e) => setWidgetForm({
                                        ...widgetForm,
                                        config: { ...widgetForm.config, title: e.target.value }
                                    })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={widgetForm.config.description}
                                    onChange={(e) => setWidgetForm({
                                        ...widgetForm,
                                        config: { ...widgetForm.config, description: e.target.value }
                                    })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                    rows="3"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Chart Type</label>
                                    <select
                                        value={widgetForm.config.chartType}
                                        onChange={(e) => setWidgetForm({
                                            ...widgetForm,
                                            config: { ...widgetForm.config, chartType: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                    >
                                        {chartTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date Range</label>
                                    <select
                                        value={widgetForm.config.dateRange}
                                        onChange={(e) => setWidgetForm({
                                            ...widgetForm,
                                            config: { ...widgetForm.config, dateRange: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                    >
                                        {dateRanges.map(range => (
                                            <option key={range.id} value={range.id}>{range.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {widgetForm.config.dateRange === 'custom' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            value={widgetForm.config.customDateRange.start}
                                            onChange={(e) => setWidgetForm({
                                                ...widgetForm,
                                                config: {
                                                    ...widgetForm.config,
                                                    customDateRange: {
                                                        ...widgetForm.config.customDateRange,
                                                        start: e.target.value
                                                    }
                                                }
                                            })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                                        <input
                                            type="date"
                                            value={widgetForm.config.customDateRange.end}
                                            onChange={(e) => setWidgetForm({
                                                ...widgetForm,
                                                config: {
                                                    ...widgetForm.config,
                                                    customDateRange: {
                                                        ...widgetForm.config.customDateRange,
                                                        end: e.target.value
                                                    }
                                                }
                                            })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowWidgetModal(false)}
                                    className="px-6 py-3 text-slate-600 bg-slate-100 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {saving ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    {editingWidget ? 'Update' : 'Create'} Widget
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardBuilder;


