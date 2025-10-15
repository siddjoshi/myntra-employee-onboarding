const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  documentType: {
    type: String,
    enum: [
      'aadhaar',
      'pan_card',
      'passport',
      'offer_letter',
      'educational_certificates',
      'experience_letters',
      'address_proof',
      'bank_details',
      'photo',
      'other'
    ],
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileSize: Number,
  mimeType: String,
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: Date,
  rejectionReason: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  expiryDate: Date,
  isRequired: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Document', documentSchema);
