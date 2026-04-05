const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Tự động xóa token hết hạn
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Xóa tất cả refresh token của 1 user
refreshTokenSchema.statics.revokeAllForUser = async function (userId) {
  await this.updateMany({ userId }, { isRevoked: true });
};

// Xóa 1 refresh token cụ thể (logout 1 thiết bị)
refreshTokenSchema.statics.revokeToken = async function (token) {
  await this.updateOne({ token }, { isRevoked: true });
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
