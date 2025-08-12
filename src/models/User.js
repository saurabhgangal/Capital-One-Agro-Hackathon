const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Basic Information
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number']
    },

    // Personal Information
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'male'
    },

    // Location & Address
    state: {
        type: String,
        required: true,
        enum: [
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
            'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
            'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
            'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
            'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
        ]
    },
    district: {
        type: String,
        required: true
    },
    village: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true,
        match: [/^[1-9][0-9]{5}$/, 'Please enter a valid pincode']
    },

    // Farming Information
    farmSize: {
        type: Number,
        required: true,
        min: 0.1,
        max: 1000,
        default: 1
    },
    farmSizeUnit: {
        type: String,
        enum: ['acres', 'hectares', 'bigha', 'guntha'],
        default: 'acres'
    },
    primaryCrop: {
        type: String,
        required: true
    },
    secondaryCrops: [{
        type: String
    }],
    farmingExperience: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    irrigationType: {
        type: String,
        enum: ['rainfed', 'irrigated', 'mixed'],
        default: 'rainfed'
    },

    // Financial Information
    annualIncome: {
        type: Number,
        min: 0
    },
    bankAccount: {
        type: String
    },
    ifscCode: {
        type: String
    },

    // Preferences
    preferredLanguage: {
        type: String,
        enum: ['hi', 'en', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'ne', 'si'],
        default: 'hi'
    },
    notificationPreferences: {
        sms: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: true },
        push: { type: Boolean, default: true }
    },

    // Account Status
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Timestamps
    lastLogin: Date,
    lastActivity: Date
}, {
    timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ state: 1, district: 1 });
userSchema.index({ primaryCrop: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
userSchema.virtual('age').get(function() {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.verificationToken;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpires;
    return userObject;
};

// Static method to find by email or phone
userSchema.statics.findByEmailOrPhone = function(identifier) {
    return this.findOne({
        $or: [
            { email: identifier },
            { phone: identifier }
        ]
    });
};

module.exports = mongoose.model('User', userSchema);
