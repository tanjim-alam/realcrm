const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/documents';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow all file types for now
        cb(null, true);
    }
});

// @route   GET /api/documents
// @desc    Get all documents for company
// @access  Private
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const category = req.query.category;
        const search = req.query.search;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // Build query
        const query = { companyId: req.user.companyId };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$text = { $search: search };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder;

        // Get documents with pagination
        const documents = await Document.find(query)
            .populate('uploadedBy', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        // Get total count
        const totalDocuments = await Document.countDocuments(query);
        const totalPages = Math.ceil(totalDocuments / limit);

        res.json({
            documents,
            totalPages,
            currentPage: page,
            totalDocuments
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/documents/stats
// @desc    Get documents statistics for company
// @access  Private
router.get('/stats', async (req, res) => {
    try {
        const companyId = req.user.companyId;

        // Get total documents count
        const totalDocuments = await Document.countDocuments({ companyId });

        // Get total file size
        const sizeResult = await Document.aggregate([
            { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
            { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
        ]);
        const totalSize = sizeResult.length > 0 ? sizeResult[0].totalSize : 0;

        // Get documents by type
        const documentsByType = await Document.aggregate([
            { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
            {
                $group: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$mimeType', 'application/pdf'] }, then: 'pdf' },
                                { case: { $regexMatch: { input: '$mimeType', regex: /^image\// } }, then: 'image' },
                                { case: { $regexMatch: { input: '$mimeType', regex: /^text\// } }, then: 'document' }
                            ],
                            default: 'other'
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format documents by type
        const typeCounts = {
            pdf: 0,
            image: 0,
            document: 0,
            other: 0
        };
        documentsByType.forEach(item => {
            typeCounts[item._id] = item.count;
        });

        // Get recent uploads (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentUploads = await Document.countDocuments({
            companyId,
            createdAt: { $gte: sevenDaysAgo }
        });

        // Format file size
        const formatFileSize = (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        const stats = {
            totalDocuments,
            totalSize,
            documentsByType: typeCounts,
            recentUploads,
            storageUsed: formatFileSize(totalSize),
            storageLimit: '1 GB'
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching documents stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/documents/categories
// @desc    Get document categories
// @access  Private
router.get('/categories', async (req, res) => {
    try {
        const companyId = req.user.companyId;

        // Get category counts from database
        const categoryCounts = await Document.aggregate([
            { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Create a map for quick lookup
        const countMap = {};
        categoryCounts.forEach(item => {
            countMap[item._id] = item.count;
        });

        // Define all possible categories
        const allCategories = [
            { id: 'contracts', name: 'Contracts' },
            { id: 'photos', name: 'Photos' },
            { id: 'floor_plans', name: 'Floor Plans' },
            { id: 'inspection_reports', name: 'Inspection Reports' },
            { id: 'marketing_materials', name: 'Marketing Materials' },
            { id: 'tax_documents', name: 'Tax Documents' },
            { id: 'legal_documents', name: 'Legal Documents' },
            { id: 'insurance_documents', name: 'Insurance Documents' },
            { id: 'appraisal_documents', name: 'Appraisal Documents' },
            { id: 'other', name: 'Other' }
        ];

        // Add counts to categories
        const categories = allCategories.map(cat => ({
            ...cat,
            count: countMap[cat.id] || 0
        }));

        res.json(categories);
    } catch (error) {
        console.error('Error fetching document categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/documents/upload
// @desc    Upload a document
// @access  Private
router.post('/upload', (req, res) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    message: 'File too large. Maximum size is 50MB.'
                });
            }
            console.error('Upload error:', err);
            return res.status(400).json({
                message: 'File upload error: ' + err.message
            });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const {
                title,
                description,
                category,
                tags,
                isPublic,
                relatedTo,
                relatedId
            } = req.body;

            // Create document record
            const document = new Document({
                title: title || req.file.originalname,
                originalName: req.file.originalname,
                fileName: req.file.filename,
                mimeType: req.file.mimetype,
                fileSize: req.file.size,
                filePath: req.file.path,
                url: `/uploads/documents/${req.file.filename}`,
                category: category || 'other',
                description: description || '',
                tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
                isPublic: isPublic === 'true',
                uploadedBy: req.user.id,
                companyId: req.user.companyId,
                relatedTo: relatedTo || 'none',
                relatedId: relatedId || null
            });

            await document.save();
            await document.populate('uploadedBy', 'name email');

            res.json({
                message: 'Document uploaded successfully',
                document
            });
        } catch (error) {
            console.error('Error uploading document:', error);

            // Clean up uploaded file if document creation failed
            if (req.file && req.file.path) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting uploaded file:', err);
                });
            }

            res.status(500).json({ message: 'Server error' });
        }
    });
});

// @route   GET /api/documents/:id/download
// @desc    Download a document
// @access  Private
router.get('/:id/download', async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            companyId: req.user.companyId
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Increment download count
        await Document.findByIdAndUpdate(req.params.id, {
            $inc: { downloadCount: 1 }
        });

        // Check if file exists
        if (!fs.existsSync(document.filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        // Set appropriate headers
        res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
        res.setHeader('Content-Type', document.mimeType);
        res.setHeader('Content-Length', document.fileSize);

        // Stream the file
        const fileStream = fs.createReadStream(document.filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/documents/:id/view
// @desc    View a document in browser
// @access  Private
router.get('/:id/view', async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            companyId: req.user.companyId
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Check if file exists
        if (!fs.existsSync(document.filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        // Set appropriate headers for viewing
        res.setHeader('Content-Type', document.mimeType);
        res.setHeader('Content-Length', document.fileSize);
        res.setHeader('Content-Disposition', 'inline');

        // Stream the file
        const fileStream = fs.createReadStream(document.filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Error viewing document:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            companyId: req.user.companyId
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Delete file from filesystem
        if (fs.existsSync(document.filePath)) {
            fs.unlink(document.filePath, (err) => {
                if (err) console.error('Error deleting file from filesystem:', err);
            });
        }

        // Delete document record from database
        await Document.findByIdAndDelete(req.params.id);

        res.json({
            message: 'Document deleted successfully',
            deletedId: req.params.id
        });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
