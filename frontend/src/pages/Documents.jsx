import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import {
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Download,
  Eye,
  Edit,
  Trash2,
  Share2,
  FileText,
  Image,
  File,
  Folder,
  Plus,
  MoreVertical,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

// Helper function to check if a document can be viewed in browser
const canViewInBrowser = (mimeType) => {
  const viewableTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv'
  ];
  return viewableTypes.includes(mimeType);
};

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const documentCategories = [
    { value: '', label: 'All Categories' },
    { value: 'property_documents', label: 'Property Documents' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'legal_documents', label: 'Legal Documents' },
    { value: 'marketing_materials', label: 'Marketing Materials' },
    { value: 'photos', label: 'Photos' },
    { value: 'floor_plans', label: 'Floor Plans' },
    { value: 'inspection_reports', label: 'Inspection Reports' },
    { value: 'appraisal_documents', label: 'Appraisal Documents' },
    { value: 'insurance_documents', label: 'Insurance Documents' },
    { value: 'tax_documents', label: 'Tax Documents' },
    { value: 'other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'title', label: 'Title' },
    { value: 'fileSize', label: 'File Size' },
    { value: 'downloadCount', label: 'Downloads' }
  ];

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
    fetchStats();
  }, [currentPage, selectedCategory, searchTerm, sortBy, sortOrder]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
        sortBy,
        sortOrder
      });

      const response = await api.get(`/documents?${params}`);
      setDocuments(response.data.documents || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Fetch documents error:', error);
      setDocuments([]);
      setTotalPages(1);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/documents/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Fetch categories error:', error);
      setCategories([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/documents/stats');
      setStats(response.data || null);
    } catch (error) {
      console.error('Fetch stats error:', error);
      setStats(null);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const handleDownload = async (document) => {
    try {
      const response = await api.get(`/documents/${document._id}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.delete(`/documents/${documentId}`);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const handleViewInBrowser = async (document) => {
    try {
      // Get the document blob with authentication
      const response = await api.get(`/documents/${document._id}/view`, {
        responseType: 'blob'
      });

      // Create a blob URL and open it in a new tab
      const blob = new Blob([response.data], { type: document.mimeType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      // Clean up the blob URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to view document');
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (mimeType === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600'
    };

    const iconColorClasses = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600'
    };

    return (
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
            <Icon className={`h-6 w-6 text-white`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    );
  };

  const DocumentCard = ({ document }) => (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20 group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
              {getFileIcon(document.mimeType)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                {document.title}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {document.originalName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => handleViewDocument(document)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Details"
            >
              <Eye className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleDownload(document)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(document._id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="font-medium">{formatFileSize(document.fileSize)}</span>
            <span>{formatDate(document.createdAt)}</span>
          </div>

          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {document.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 font-medium"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
              {document.tags.length > 3 && (
                <span className="text-xs text-gray-500 font-medium">+{document.tags.length - 3} more</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-600 capitalize font-medium">
              {document.category.replace('_', ' ')}
            </span>
            <span className="text-sm text-gray-600 font-medium">
              {document.downloadCount} downloads
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const DocumentListItem = ({ document }) => (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20 group">
      <div className="p-6">
        <div className="flex items-center space-x-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
            {getFileIcon(document.mimeType)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {document.title}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {document.originalName}
            </p>
          </div>
          <div className="flex items-center space-x-8 text-sm text-gray-600">
            <span className="font-medium">{formatFileSize(document.fileSize)}</span>
            <span className="capitalize font-medium">{document.category.replace('_', ' ')}</span>
            <span>{formatDate(document.createdAt)}</span>
            <span className="font-medium">{document.downloadCount} downloads</span>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => handleViewDocument(document)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            {canViewInBrowser(document.mimeType) && (
              <button
                onClick={() => handleViewInBrowser(document)}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                title="View in Browser"
              >
                <FileText className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => handleDownload(document)}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(document._id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && documents.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Documents
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your property documents and files</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
              <Plus className="h-5 w-5 mr-2" />
              Upload Document
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Documents"
              value={stats.totalDocuments || 0}
              icon={FileText}
              color="blue"
            />
            <StatCard
              title="Total Size"
              value={formatFileSize(stats.totalSize || 0)}
              icon={Folder}
              color="green"
            />
            <StatCard
              title="Categories"
              value={categories?.length || 0}
              icon={Tag}
              color="purple"
            />
            <StatCard
              title="Storage Used"
              value={`${stats.storageUsed || '0 MB'} / ${stats.storageLimit || '1 GB'}`}
              icon={File}
              color="orange"
            />
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-12 pr-4 py-3 w-full sm:w-64 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
              >
                {documentCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={handleSortChange}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={handleSortOrderToggle}
                className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-white/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200 font-semibold"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all duration-200 ${viewMode === 'grid'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                  }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all duration-200 ${viewMode === 'list'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                  }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Documents Grid/List */}
        {!documents || documents.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600 mb-8 text-lg">Get started by uploading your first document.</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
              <Plus className="h-5 w-5 mr-2" />
              Upload Document
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {documents.map((document) => (
                  <DocumentCard key={document._id} document={document} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((document) => (
                  <DocumentListItem key={document._id} document={document} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 font-medium">
                    Showing page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white/50 backdrop-blur-sm hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white/50 backdrop-blur-sm hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={fetchDocuments}
        />
      )}

      {/* Document View Modal */}
      {showDocumentModal && selectedDocument && (
        <DocumentViewModal
          document={selectedDocument}
          onClose={() => setShowDocumentModal(false)}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

// Upload Modal Component
const UploadModal = ({ onClose, onUpload }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    tags: '',
    isPublic: false,
    relatedTo: 'none',
    relatedId: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    try {
      setUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      await api.post('/documents/upload', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Document uploaded successfully');
      onUpload();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-sm border border-white/20">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Upload Document</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                File
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-50 file:to-indigo-50 file:text-blue-700 hover:file:from-blue-100 hover:file:to-indigo-100 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                >
                  <option value="property_documents">Property Documents</option>
                  <option value="contracts">Contracts</option>
                  <option value="legal_documents">Legal Documents</option>
                  <option value="marketing_materials">Marketing Materials</option>
                  <option value="photos">Photos</option>
                  <option value="floor_plans">Floor Plans</option>
                  <option value="inspection_reports">Inspection Reports</option>
                  <option value="appraisal_documents">Appraisal Documents</option>
                  <option value="insurance_documents">Insurance Documents</option>
                  <option value="tax_documents">Tax Documents</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="contract, property, legal"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm font-medium text-gray-900">
                Make this document public
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:transform-none"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Document View Modal Component
const DocumentViewModal = ({ document, onClose, onDownload, onDelete }) => {
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <Image className="h-12 w-12 text-blue-500" />;
    if (mimeType === 'application/pdf') return <FileText className="h-12 w-12 text-red-500" />;
    return <File className="h-12 w-12 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20">
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Document Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-8">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                {getFileIcon(document.mimeType)}
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{document.title}</h4>
                <p className="text-lg text-gray-500">{document.originalName}</p>
              </div>
            </div>

            {document.description && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h5 className="text-lg font-semibold text-gray-900 mb-3">Description</h5>
                <p className="text-gray-600 leading-relaxed">{document.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">File Size</h5>
                <p className="text-lg font-bold text-gray-700">{formatFileSize(document.fileSize)}</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Category</h5>
                <p className="text-lg font-bold text-gray-700 capitalize">{document.category.replace('_', ' ')}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Uploaded</h5>
                <p className="text-lg font-bold text-gray-700">{formatDate(document.createdAt)}</p>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Downloads</h5>
                <p className="text-lg font-bold text-gray-700">{document.downloadCount}</p>
              </div>
            </div>

            {document.tags && document.tags.length > 0 && (
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Tags</h5>
                <div className="flex flex-wrap gap-3">
                  {document.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 font-medium"
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-200"
              >
                Close
              </button>
              {canViewInBrowser(document.mimeType) && (
                <button
                  onClick={async () => {
                    try {
                      // Get the document blob with authentication
                      const response = await api.get(`/documents/${document._id}/view`, {
                        responseType: 'blob'
                      });

                      // Create a blob URL and open it in a new tab
                      const blob = new Blob([response.data], { type: document.mimeType });
                      const url = window.URL.createObjectURL(blob);
                      window.open(url, '_blank');

                      // Clean up the blob URL after a delay
                      setTimeout(() => {
                        window.URL.revokeObjectURL(url);
                      }, 1000);
                    } catch (error) {
                      console.error('Error viewing document:', error);
                      toast.error('Failed to view document');
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-500/50"
                >
                  <FileText className="h-5 w-5 mr-2 inline" />
                  View in Browser
                </button>
              )}
              <button
                onClick={() => onDownload(document)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
              >
                <Download className="h-5 w-5 mr-2 inline" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
