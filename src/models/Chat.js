const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    language: {
        type: String,
        enum: ['hi', 'en', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'ne', 'si'],
        default: 'hi'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    metadata: {
        messageType: {
            type: String,
            enum: ['text', 'voice', 'image', 'file'],
            default: 'text'
        },
        confidence: Number,
        responseTime: Number,
        tokensUsed: Number
    }
});

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        default: 'New Chat'
    },
    messages: [messageSchema],
    
    // Context Information
    context: {
        primaryCrop: String,
        farmSize: Number,
        farmSizeUnit: String,
        state: String,
        district: String,
        season: String,
        weatherCondition: String,
        soilType: String
    },
    
    // Chat Metadata
    metadata: {
        totalMessages: {
            type: Number,
            default: 0
        },
        totalTokens: {
            type: Number,
            default: 0
        },
        averageResponseTime: {
            type: Number,
            default: 0
        },
        language: {
            type: String,
            enum: ['hi', 'en', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'ne', 'si'],
            default: 'hi'
        },
        category: {
            type: String,
            enum: ['general', 'crop_advice', 'disease_detection', 'market_info', 'irrigation', 'government_schemes', 'credit_loans'],
            default: 'general'
        }
    },
    
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better performance
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ sessionId: 1 });
chatSchema.index({ 'metadata.category': 1 });
chatSchema.index({ 'metadata.language': 1 });
chatSchema.index({ lastActivity: -1 });

// Virtual for message count
chatSchema.virtual('messageCount').get(function() {
    return this.messages.length;
});

// Virtual for chat duration
chatSchema.virtual('duration').get(function() {
    if (this.messages.length < 2) return 0;
    const firstMessage = this.messages[0].timestamp;
    const lastMessage = this.messages[this.messages.length - 1].timestamp;
    return lastMessage - firstMessage;
});

// Pre-save middleware to update metadata
chatSchema.pre('save', function(next) {
    this.metadata.totalMessages = this.messages.length;
    this.lastActivity = new Date();
    
    // Calculate average response time
    if (this.messages.length > 1) {
        let totalResponseTime = 0;
        let responseCount = 0;
        
        for (let i = 1; i < this.messages.length; i++) {
            if (this.messages[i].role === 'assistant' && this.messages[i].metadata.responseTime) {
                totalResponseTime += this.messages[i].metadata.responseTime;
                responseCount++;
            }
        }
        
        if (responseCount > 0) {
            this.metadata.averageResponseTime = totalResponseTime / responseCount;
        }
    }
    
    next();
});

// Method to add message
chatSchema.methods.addMessage = function(messageData) {
    this.messages.push(messageData);
    this.lastActivity = new Date();
    return this.save();
};

// Method to get recent messages
chatSchema.methods.getRecentMessages = function(limit = 10) {
    return this.messages.slice(-limit);
};

// Method to get chat summary
chatSchema.methods.getSummary = function() {
    const userMessages = this.messages.filter(m => m.role === 'user');
    const assistantMessages = this.messages.filter(m => m.role === 'assistant');
    
    return {
        sessionId: this.sessionId,
        title: this.title,
        totalMessages: this.messages.length,
        userMessages: userMessages.length,
        assistantMessages: assistantMessages.length,
        duration: this.duration,
        category: this.metadata.category,
        language: this.metadata.language,
        lastActivity: this.lastActivity
    };
};

// Static method to find chats by category
chatSchema.statics.findByCategory = function(category, limit = 20) {
    return this.find({ 'metadata.category': category })
        .sort({ lastActivity: -1 })
        .limit(limit)
        .populate('userId', 'firstName lastName state district');
};

// Static method to find chats by language
chatSchema.statics.findByLanguage = function(language, limit = 20) {
    return this.find({ 'metadata.language': language })
        .sort({ lastActivity: -1 })
        .limit(limit)
        .populate('userId', 'firstName lastName state district');
};

module.exports = mongoose.model('Chat', chatSchema);
