const express = require('express');
const Document = require('../models/Document');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed!'));
    }
  }
});

// Upload document
router.post('/upload', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { documentType, isRequired } = req.body;

    const document = new Document({
      userId: req.user.userId,
      documentType,
      fileName: req.file.originalname,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      isRequired: isRequired === 'true',
    });

    await document.save();

    res.status(201).json({ 
      message: 'Document uploaded successfully', 
      document 
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document.' });
  }
});

// Get all documents for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.userId })
      .populate('verifiedBy', 'firstName lastName')
      .sort({ uploadedAt: -1 });

    res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents.' });
  }
});

// Get documents for a specific user (HR only)
router.get('/user/:userId', authMiddleware, roleMiddleware('hr_admin'), async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.params.userId })
      .populate('verifiedBy', 'firstName lastName')
      .sort({ uploadedAt: -1 });

    res.json({ documents });
  } catch (error) {
    console.error('Get user documents error:', error);
    res.status(500).json({ error: 'Failed to fetch user documents.' });
  }
});

// Verify document (HR only)
router.patch('/:id/verify', authMiddleware, roleMiddleware('hr_admin'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    document.status = status;
    document.verifiedBy = req.user.userId;
    document.verifiedAt = Date.now();
    
    if (status === 'rejected' && rejectionReason) {
      document.rejectionReason = rejectionReason;
    }

    await document.save();

    res.json({ 
      message: `Document ${status} successfully`, 
      document 
    });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({ error: 'Failed to verify document.' });
  }
});

// Delete document
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Check if user owns the document or is HR
    if (document.userId.toString() !== req.user.userId && req.user.role !== 'hr_admin') {
      return res.status(403).json({ error: 'Access forbidden.' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document.' });
  }
});

module.exports = router;
