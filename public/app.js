// Kisan AI - Main Application JavaScript
class KisanAI {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentLanguage = 'hi';
        this.socket = null;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recognition = null;
        this.isVoiceRecording = false;
        
        this.init();
        this.initVoiceRecognition();
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



        // AI Irrigation Plan form
        const aiIrrigationForm = document.getElementById('ai-irrigation-form');
        if (aiIrrigationForm) {
            aiIrrigationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateAIIrrigationPlan();
            });
        }

        // Schemes Chat input
        const schemesChatInput = document.getElementById('schemes-chat-input');
        const schemesSendBtn = document.getElementById('schemes-send-btn');
        if (schemesChatInput && schemesSendBtn) {
            schemesSendBtn.addEventListener('click', () => this.sendSchemesMessage());
            schemesChatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendSchemesMessage();
            });
        }

        // Profile button
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => this.showProfile());
        }
        
        // Dataset upload form
        const datasetUploadForm = document.getElementById('dataset-upload-form');
        if (datasetUploadForm) {
            datasetUploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleDatasetUpload();
            });
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
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    // Go to home page function
    goHome() {
        this.navigateToSection('dashboard');
        // Scroll to top with smooth animation
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            case 'custom-data':
                this.navigateToSection('custom-data');
                this.loadDatasets();
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
        
        // Auto-detect language and show indicator
        const detectedLang = this.detectLanguageFromText(message);
        if (detectedLang === 'hi') {
            this.showNotification('🌐 हिंदी में जवाब दिया जा रहा है...', 'info');
        }
        
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
                    language: 'auto' // Auto-detect language from message
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
            this.showNotification('⚠️ Please select a crop and enter your location to get market insights!', 'warning');
            return;
        }
        
        // Show loading notification
        this.showNotification('🔄 Analyzing market data... Please wait!', 'info');
        
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
            
            if (data.success && data.marketAnalysis) {
                this.displayMarketAnalysis(data.marketAnalysis);
            } else {
                throw new Error(data.error || 'No market data received');
            }
            
        } catch (error) {
            console.error('Market analysis error:', error);
            this.showNotification('❌ Failed to analyze market. Please try again later.', 'error');
        }
    }

    displayMarketAnalysis(analysis) {
        const marketAnalysis = document.getElementById('market-analysis');
        const marketAnalysisContent = document.getElementById('market-analysis-content');
        
        if (marketAnalysis && marketAnalysisContent) {
            // Enhanced display with better formatting
            const formattedAnalysis = analysis
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>');
            
            marketAnalysisContent.innerHTML = `
                <div class="analysis-text">
                    <p>${formattedAnalysis}</p>
                </div>
            `;
            
            marketAnalysis.style.display = 'block';
            marketAnalysis.style.animation = 'slideInUp 0.6s ease-out';
            
            // Scroll to result
            marketAnalysis.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add success notification
            this.showNotification('📊 Market analysis complete! Check the detailed insights below.', 'success');
        }
    }



    async generateAIIrrigationPlan() {
        const cropSelect = document.getElementById('ai-crop-select');
        const soilTypeSelect = document.getElementById('ai-soil-type');
        const locationInput = document.getElementById('ai-location');
        const phoneInput = document.getElementById('ai-phone');
        
        const crop = cropSelect.value;
        const soilType = soilTypeSelect.value;
        const location = locationInput.value;
        const phoneNumber = phoneInput.value;
        
        if (!crop || !soilType || !location) {
            this.showNotification('Please fill in crop, soil type, and location', 'warning');
            return;
        }
        
        try {
            // Show loading state
            const submitBtn = document.querySelector('#ai-irrigation-form .ai-plan-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Plan...';
            submitBtn.disabled = true;
            
            const response = await fetch('/api/irrigation/ai-irrigation-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    crop: crop,
                    soilType: soilType,
                    location: location,
                    phoneNumber: phoneNumber || null
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.displayAIIrrigationPlan(data);
                this.showNotification('🌾 AI Irrigation Plan generated successfully!', 'success');
            } else {
                throw new Error(data.error || 'Failed to generate irrigation plan');
            }
            
        } catch (error) {
            console.error('AI Irrigation Plan error:', error);
            this.showNotification('Failed to generate AI irrigation plan', 'error');
        } finally {
            // Reset button state
            const submitBtn = document.querySelector('#ai-irrigation-form .ai-plan-btn');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    displayAIIrrigationPlan(data) {
        const resultsDiv = document.getElementById('ai-plan-results');
        const farmInfoDiv = document.getElementById('farm-info');
        const weatherForecastDiv = document.getElementById('weather-forecast');
        const planContentDiv = document.getElementById('irrigation-plan-content');
        const whatsappStatusDiv = document.getElementById('whatsapp-status');
        
        if (resultsDiv && farmInfoDiv && weatherForecastDiv && planContentDiv && whatsappStatusDiv) {
            // Display farm information
            farmInfoDiv.innerHTML = `
                <h5><i class="fas fa-farm"></i> Farm Details</h5>
                <p><strong>Crop:</strong> ${data.farmDetails.crop}</p>
                <p><strong>Soil Type:</strong> ${data.farmDetails.soilType}</p>
                <p><strong>Location:</strong> ${data.farmDetails.location}</p>
                <p><strong>Generated:</strong> ${new Date(data.timestamp).toLocaleString('en-IN')}</p>
            `;
            
            // Display weather forecast if available
            if (data.weatherData && data.weatherData.forecast) {
                const weatherHTML = `
                    <h5><i class="fas fa-cloud-sun"></i> 7-Day Weather Forecast</h5>
                    <div class="weather-grid">
                        ${data.weatherData.forecast.map(day => `
                            <div class="weather-day">
                                <div class="date">${new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                <div class="temp">${day.temperature}°C</div>
                                <div class="rainfall">${day.rainfall > 0 ? `🌧️ ${day.rainfall}mm` : '☀️ No Rain'}</div>
                                <div class="humidity">💧 ${day.humidity}%</div>
                                <div class="wind">💨 ${day.windSpeed} km/h</div>
                                <div class="recommendation">${day.irrigationRecommendation}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
                weatherForecastDiv.innerHTML = weatherHTML;
            } else {
                weatherForecastDiv.innerHTML = `
                    <h5><i class="fas fa-exclamation-triangle"></i> Weather Data Unavailable</h5>
                    <p>Weather forecast could not be retrieved. Irrigation plan will be based on general recommendations.</p>
                `;
            }
            
            // Display irrigation plan
            planContentDiv.innerHTML = data.irrigationPlan.replace(/\n/g, '<br>');
            
            // Display WhatsApp status
            if (data.whatsappStatus) {
                if (data.whatsappStatus.success) {
                    whatsappStatusDiv.innerHTML = `
                        <i class="fas fa-check-circle"></i>
                        ✅ Plan sent to WhatsApp successfully!
                    `;
                } else {
                    whatsappStatusDiv.innerHTML = `
                        <i class="fas fa-exclamation-triangle"></i>
                        ⚠️ WhatsApp delivery failed: ${data.whatsappStatus.error}
                    `;
                }
            } else if (data.farmDetails.phoneNumber) {
                whatsappStatusDiv.innerHTML = `
                    <i class="fas fa-info-circle"></i>
                    ℹ️ Phone number provided but WhatsApp not connected
                `;
            } else {
                whatsappStatusDiv.innerHTML = `
                    <i class="fas fa-info-circle"></i>
                    ℹ️ No phone number provided for WhatsApp delivery
                `;
            }
            
            // Show results
            resultsDiv.style.display = 'block';
            resultsDiv.style.animation = 'slideInUp 0.6s ease-out';
            
            // Scroll to results
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Schemes Chat Methods
    async sendSchemesMessage() {
        const input = document.getElementById('schemes-chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        this.addSchemesMessage('user', message);
        input.value = '';
        
        // Add thinking message
        const thinkingId = this.addThinkingMessage();
        
        try {
            const response = await fetch('/api/schemes/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    language: 'auto', // Auto-detect language from message
                    conversationHistory: this.schemesConversationHistory || []
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Remove thinking message
                this.removeThinkingMessage(thinkingId);
                
                // Add AI response to chat
                this.addSchemesMessage('ai', data.response);
                
                // Update conversation history
                if (!this.schemesConversationHistory) this.schemesConversationHistory = [];
                this.schemesConversationHistory.push(
                    { role: 'user', content: message },
                    { role: 'ai', content: data.response }
                );
                
                // Display relevant schemes and financial options
                if (data.relevantSchemes && data.relevantSchemes.length > 0) {
                    this.displaySchemes(data.relevantSchemes);
                }
                
                if (data.relevantFinancialOptions && data.relevantFinancialOptions.length > 0) {
                    this.displayFinancialOptions(data.relevantFinancialOptions);
                }
                
                // Show schemes display
                const schemesDisplay = document.getElementById('schemes-display');
                if (schemesDisplay) {
                    schemesDisplay.style.display = 'block';
                }
            } else {
                throw new Error(data.error);
            }
            
        } catch (error) {
            console.error('Schemes Chat Error:', error);
            this.addSchemesMessage('ai', 'Sorry, I encountered an error. Please try again.');
        }
    }

    addSchemesMessage(role, content) {
        const messagesContainer = document.getElementById('schemes-chat-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const avatar = role === 'ai' ? '🏛️' : '👨‍🌾';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <p>${content}</p>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addThinkingMessage() {
        const messagesContainer = document.getElementById('schemes-chat-messages');
        if (!messagesContainer) return null;
        
        const thinkingDiv = document.createElement('div');
        const thinkingId = 'thinking-' + Date.now();
        thinkingDiv.id = thinkingId;
        thinkingDiv.className = 'message ai-message thinking-message';
        
        thinkingDiv.innerHTML = `
            <div class="message-avatar">🏛️</div>
            <div class="message-content">
                <div class="thinking-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <p>Thinking...</p>
            </div>
        `;
        
        messagesContainer.appendChild(thinkingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return thinkingId;
    }

    removeThinkingMessage(thinkingId) {
        if (thinkingId) {
            const thinkingDiv = document.getElementById(thinkingId);
            if (thinkingDiv) {
                thinkingDiv.remove();
            }
        }
    }

    addThinkingMessageMain() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return null;
        
        const thinkingDiv = document.createElement('div');
        const thinkingId = 'thinking-main-' + Date.now();
        thinkingDiv.id = thinkingId;
        thinkingDiv.className = 'message ai-message thinking-message';
        
        thinkingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="thinking-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <p>Thinking...</p>
            </div>
        `;
        
        messagesContainer.appendChild(thinkingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return thinkingId;
    }

    displaySchemes(schemes) {
        const schemesList = document.getElementById('schemes-list');
        if (!schemesList) return;
        
        schemesList.innerHTML = schemes.map(scheme => `
            <div class="scheme-card">
                <h5>${scheme.name}</h5>
                <p><strong>Description:</strong> ${scheme.description}</p>
                <p><strong>Eligibility:</strong> ${scheme.eligibility}</p>
                <p><strong>Benefits:</strong> ${scheme.benefits}</p>
                <div class="benefits">
                    <strong>Application Process:</strong> ${scheme.applicationProcess}
                </div>
                <div class="contact">
                    <strong>Contact:</strong> ${scheme.contact}<br>
                    <strong>Website:</strong> <a href="${scheme.website}" target="_blank">${scheme.website}</a>
                </div>
            </div>
        `).join('');
    }

    displayFinancialOptions(options) {
        const financialOptions = document.getElementById('financial-options');
        if (!financialOptions) return;
        
        financialOptions.innerHTML = options.map(option => `
            <div class="financial-card">
                <h5>${option.name}</h5>
                <p><strong>Type:</strong> ${option.type}</p>
                <p><strong>Amount:</strong> ${option.amount}</p>
                <p><strong>Interest:</strong> ${option.interest}</p>
                <p><strong>Tenure:</strong> ${option.tenure}</p>
                <div class="features">
                    <strong>Features:</strong><br>
                    ${option.features.map(feature => `• ${feature}`).join('<br>')}
                </div>
            </div>
        `).join('');
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

    // Auto-detect language from text
    detectLanguageFromText(text) {
        const hindiPattern = /[\u0900-\u097F]/; // Devanagari script range
        const englishPattern = /[a-zA-Z]/;
        
        if (hindiPattern.test(text)) {
            return 'hi';
        } else if (englishPattern.test(text)) {
            return 'en';
        }
        
        return 'en'; // Default to English
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
            } else if (section === 'schemes-chat') {
                btn.textContent = this.currentLanguage === 'hi' ? 'योजनाएं' : 'Schemes';
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

    // Advanced AI Features
    async getCropIntelligence() {
        try {
            this.showNotification('🧠 Analyzing your farm with AI...', 'info');
            
            const response = await fetch('/api/ai/crop-intelligence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location: 'Punjab, India',
                    soilType: 'Alluvial',
                    season: 'Kharif',
                    budget: 50000,
                    farmSize: 5,
                    previousCrop: 'Wheat',
                    waterAvailability: 'Adequate',
                    marketPreference: 'Cash crops'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.displayAdvancedAnalysis('🧠 AI Crop Intelligence Report', data.cropIntelligence);
                this.showNotification('✨ AI Analysis Complete!', 'success');
            } else {
                this.showNotification('Feature coming soon!', 'info');
            }
            
        } catch (error) {
            console.error('Crop Intelligence Error:', error);
            this.showNotification('Feature coming soon!', 'info');
        }
    }

    async getWeatherIntelligence() {
        try {
            this.showNotification('🌦️ Fetching weather intelligence...', 'info');
            
            const response = await fetch('/api/market/weather-intelligence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location: 'Punjab, India',
                    crop: 'Rice',
                    operationType: 'Spraying'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.displayAdvancedAnalysis('🌦️ Weather Intelligence', data.weatherIntelligence);
                this.showNotification('⚡ Weather analysis ready!', 'success');
            } else {
                this.showNotification('Weather feature coming soon!', 'info');
            }
            
        } catch (error) {
            console.error('Weather Intelligence Error:', error);
            this.showNotification('Weather feature coming soon!', 'info');
        }
    }

    displayAdvancedAnalysis(title, content) {
        // Simple modal for now
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white; border-radius: 12px; padding: 2rem; max-width: 80%; max-height: 80%;
                overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <h2 style="margin: 0 0 1rem 0;">${title}</h2>
                <div style="line-height: 1.6;">${content.replace(/\n/g, '<br>')}</div>
                <button onclick="this.closest('div').remove()" style="
                    margin-top: 1rem; padding: 0.5rem 1rem; background: #16A085; color: white;
                    border: none; border-radius: 6px; cursor: pointer;
                ">Close</button>
            </div>
        `;
        
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        document.body.appendChild(modal);
    }

    // Voice Recognition Methods
    initVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;
            
            this.recognition.onstart = () => {
                this.updateVoiceStatus('Listening... Speak now', 'listening');
                const recordBtn = document.getElementById('start-recording');
                const stopBtn = document.getElementById('stop-recording');
                if (recordBtn) recordBtn.style.display = 'none';
                if (stopBtn) stopBtn.style.display = 'flex';
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.displayTranscript(transcript);
                this.updateVoiceStatus('Speech recognized successfully!', '');
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.updateVoiceStatus(`Error: ${event.error}`, 'error');
                this.resetVoiceButtons();
            };
            
            this.recognition.onend = () => {
                this.updateVoiceStatus('Ready to listen...', '');
                this.resetVoiceButtons();
            };
            
            // Add voice interface event listeners
            this.setupVoiceEventListeners();
        } else {
            console.warn('Speech recognition not supported');
        }
    }

    setupVoiceEventListeners() {
        document.getElementById('voice-input-btn')?.addEventListener('click', () => {
            this.toggleVoiceInterface();
        });

        document.getElementById('close-voice')?.addEventListener('click', () => {
            this.closeVoiceInterface();
        });

        document.getElementById('start-recording')?.addEventListener('click', () => {
            this.startVoiceRecording();
        });

        document.getElementById('stop-recording')?.addEventListener('click', () => {
            this.stopVoiceRecording();
        });

        document.getElementById('use-transcript')?.addEventListener('click', () => {
            this.useTranscript();
        });
    }

    toggleVoiceInterface() {
        const voiceInterface = document.getElementById('voice-interface');
        if (voiceInterface) {
            if (voiceInterface.style.display === 'none') {
                voiceInterface.style.display = 'block';
                voiceInterface.style.animation = 'slideInUp 0.3s ease-out';
            } else {
                voiceInterface.style.display = 'none';
            }
        }
    }

    closeVoiceInterface() {
        const voiceInterface = document.getElementById('voice-interface');
        if (voiceInterface) {
            voiceInterface.style.display = 'none';
        }
        if (this.recognition && this.isVoiceRecording) {
            this.stopVoiceRecording();
        }
    }

    startVoiceRecording() {
        if (!this.recognition) {
            this.showNotification('❌ Speech recognition not supported in this browser', 'error');
            return;
        }

        const languageSelect = document.getElementById('voice-language');
        const selectedLanguage = languageSelect ? languageSelect.value : 'hi-IN';
        
        this.recognition.lang = selectedLanguage;
        this.isVoiceRecording = true;
        
        try {
            this.recognition.start();
            this.updateVoiceStatus('Starting...', 'listening');
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.showNotification('❌ Could not start voice recognition', 'error');
            this.resetVoiceButtons();
        }
    }

    stopVoiceRecording() {
        if (this.recognition && this.isVoiceRecording) {
            this.recognition.stop();
            this.isVoiceRecording = false;
            this.updateVoiceStatus('Processing...', '');
        }
    }

    updateVoiceStatus(message, className) {
        const statusElement = document.getElementById('voice-status');
        if (statusElement) {
            statusElement.innerHTML = `<p>${message}</p>`;
            statusElement.className = `voice-status ${className}`;
        }
    }

    displayTranscript(transcript) {
        const transcriptElement = document.getElementById('voice-transcript');
        const transcriptText = document.getElementById('transcript-text');
        
        if (transcriptElement && transcriptText) {
            transcriptText.textContent = transcript;
            transcriptElement.style.display = 'block';
        }
    }

    useTranscript() {
        const transcriptText = document.getElementById('transcript-text');
        const chatInput = document.getElementById('chat-input');
        
        if (transcriptText && chatInput) {
            chatInput.value = transcriptText.textContent;
            this.closeVoiceInterface();
            this.showNotification('✅ Voice input added to chat!', 'success');
        }
    }

    resetVoiceButtons() {
        const recordBtn = document.getElementById('start-recording');
        const stopBtn = document.getElementById('stop-recording');
        
        if (recordBtn) recordBtn.style.display = 'flex';
        if (stopBtn) stopBtn.style.display = 'none';
        
        this.isVoiceRecording = false;
    }
    
    // Custom Dataset Management
    async loadDatasets() {
        try {
            const response = await fetch('/api/custom-data/datasets');
            const data = await response.json();
            
            if (data.success) {
                this.displayDatasets(data.datasets);
            } else {
                this.showNotification('Failed to load datasets', 'error');
            }
        } catch (error) {
            console.error('Error loading datasets:', error);
            this.showNotification('Failed to load datasets', 'error');
        }
    }
    
    displayDatasets(datasets) {
        const container = document.getElementById('datasets-container');
        
        if (datasets.length === 0) {
            container.innerHTML = `
                <div class="no-datasets">
                    <i class="fas fa-database"></i>
                    <p>No datasets uploaded yet. Upload your first dataset to get started!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = datasets.map(dataset => `
            <div class="dataset-item" data-id="${dataset.id}">
                <div class="dataset-header">
                    <h5><i class="fas fa-database"></i> ${dataset.name}</h5>
                    <div class="dataset-actions">
                        <button class="view-btn" onclick="kisanAI.viewDataset('${dataset.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="delete-btn" onclick="kisanAI.deleteDataset('${dataset.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                <div class="dataset-info">
                    <span class="dataset-type">${dataset.type}</span>
                    <span class="dataset-location">${dataset.metadata.location}</span>
                    <span class="dataset-date">${new Date(dataset.metadata.createdAt).toLocaleDateString()}</span>
                </div>
                <p class="dataset-description">${dataset.description || 'No description provided'}</p>
            </div>
        `).join('');
    }
    
    async uploadDataset(formData) {
        try {
            const response = await fetch('/api/custom-data/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Dataset uploaded successfully!', 'success');
                this.loadDatasets(); // Refresh the list
                document.getElementById('dataset-upload-form').reset();
            } else {
                this.showNotification(data.error || 'Failed to upload dataset', 'error');
            }
        } catch (error) {
            console.error('Error uploading dataset:', error);
            this.showNotification('Failed to upload dataset', 'error');
        }
    }
    
    handleDatasetUpload() {
        const form = document.getElementById('dataset-upload-form');
        const formData = new FormData();
        
        // Get form values
        formData.append('name', document.getElementById('dataset-name').value);
        formData.append('type', document.getElementById('dataset-type').value);
        formData.append('description', document.getElementById('dataset-description').value);
        formData.append('location', document.getElementById('dataset-location').value);
        formData.append('source', document.getElementById('dataset-source').value);
        
        const fileInput = document.getElementById('dataset-file');
        if (fileInput.files[0]) {
            formData.append('dataset', fileInput.files[0]);
        } else {
            this.showNotification('Please select a file to upload', 'error');
            return;
        }
        
        this.uploadDataset(formData);
    }
    
    async deleteDataset(datasetId) {
        if (!confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/custom-data/datasets/${datasetId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Dataset deleted successfully!', 'success');
                this.loadDatasets(); // Refresh the list
            } else {
                this.showNotification(data.error || 'Failed to delete dataset', 'error');
            }
        } catch (error) {
            console.error('Error deleting dataset:', error);
            this.showNotification('Failed to delete dataset', 'error');
        }
    }
    
    async viewDataset(datasetId) {
        try {
            const response = await fetch(`/api/custom-data/datasets/${datasetId}`);
            const data = await response.json();
            
            if (data.success) {
                this.showDatasetDetails(data.dataset);
            } else {
                this.showNotification(data.error || 'Failed to load dataset', 'error');
            }
        } catch (error) {
            console.error('Error loading dataset:', error);
            this.showNotification('Failed to load dataset', 'error');
        }
    }
    
    showDatasetDetails(dataset) {
        const modal = document.createElement('div');
        modal.className = 'dataset-modal';
        modal.innerHTML = `
            <div class="dataset-modal-content">
                <div class="modal-header">
                    <h3>${dataset.name}</h3>
                    <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="dataset-details">
                        <p><strong>Type:</strong> ${dataset.type}</p>
                        <p><strong>Location:</strong> ${dataset.metadata.location}</p>
                        <p><strong>Source:</strong> ${dataset.metadata.source}</p>
                        <p><strong>Created:</strong> ${new Date(dataset.metadata.createdAt).toLocaleString()}</p>
                        <p><strong>Description:</strong> ${dataset.description || 'No description'}</p>
                    </div>
                    <div class="dataset-preview">
                        <h4>Data Preview</h4>
                        <pre>${JSON.stringify(dataset.data, null, 2)}</pre>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
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



document.addEventListener('DOMContentLoaded', () => {
    window.kisanAI = new KisanAI();
});

// Global function to go home (called from HTML onclick)
function goHome() {
    if (window.kisanAI) {
        window.kisanAI.goHome();
    }
}

// Global function to show schemes chat (called from HTML onclick)
function showSchemesChat() {
    if (window.kisanAI) {
        window.kisanAI.navigateToSection('schemes-chat');
    }
}

// Global function to get WhatsApp QR code - SUPER SIMPLE
async function getWhatsAppQR() {
    try {
        console.log('🔍 Getting WhatsApp QR code...');
        const response = await fetch('/api/whatsapp/qr');
        const data = await response.json();
        
        console.log('QR response:', data);
        
        if (data.success && data.qrCode) {
            // Show QR code immediately
            showQRCodeModal(data.qrCode);
        } else {
            console.log('QR code status:', data);
            alert('WhatsApp status: ' + data.message);
        }
    } catch (error) {
        console.error('QR code error:', error);
        alert('Failed to get QR code. Check console for details.');
    }
}

// Check WhatsApp status
async function checkWhatsAppStatus() {
    try {
        const response = await fetch('/api/whatsapp/status');
        const data = await response.json();
        
        if (data.success) {
            const status = data.status;
            alert(`WhatsApp Status:\n` +
                  `Connected: ${status.isConnected ? '✅ Yes' : '❌ No'}\n` +
                  `Initializing: ${status.isInitializing ? '🔄 Yes' : '❌ No'}\n` +
                  `Has QR Code: ${status.hasQRCode ? '📱 Yes' : '❌ No'}\n` +
                  `Client Exists: ${status.clientExists ? '✅ Yes' : '❌ No'}`);
        }
    } catch (error) {
        console.error('Status check error:', error);
        alert('Failed to check status');
    }
}

// Show QR code modal
function showQRCodeModal(qrCodeData) {
    const modal = document.createElement('div');
    modal.className = 'qr-modal';
    modal.innerHTML = `
        <div class="qr-modal-content">
            <h3>📱 WhatsApp QR Code</h3>
            <p>Scan this QR code with your WhatsApp mobile app:</p>
            <img src="${qrCodeData}" alt="WhatsApp QR Code" style="width: 300px; height: 300px;">
            <p><strong>Steps:</strong></p>
            <ol>
                <li>Open WhatsApp on your phone</li>
                <li>Go to Settings > Linked Devices</li>
                <li>Tap "Link a Device"</li>
                <li>Scan this QR code</li>
            </ol>
            <button onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

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
