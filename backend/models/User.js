// USER MODEL

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't include password in queries by default
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    role: {
      type: String,
      enum: ['buyer', 'farmer'],
      required: [true, 'User role is required']
    },
    // Google OAuth fields
    googleId: {
      type: String,
      sparse: true,
      unique: true
    },
    profilePhoto: {
      type: String,
      default: ''
    },
    // Farmer-specific fields
    farmDetails: {
      farmName: String,
      farmAddress: String,
      farmSize: String,
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0]
        }
      },
      certifications: [String],
      description: String
    },
    // Buyer-specific fields
    addresses: [{
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      isDefault: {
        type: Boolean,
        default: false
      }
    }],
    // Common fields
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'pa', 'bn', 'te', 'mr', 'ta', 'gu']
    }
  },
  {
    timestamps: true
  }
);

// Index for geospatial queries
userSchema.index({ 'farmDetails.location': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function () {
  // Only hash if password is modified or new
  if (!this.isModified('password')) {
    return;
  }
  
  // Don't hash if it's a Google OAuth user (no password)
  if (!this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;