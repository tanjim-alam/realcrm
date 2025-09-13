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
      setDocuments(response.data.documents);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Fetch documents error:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/documents/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/documents/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
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

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center">
        <div className={`p-2 rounded-full bg-${color}-100`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const DocumentCard = ({ document }) => (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getFileIcon(document.mimeType)}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {document.title}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {document.originalName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleViewDocument(document)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => handleDownload(document)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(document._id)}
              className="p-1 text-gray-400 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatFileSize(document.fileSize)}</span>
            <span>{formatDate(document.createdAt)}</span>
          </div>
          
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {document.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
              {document.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{document.tags.length - 3} more</span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 capitalize">
              {document.category.replace('_', ' ')}
            </span>
            <span className="text-xs text-gray-500">
              {document.downloadCount} downloads
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const DocumentListItem = ({ document }) => (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex items-center space-x-4">
        {getFileIcon(document.mimeType)}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {document.title}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {document.originalName}
          </p>
        </div>
        <div className="flex items-center space-x-6 text-xs text-gray-500">
          <span>{formatFileSize(document.fileSize)}</span>
          <span className="capitalize">{document.category.replace('_', ' ')}</span>
          <span>{formatDate(document.createdAt)}</span>
          <span>{document.downloadCount} downloads</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewDocument(document)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          {canViewInBrowser(document.mimeType) && (
            <button
              onClick={() => handleViewInBrowser(document)}
              className="p-1 text-gray-400 hover:text-blue-600"
              title="View in Browser"
            >
              <FileText className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => handleDownload(document)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(document._id)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage your property documents and files</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Documents"
            value={stats.stats.totalDocuments}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Total Size"
            value={formatFileSize(stats.stats.totalSize)}
            icon={Folder}
            color="green"
          />
          <StatCard
            title="Categories"
            value={stats.stats.categories.length}
            icon={Tag}
            color="purple"
          />
          <StatCard
            title="Avg File Size"
            value={formatFileSize(stats.stats.avgFileSize)}
            icon={File}
            color="orange"
          />
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleSortOrderToggle}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Documents Grid/List */}
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by uploading a new document.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </button>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="contract, property, legal"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                Make this document public
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Document Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              {getFileIcon(document.mimeType)}
              <div>
                <h4 className="text-lg font-medium text-gray-900">{document.title}</h4>
                <p className="text-sm text-gray-500">{document.originalName}</p>
              </div>
            </div>

            {document.description && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Description</h5>
                <p className="text-sm text-gray-600">{document.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-1">File Size</h5>
                <p className="text-sm text-gray-600">{formatFileSize(document.fileSize)}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-1">Category</h5>
                <p className="text-sm text-gray-600 capitalize">{document.category.replace('_', ' ')}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-1">Uploaded</h5>
                <p className="text-sm text-gray-600">{formatDate(document.createdAt)}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-1">Downloads</h5>
                <p className="text-sm text-gray-600">{document.downloadCount}</p>
              </div>
            </div>

            {document.tags && document.tags.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Tags</h5>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <FileText className="h-4 w-4 mr-2 inline" />
                  View in Browser
                </button>
              )}
              <button
                onClick={() => onDownload(document)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2 inline" />
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
