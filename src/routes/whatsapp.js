const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const router = express.Router();

// WhatsApp Web.js client (for QR code method)
let whatsappClient = null;
let isConnected = false;
let isInitializing = false;
let qrCode = null;

// WhatsApp Business API configuration
const WHATSAPP_BUSINESS_API_ENABLED = process.env.WHATSAPP_BUSINESS_API_ENABLED === 'true';
const WHATSAPP_BUSINESS_API_TOKEN = process.env.WHATSAPP_BUSINESS_API_TOKEN;
const WHATSAPP_BUSINESS_PHONE_NUMBER_ID = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID;
const WHATSAPP_BUSINESS_VERIFY_TOKEN = process.env.WHATSAPP_BUSINESS_VERIFY_TOKEN;

// Initialize WhatsApp client
async function initializeWhatsApp() {
    if (WHATSAPP_BUSINESS_API_ENABLED && WHATSAPP_BUSINESS_API_TOKEN) {
        console.log('📱 Using WhatsApp Business API - No QR code needed');
        return;
    }

    if (whatsappClient) {
        console.log('📱 WhatsApp client already initialized');
        return;
    }

    try {
        console.log('📱 Initializing WhatsApp client...');
        isInitializing = true;
        
        whatsappClient = new Client({
            authStrategy: new LocalAuth({
                clientId: process.env.WHATSAPP_CLIENT_ID || 'kisan-ai'
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            }
        });

        whatsappClient.on('qr', (qr) => {
            console.log('📱 WhatsApp QR Code generated - Scan to connect');
            qrCode = qr;
        });

        whatsappClient.on('ready', () => {
            console.log('✅ WhatsApp client is ready!');
            isConnected = true;
            isInitializing = false;
            qrCode = null;
        });

        whatsappClient.on('authenticated', () => {
            console.log('🔐 WhatsApp client authenticated');
        });

        whatsappClient.on('auth_failure', (msg) => {
            console.error('❌ WhatsApp authentication failed:', msg);
            isInitializing = false;
        });

        whatsappClient.on('disconnected', (reason) => {
            console.log('📱 WhatsApp client disconnected:', reason);
            isConnected = false;
            isInitializing = false;
            qrCode = null;
        });

        await whatsappClient.initialize();
        
    } catch (error) {
        console.error('📱 WhatsApp initialization error:', error);
        isInitializing = false;
    }
}

// Send message using WhatsApp Business API
async function sendMessageViaBusinessAPI(phoneNumber, message) {
    try {
        if (!WHATSAPP_BUSINESS_API_ENABLED || !WHATSAPP_BUSINESS_API_TOKEN) {
            throw new Error('WhatsApp Business API not configured');
        }

        const formattedNumber = phoneNumber.replace(/\D/g, '');
        const url = `https://graph.facebook.com/v18.0/${WHATSAPP_BUSINESS_PHONE_NUMBER_ID}/messages`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_BUSINESS_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: formattedNumber,
                type: 'text',
                text: { body: message }
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(`WhatsApp API Error: ${data.error.message}`);
        }

        return {
            success: true,
            messageId: data.messages?.[0]?.id,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('WhatsApp Business API Error:', error);
        throw error;
    }
}

// Send message using WhatsApp Web.js (QR code method)
async function sendMessageViaWebJS(phoneNumber, message) {
    try {
        if (!whatsappClient || !isConnected) {
            throw new Error('WhatsApp Web.js client not connected');
        }

        const formattedNumber = phoneNumber.replace(/\D/g, '');
        const chatId = `${formattedNumber}@c.us`;
        
        await whatsappClient.sendMessage(chatId, message);
        
        return {
            success: true,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('WhatsApp Web.js Error:', error);
        throw error;
    }
}

// Unified send message function
async function sendWhatsAppMessage(phoneNumber, message) {
    try {
        // Try Business API first (no QR code needed)
        if (WHATSAPP_BUSINESS_API_ENABLED && WHATSAPP_BUSINESS_API_TOKEN) {
            return await sendMessageViaBusinessAPI(phoneNumber, message);
        }
        
        // Fallback to Web.js method (requires QR code)
        if (whatsappClient && isConnected) {
            return await sendMessageViaWebJS(phoneNumber, message);
        }
        
        throw new Error('No WhatsApp method available');
        
    } catch (error) {
        console.error('WhatsApp send error:', error);
        throw error;
    }
}

// Initialize WhatsApp on startup
initializeWhatsApp();

// Get WhatsApp status
router.get('/status', async (req, res) => {
    try {
        let status = 'disconnected';
        let message = 'WhatsApp not connected';
        
        if (WHATSAPP_BUSINESS_API_ENABLED && WHATSAPP_BUSINESS_API_TOKEN) {
            status = 'connected';
            message = 'WhatsApp Business API ready - No QR code needed';
        } else if (whatsappClient && isConnected) {
            status = 'connected';
            message = 'WhatsApp Web.js connected';
        } else if (isInitializing) {
            status = 'initializing';
            message = 'WhatsApp initializing...';
        } else if (qrCode) {
            status = 'waiting_for_scan';
            message = 'QR code ready for scanning';
        }
        
        res.json({
            success: true,
            status: status,
            message: message,
            method: WHATSAPP_BUSINESS_API_ENABLED ? 'business_api' : 'web_js',
            isConnected: status === 'connected',
            isInitializing: status === 'initializing',
            hasQR: status === 'waiting_for_scan'
        });
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ success: false, error: 'Failed to check status' });
    }
});

// Get QR code (only for Web.js method)
router.get('/qr', async (req, res) => {
    try {
        if (WHATSAPP_BUSINESS_API_ENABLED) {
            return res.json({
                success: false,
                message: 'QR code not needed - Using WhatsApp Business API'
            });
        }

        if (!qrCode) {
            return res.json({
                success: false,
                message: 'No QR code available'
            });
        }

        const qrCodeDataURL = await qrcode.toDataURL(qrCode);
        res.json({
            success: true,
            qrCode: qrCodeDataURL,
            status: 'waiting_for_scan'
        });
    } catch (error) {
        console.error('QR code error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate QR code' });
    }
});

// Send WhatsApp Message
router.post('/send-message', async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;
        
        if (!phoneNumber || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone number and message are required' 
            });
        }
        
        const result = await sendWhatsAppMessage(phoneNumber, message);
        
        res.json({
            success: true,
            message: 'Message sent successfully',
            phoneNumber: phoneNumber,
            timestamp: result.timestamp,
            method: WHATSAPP_BUSINESS_API_ENABLED ? 'business_api' : 'web_js'
        });
        
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to send message' 
        });
    }
});

// Disconnect WhatsApp
router.post('/disconnect', async (req, res) => {
    try {
        if (whatsappClient) {
            await whatsappClient.destroy();
            whatsappClient = null;
            isConnected = false;
            isInitializing = false;
            qrCode = null;
            console.log('📱 WhatsApp client disconnected successfully');
            res.json({ success: true, message: 'WhatsApp disconnected successfully' });
        } else {
            res.json({ success: false, message: 'WhatsApp client not found' });
        }
    } catch (error) {
        console.error('WhatsApp disconnect error:', error);
        res.status(500).json({ success: false, error: 'Failed to disconnect WhatsApp' });
    }
});

// Webhook verification for WhatsApp Business API
router.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === WHATSAPP_BUSINESS_VERIFY_TOKEN) {
            console.log('✅ WhatsApp webhook verified');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// Webhook for receiving messages (Business API)
router.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        try {
            body.entry.forEach(entry => {
                entry.changes.forEach(change => {
                    if (change.value.messages && change.value.messages.length > 0) {
                        const message = change.value.messages[0];
                        console.log('📱 Received WhatsApp message:', message);
                        // Handle incoming messages here
                    }
                });
            });
        } catch (error) {
            console.error('Webhook processing error:', error);
        }
    }

    res.sendStatus(200);
});

// Export both router and helper function
module.exports = { router, sendWhatsAppMessage };
