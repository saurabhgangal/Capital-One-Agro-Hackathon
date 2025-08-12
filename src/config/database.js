const mongoose = require('mongoose');

class Database {
    constructor() {
        this.isConnected = false;
        this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan_ai';
    }

    async connect() {
        try {
            if (this.isConnected) {
                console.log('✅ MongoDB already connected');
                return;
            }

            const options = {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                bufferCommands: false
            };

            await mongoose.connect(this.connectionString, options);
            
            this.isConnected = true;
            console.log('✅ MongoDB connected successfully');
            console.log(`🗄️ Database: ${this.connectionString}`);
            
            // Handle connection events
            mongoose.connection.on('error', (err) => {
                console.error('❌ MongoDB connection error:', err);
                this.isConnected = false;
            });

            mongoose.connection.on('disconnected', () => {
                console.log('⚠️ MongoDB disconnected');
                this.isConnected = false;
            });

            mongoose.connection.on('reconnected', () => {
                console.log('🔄 MongoDB reconnected');
                this.isConnected = false;
            });

            // Graceful shutdown
            process.on('SIGINT', async () => {
                await this.disconnect();
                process.exit(0);
            });

        } catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
            this.isConnected = false;
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.isConnected) {
                await mongoose.connection.close();
                this.isConnected = false;
                console.log('✅ MongoDB disconnected gracefully');
            }
        } catch (error) {
            console.error('❌ Error disconnecting MongoDB:', error.message);
        }
    }

    getConnection() {
        return mongoose.connection;
    }

    isConnected() {
        return this.isConnected;
    }
}

module.exports = new Database();
