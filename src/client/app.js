// Kisan AI - Main Application JavaScript
class KisanAI {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentLanguage = 'hi';
        this.socket = null;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeSocket();
        this.showLoadingScreen();
        
        // Simulate loading time
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showApp();
        }, 2000);

        // Start WhatsApp status polling
        this.startWhatsAppStatusPolling();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Quick Actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetSection = e.currentTarget.dataset.back;
                this.navigateToSection(targetSection);
            });
        });

        // Chat functionality
        const sendBtn = document.getElementById('send-btn');
        const chatInput = document.getElementById('chat-input');
        
        if (sendBtn && chatInput) {
            sendBtn.addEventListener('click', () => this.sendChatMessage());
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }

        // Voice and Image buttons
        const voiceBtn = document.getElementById('voice-btn');
        const imageBtn = document.getElementById('image-btn');
        
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.toggleVoiceRecording());
        }
        
        if (imageBtn) {
            imageBtn.addEventListener('click', () => this.openImageUpload());
        }

        // Language toggle
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', () => this.toggleLanguage());
        }

        // Disease detection
        const uploadArea = document.getElementById('upload-area');
        const imageUpload = document.getElementById('image-upload');
        
        if (uploadArea && imageUpload) {
            uploadArea.addEventListener('click', () => imageUpload.click());
            uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
            imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Market analysis
        const analyzeMarketBtn = document.getElementById('analyze-market-btn');
        if (analyzeMarketBtn) {
            analyzeMarketBtn.addEventListener('click', () => this.analyzeMarket());
        }

        // Irrigation schedule
        const irrigationScheduleBtn = document.getElementById('irrigation-schedule-btn');
        if (irrigationScheduleBtn) {
            irrigationScheduleBtn.addEventListener('click', () => this.getIrrigationSchedule());
        }

        // Profile button
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => this.showProfile());
        }

        // WhatsApp functionality
        const connectWhatsAppBtn = document.getElementById('connect-whatsapp-btn');
        const disconnectWhatsAppBtn = document.getElementById('disconnect-whatsapp-btn');
        const refreshQRBtn = document.getElementById('refresh-qr-btn');
        
        if (connectWhatsAppBtn) {
            connectWhatsAppBtn.addEventListener('click', () => this.connectWhatsApp());
        }
        
        if (disconnectWhatsAppBtn) {
            disconnectWhatsAppBtn.addEventListener('click', () => this.disconnectWhatsApp());
        }
        
        if (refreshQRBtn) {
            refreshQRBtn.addEventListener('click', () => this.refreshQRCode());
        }
    }

    initializeSocket() {
        try {
            this.socket = io();
            
            this.socket.on('connect', () => {
                console.log('Connected to server');
            });
            
            this.socket.on('chat-message', (data) => {
                this.displayChatMessage(data);
            });
            
            this.socket.on('crop-alert', (data) => {
                this.showNotification(data.message, 'info');
            });
            
            this.socket.on('market-update', (data) => {
                this.showNotification(data.message, 'success');
            });
            
        } catch (error) {
            console.error('Socket connection failed:', error);
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    showApp() {
        const app = document.getElementById('app');
        if (app) {
            app.style.display = 'flex';
        }
    }

    navigateToSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('main > section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show target section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeNavBtn = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNavBtn) {
            activeNavBtn.classList.add('active');
        }
        
        this.currentSection = sectionName;
        
        // Special handling for WhatsApp section
        if (sectionName === 'whatsapp') {
            this.initializeWhatsApp();
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
    }

    handleQuickAction(action) {
        switch (action) {
            case 'chat':
                this.navigateToSection('chat');
                break;
            case 'disease':
                this.navigateToSection('disease');
                break;
            case 'market':
                this.navigateToSection('market');
                break;
            case 'irrigation':
                this.navigateToSection('irrigation');
                break;
        }
    }

    async sendChatMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        // Display user message
        this.displayChatMessage({
            type: 'user',
            message: message,
            timestamp: new Date().toISOString()
        });
        
        // Clear input
        chatInput.value = '';
        
        try {
            // Show typing indicator
            this.showTypingIndicator();
            
            // Send to AI API
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    language: this.currentLanguage
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Display AI response
                this.displayChatMessage({
                    type: 'ai',
                    message: data.response,
                    timestamp: data.timestamp
                });
            } else {
                throw new Error(data.error);
            }
            
        } catch (error) {
            console.error('Chat error:', error);
            this.showNotification('Failed to get AI response. Please try again.', 'error');
        } finally {
            this.hideTypingIndicator();
        }
    }

    displayChatMessage(data) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${data.type === 'ai' ? 'ai-message' : 'user-message'}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = data.type === 'ai' ? '🤖' : '👨‍🌾';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('p');
        messageText.textContent = data.message;
        
        content.appendChild(messageText);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🤖';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = '<p>Typing...</p>';
        
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(content);
        chatMessages.appendChild(typingDiv);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async toggleVoiceRecording() {
        if (this.isRecording) {
            this.stopVoiceRecording();
        } else {
            await this.startVoiceRecording();
        }
    }

    async startVoiceRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                await this.processVoiceInput(audioBlob);
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Update button
            const voiceBtn = document.getElementById('voice-btn');
            if (voiceBtn) {
                voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
                voiceBtn.style.background = '#f44336';
            }
            
        } catch (error) {
            console.error('Voice recording failed:', error);
            this.showNotification('Voice recording not supported', 'error');
        }
    }

    stopVoiceRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Update button
            const voiceBtn = document.getElementById('voice-btn');
            if (voiceBtn) {
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                voiceBtn.style.background = '';
            }
        }
    }

    async processVoiceInput(audioBlob) {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob);
            
            const response = await fetch('/api/ai/voice-to-text', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Set the transcribed text in chat input
                const chatInput = document.getElementById('chat-input');
                if (chatInput) {
                    chatInput.value = data.text;
                    chatInput.focus();
                }
                
                this.showNotification('Voice transcribed successfully!', 'success');
            } else {
                throw new Error(data.error);
            }
            
        } catch (error) {
            console.error('Voice processing error:', error);
            this.showNotification('Failed to process voice input', 'error');
        }
    }

    openImageUpload() {
        const imageUpload = document.getElementById('image-upload');
        if (imageUpload) {
            imageUpload.click();
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.uploadImageForAnalysis(file);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.style.borderColor = '#4CAF50';
        event.currentTarget.style.background = 'rgba(76, 175, 80, 0.1)';
    }

    handleDrop(event) {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            this.uploadImageForAnalysis(file);
        }
        
        // Reset styling
        event.currentTarget.style.borderColor = '';
        event.currentTarget.style.background = '';
    }

    async uploadImageForAnalysis(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            // Show loading
            this.showImageAnalysisLoading();
            
            const response = await fetch('/api/ai/detect-disease', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.displayImageAnalysisResult(data.analysis);
            } else {
                throw new Error(data.error);
            }
            
        } catch (error) {
            console.error('Image analysis error:', error);
            this.showNotification('Failed to analyze image', 'error');
        } finally {
            this.hideImageAnalysisLoading();
        }
    }

    showImageAnalysisLoading() {
        const uploadArea = document.getElementById('upload-area');
        if (uploadArea) {
            uploadArea.innerHTML = `
                <div class="loading-spinner"></div>
                <h4>Analyzing Image...</h4>
                <p>Please wait while we analyze your crop image</p>
            `;
        }
    }

    hideImageAnalysisLoading() {
        const uploadArea = document.getElementById('upload-area');
        if (uploadArea) {
            uploadArea.innerHTML = `
                <div class="upload-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <h4>Upload Crop Image</h4>
                <p>Click to upload or drag and drop</p>
            `;
        }
    }

    displayImageAnalysisResult(analysis) {
        const analysisResult = document.getElementById('analysis-result');
        const resultContent = document.getElementById('result-content');
        
        if (analysisResult && resultContent) {
            resultContent.innerHTML = `
                <div class="analysis-text">
                    ${analysis.replace(/\n/g, '<br>')}
                </div>
            `;
            
            analysisResult.style.display = 'block';
            
            // Scroll to result
            analysisResult.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async analyzeMarket() {
        const cropSelect = document.getElementById('crop-select');
        const locationInput = document.getElementById('location-input');
        
        const crop = cropSelect.value;
        const location = locationInput.value.trim();
        
        if (!crop || !location) {
            this.showNotification('Please select crop and enter location', 'warning');
            return;
        }
        
        try {
            const response = await fetch('/api/market/price-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    crop: crop,
                    location: location,
                    season: 'current',
                    quantity: '1 quintal',
                    quality: 'good',
                    marketType: 'mandi'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.displayMarketAnalysis(data.marketAnalysis);
            } else {
                throw new Error(data.error);
            }
            
        } catch (error) {
            console.error('Market analysis error:', error);
            this.showNotification('Failed to analyze market', 'error');
        }
    }

    displayMarketAnalysis(analysis) {
        const marketAnalysis = document.getElementById('market-analysis');
        const marketAnalysisContent = document.getElementById('market-analysis-content');
        
        if (marketAnalysis && marketAnalysisContent) {
            marketAnalysisContent.innerHTML = `
                <div class="analysis-text">
                    ${analysis.replace(/\n/g, '<br>')}
                </div>
            `;
            
            marketAnalysis.style.display = 'block';
            
            // Scroll to result
            marketAnalysis.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async getIrrigationSchedule() {
        const cropSelect = document.getElementById('irrigation-crop-select');
        const soilTypeSelect = document.getElementById('soil-type-select');
        
        const crop = cropSelect.value;
        const soilType = soilTypeSelect.value;
        
        if (!crop || !soilType) {
            this.showNotification('Please select crop and soil type', 'warning');
            return;
        }
        
        try {
            const response = await fetch('/api/irrigation/irrigation-schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    crop: crop,
                    soilType: soilType,
                    weatherData: { temperature: 30, humidity: 60, rainfall: 0 },
                    waterAvailability: 'good',
                    irrigationMethod: 'drip',
                    growthStage: 'vegetative'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.displayIrrigationSchedule(data.irrigationSchedule);
            } else {
                throw new Error(data.error);
            }
            
        } catch (error) {
            console.error('Irrigation schedule error:', error);
            this.showNotification('Failed to get irrigation schedule', 'error');
        }
    }

    displayIrrigationSchedule(schedule) {
        const irrigationSchedule = document.getElementById('irrigation-schedule');
        const scheduleContent = document.getElementById('schedule-content');
        
        if (irrigationSchedule && scheduleContent) {
            scheduleContent.innerHTML = `
                <div class="schedule-text">
                    ${schedule.replace(/\n/g, '<br>')}
                </div>
            `;
            
            irrigationSchedule.style.display = 'block';
            
            // Scroll to result
            irrigationSchedule.scrollIntoView({ behavior: 'smooth' });
        }
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'hi' ? 'en' : 'hi';
        
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            const span = languageToggle.querySelector('span');
            if (span) {
                span.textContent = this.currentLanguage === 'hi' ? 'हिंदी' : 'English';
            }
        }
        
        // Update UI language
        this.updateUILanguage();
    }

    updateUILanguage() {
        // Update dashboard text
        const dashboardHeader = document.querySelector('.dashboard-header h2');
        if (dashboardHeader) {
            dashboardHeader.textContent = this.currentLanguage === 'hi' 
                ? '🌾 आपके फार्म डैशबोर्ड में स्वागत है'
                : '🌾 Welcome to Your Farm Dashboard';
        }
        
        const dashboardSubtext = document.querySelector('.dashboard-header p');
        if (dashboardSubtext) {
            dashboardSubtext.textContent = this.currentLanguage === 'hi'
                ? 'अपनी फसल की सफलता के लिए व्यक्तिगत जानकारी और सिफारिशें प्राप्त करें'
                : 'Get personalized insights and recommendations for your farming success';
        }
        
        // Update navigation
        const navBtns = document.querySelectorAll('.nav-btn span');
        navBtns.forEach(btn => {
            const section = btn.parentElement.dataset.section;
            if (section === 'dashboard') {
                btn.textContent = this.currentLanguage === 'hi' ? 'डैशबोर्ड' : 'Dashboard';
            } else if (section === 'chat') {
                btn.textContent = this.currentLanguage === 'hi' ? 'AI चैट' : 'AI Chat';
            } else if (section === 'disease') {
                btn.textContent = this.currentLanguage === 'hi' ? 'रोग' : 'Disease';
            } else if (section === 'market') {
                btn.textContent = this.currentLanguage === 'hi' ? 'बाजार' : 'Market';
            } else if (section === 'irrigation') {
                btn.textContent = this.currentLanguage === 'hi' ? 'पानी' : 'Water';
            }
        });
    }

    showProfile() {
        // Simple profile display - can be enhanced
        this.showNotification('Profile feature coming soon!', 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
            color: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // Add to body
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // WhatsApp Integration Methods
    async initializeWhatsApp() {
        try {
            this.showNotification('Initializing WhatsApp connection...', 'info');
            
            const response = await fetch('/api/whatsapp/status');
            const data = await response.json();
            
            if (data.success) {
                if (data.status.isConnected) {
                    this.updateWhatsAppStatus('connected', 'WhatsApp is connected and ready!');
                    this.showNotification('WhatsApp is already connected!', 'success');
                } else if (data.status.hasQRCode) {
                    this.updateWhatsAppStatus('waiting', 'Waiting for QR code scan...');
                    this.showNotification('QR code available, please scan to connect', 'info');
                } else {
                    this.updateWhatsAppStatus('disconnected', 'WhatsApp is not connected');
                    this.showNotification('WhatsApp is not connected', 'warning');
                }
            } else {
                this.updateWhatsAppStatus('error', 'Failed to check WhatsApp status');
                this.showNotification('Failed to check WhatsApp status', 'error');
            }
        } catch (error) {
            console.error('WhatsApp initialization error:', error);
            this.updateWhatsAppStatus('error', 'Connection error');
            this.showNotification('Failed to initialize WhatsApp', 'error');
        }
    }

    async connectWhatsApp() {
        try {
            this.showNotification('Connecting to WhatsApp...', 'info');
            this.updateWhatsAppStatus('connecting', 'Connecting to WhatsApp...');
            
            const response = await fetch('/api/whatsapp/qr');
            const data = await response.json();
            
            if (data.success && data.qrCode) {
                this.displayQRCode(data.qrCode);
                this.updateWhatsAppStatus('waiting', 'Scan QR code to connect');
                this.showNotification('QR code generated! Please scan to connect', 'success');
            } else {
                this.updateWhatsAppStatus('error', data.message || 'Failed to generate QR code');
                this.showNotification(data.message || 'Failed to generate QR code', 'error');
            }
        } catch (error) {
            console.error('WhatsApp connection error:', error);
            this.updateWhatsAppStatus('error', 'Connection failed');
            this.showNotification('Failed to connect to WhatsApp', 'error');
            this.updateWhatsAppStatus('error', 'Connection failed');
        }
    }

    async disconnectWhatsApp() {
        try {
            this.showNotification('Disconnecting WhatsApp...', 'info');
            
            const response = await fetch('/api/whatsapp/disconnect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            
            if (data.success) {
                this.updateWhatsAppStatus('disconnected', 'WhatsApp disconnected');
                this.hideQRCode();
                this.showNotification('WhatsApp disconnected successfully', 'success');
            } else {
                this.showNotification(data.message || 'Failed to disconnect', 'error');
            }
        } catch (error) {
            console.error('WhatsApp disconnection error:', error);
            this.showNotification('Failed to disconnect WhatsApp', 'error');
        }
    }

    async refreshQRCode() {
        try {
            this.showNotification('Refreshing QR code...', 'info');
            await this.connectWhatsApp();
        } catch (error) {
            console.error('QR code refresh error:', error);
            this.showNotification('Failed to refresh QR code', 'error');
        }
    }

    displayQRCode(qrCodeData) {
        const qrContainer = document.getElementById('qr-code-container');
        const qrImage = document.getElementById('qr-code-image');
        
        if (qrContainer && qrImage) {
            qrImage.src = qrCodeData;
            qrContainer.style.display = 'block';
        }
    }

    hideQRCode() {
        const qrContainer = document.getElementById('qr-code-container');
        if (qrContainer) {
            qrContainer.style.display = 'none';
        }
    }

    updateWhatsAppStatus(status, message) {
        const statusText = document.getElementById('status-text');
        const statusIndicator = document.querySelector('.status-indicator i');
        const connectBtn = document.getElementById('connect-whatsapp-btn');
        const disconnectBtn = document.getElementById('disconnect-whatsapp-btn');
        
        if (statusText) statusText.textContent = message;
        
        if (statusIndicator) {
            statusIndicator.className = 'fas fa-circle';
            statusIndicator.style.color = this.getStatusColor(status);
        }
        
        if (connectBtn && disconnectBtn) {
            switch (status) {
                case 'connected':
                    connectBtn.style.display = 'none';
                    disconnectBtn.style.display = 'block';
                    break;
                case 'waiting':
                case 'connecting':
                case 'disconnected':
                case 'error':
                    connectBtn.style.display = 'block';
                    disconnectBtn.style.display = 'none';
                    break;
            }
        }
    }

    getStatusColor(status) {
        switch (status) {
            case 'connected': return '#4CAF50';
            case 'waiting': return '#FF9800';
            case 'connecting': return '#2196F3';
            case 'disconnected': return '#9E9E9E';
            case 'error': return '#f44336';
            default: return '#9E9E9E';
        }
    }

    // Poll WhatsApp status for real-time updates
    startWhatsAppStatusPolling() {
        setInterval(async () => {
            if (this.currentSection === 'whatsapp') {
                try {
                    const response = await fetch('/api/whatsapp/status');
                    const data = await response.json();
                    
                    if (data.success) {
                        if (data.status.isConnected) {
                            this.updateWhatsAppStatus('connected', 'WhatsApp is connected and ready!');
                            this.hideQRCode();
                        } else if (data.status.hasQRCode) {
                            this.updateWhatsAppStatus('waiting', 'Waiting for QR code scan...');
                        }
                    }
                } catch (error) {
                    console.error('WhatsApp status polling error:', error);
                }
            }
        }, 5000); // Poll every 5 seconds
    }
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(notificationStyles);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KisanAI();
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
