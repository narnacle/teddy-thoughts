// script.js
class TeddyThoughts {
    constructor() {
        this.thoughtForm = document.getElementById('thoughtForm');
        this.negativeThought = document.getElementById('negativeThought');
        this.responseSection = document.getElementById('responseSection');
        this.teddyResponse = document.getElementById('teddyResponse');
        this.reframedThought = document.getElementById('reframedThought');
        this.newThoughtBtn = document.getElementById('newThoughtBtn');
        this.saveThoughtBtn = document.getElementById('saveThoughtBtn');
        this.savedThoughts = document.getElementById('savedThoughts');
        this.submitBtn = document.getElementById('submitBtn');
        
        this.savedThoughtsArray = this.loadSavedThoughts();
        this.userProgress = this.loadUserProgress();
        
        this.init();
    }
    
    init() {
        this.thoughtForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.newThoughtBtn.addEventListener('click', () => this.resetForm());
        this.saveThoughtBtn.addEventListener('click', () => this.saveCurrentThought());
        
        this.displaySavedThoughts();
        this.updateLevelDisplay();
        this.createLevelBadge();
    }
    
    // Level system methods
    getLevelFromPoints(points) {
        if (points >= 20) return 3;  // Level 3: 20+ points (after 15 more from level 2)
        if (points >= 5) return 2;    // Level 2: 5-19 points
        return 1;                      // Level 1: 0-4 points
    }
    
    getPointsForNextLevel(points) {
        const currentLevel = this.getLevelFromPoints(points);
        
        if (currentLevel === 1) {
            return 5 - points; // Points needed for level 2
        } else if (currentLevel === 2) {
            return 20 - points; // Points needed for level 3
        } else {
            return 0; // Max level
        }
    }
    
    getLevelTitle(level) {
        const titles = {
            1: "Comfort Seeker",
            2: "Thought Gardener",
            3: "Wisdom Weaver"
        };
        return titles[level] || "Teddy's Friend";
    }
    
    getLevelEmoji(level) {
        const emojis = {
            1: "🌱",
            2: "🌿",
            3: "🌸"
        };
        return emojis[level] || "🧸";
    }
    
    addPoint() {
        this.userProgress.points += 1;
        const oldLevel = this.userProgress.level;
        const newLevel = this.getLevelFromPoints(this.userProgress.points);
        
        this.userProgress.level = newLevel;
        this.userProgress.totalSubmissions += 1;
        
        this.saveUserProgress();
        this.updateLevelDisplay();
        
        // Check if level up occurred
        if (newLevel > oldLevel) {
            this.showLevelUpMessage(newLevel);
        }
        
        return {
            points: this.userProgress.points,
            level: newLevel,
            levelUp: newLevel > oldLevel
        };
    }
    
    showLevelUpMessage(newLevel) {
        const levelTitle = this.getLevelTitle(newLevel);
        const levelEmoji = this.getLevelEmoji(newLevel);
        
        // Create and show level up notification
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="level-up-content">
                <span class="level-up-emoji">${levelEmoji}</span>
                <div class="level-up-text">
                    <h3>Level Up! 🎉</h3>
                    <p>You've reached <strong>Level ${newLevel}: ${levelTitle}</strong></p>
                    <p class="level-up-message">${this.getLevelUpMessage(newLevel)}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    }
    
    getLevelUpMessage(level) {
        const messages = {
            2: "You're learning to nurture your thoughts like a garden. Keep going! 🌱",
            3: "Your wisdom is blooming! You're becoming a master of gentle self-talk. 🌸"
        };
        return messages[level] || "You're growing stronger every day! 🧸";
    }
    
    updateLevelDisplay() {
        const points = this.userProgress.points;
        const level = this.getLevelFromPoints(points);
        const pointsForNext = this.getPointsForNextLevel(points);
        const levelTitle = this.getLevelTitle(level);
        const levelEmoji = this.getLevelEmoji(level);
        
        // Calculate progress percentage
        let progressPercentage = 0;
        if (level === 1) {
            progressPercentage = (points / 5) * 100;
        } else if (level === 2) {
            progressPercentage = ((points - 5) / 15) * 100;
        } else {
            progressPercentage = 100; // Max level
        }
        
        // Update or create level display
        let levelDisplay = document.querySelector('.level-display');
        
        if (!levelDisplay) {
            levelDisplay = document.createElement('div');
            levelDisplay.className = 'level-display';
            const header = document.querySelector('header');
            header.appendChild(levelDisplay);
        }
        
        levelDisplay.innerHTML = `
            <div class="level-badge">
                <span class="level-emoji">${levelEmoji}</span>
                <div class="level-info">
                    <span class="level-name">Level ${level}: ${levelTitle}</span>
                    <span class="level-points">${points} ${points === 1 ? 'thought' : 'thoughts'} shared</span>
                </div>
            </div>
            ${pointsForNext > 0 ? `
                <div class="level-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <span class="progress-text">${pointsForNext} more ${pointsForNext === 1 ? 'thought' : 'thoughts'} to Level ${level + 1}</span>
                </div>
            ` : `
                <div class="level-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 100%"></div>
                    </div>
                    <span class="progress-text">🌟 Master level reached! 🌟</span>
                </div>
            `}
        `;
    }
    
    createLevelBadge() {
        // This adds a small badge next to the save button
        const level = this.getLevelFromPoints(this.userProgress.points);
        const emoji = this.getLevelEmoji(level);
        const title = this.getLevelTitle(level);
        
        const badge = document.createElement('div');
        badge.className = 'level-badge-mini';
        badge.innerHTML = `${emoji} Lvl ${level}: ${title}`;
        badge.title = `${this.userProgress.points} thoughts shared`;
        
        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons) {
            actionButtons.appendChild(badge);
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const thought = this.negativeThought.value.trim();
        
        if (thought) {
            // Disable button and show loading state
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = '<span class="btn-text">Teddy is thinking...</span><span class="btn-icon">🧸</span>';
            
            // Show response section with loading state
            this.responseSection.classList.remove('hidden');
            this.teddyResponse.textContent = "Let me think about that... 🧸";
            this.reframedThought.innerHTML = '<div class="loading-spinner"></div><p>Teddy is crafting a gentle response...</p>';
            
            try {
                // Send to webhook and wait for response
                const webhookResponse = await this.sendToWebhook(thought);
                
                // Add point for sharing a thought
                const levelInfo = this.addPoint();
                
                // Process only the output field from the webhook response
                this.processWebhookResponse(webhookResponse, thought, levelInfo);
                
            } catch (error) {
                console.error('Error sending to webhook:', error);
                
                // Still add point even if webhook fails (encouragement to keep trying)
                const levelInfo = this.addPoint();
                
                // Show error message with fallback
                this.teddyResponse.textContent = "Oh dear, I'm having trouble thinking clearly right now. But I'm still here with you! 🧸";
                this.reframedThought.innerHTML = `
                    <div style="text-align: center; color: #b47d4e;">
                        <p>Sometimes even teddy bears need a moment.</p>
                        <p style="font-size: 0.9rem; margin-top: 10px;">Please try again in a little while.</p>
                    </div>
                `;
                
            } finally {
                // Re-enable button
                this.submitBtn.disabled = false;
                this.submitBtn.innerHTML = '<span class="btn-text">Share with Teddy</span><span class="btn-icon">🧸</span>';
                this.negativeThought.value = '';
            }
        }
    }
    
    async sendToWebhook(thought) {
        const payload = {
            thought: thought,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            url: window.location.href,
            userLevel: this.userProgress.level,
            totalThoughts: this.userProgress.totalSubmissions
        };
        
        const response = await fetch("/api/thought", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
    
    processWebhookResponse(webhookResponse, originalThought, levelInfo) {
        // Extract ONLY the output field from the webhook response
        let outputMessage = '';
        let teddyMessage = "Here's a gentler way to look at this:";
        
        // Check if the response has an output field
        if (webhookResponse && webhookResponse.output) {
            // Get the output field value
            outputMessage = webhookResponse.output;
            
            // If output is an object with a message or text property, extract that
            if (typeof outputMessage === 'object' && outputMessage !== null) {
                if (outputMessage.message) {
                    outputMessage = outputMessage.message;
                } else if (outputMessage.text) {
                    outputMessage = outputMessage.text;
                } else if (outputMessage.content) {
                    outputMessage = outputMessage.content;
                } else {
                    // If it's an object but no recognizable text field, stringify it
                    outputMessage = JSON.stringify(outputMessage);
                }
            }
        } else {
            // If no output field, try to find something useful or show error
            console.warn('No output field found in webhook response:', webhookResponse);
            outputMessage = "Teddy received your thought but is taking a moment to find the right words. Please try again.";
            teddyMessage = "Hmm, I need a moment to think...";
        }
        
        // Clean up the message (remove quotes if it's a stringified string)
        if (typeof outputMessage === 'string') {
            if (outputMessage.startsWith('"') && outputMessage.endsWith('"')) {
                outputMessage = outputMessage.slice(1, -1);
            }
            
            // Decode any escaped characters
            outputMessage = outputMessage.replace(/\\"/g, '"').replace(/\\n/g, '\n');
        } else {
            // Convert to string if it's not already
            outputMessage = String(outputMessage);
        }
        
        // Add level up message to Teddy's response if applicable
        if (levelInfo && levelInfo.levelUp) {
            const levelEmoji = this.getLevelEmoji(levelInfo.level);
            const levelTitle = this.getLevelTitle(levelInfo.level);
            teddyMessage = `🎉 Congratulations! You've reached Level ${levelInfo.level}: ${levelTitle}! ${levelEmoji} ${teddyMessage}`;
        }
        
        // Set Teddy's introductory message
        this.teddyResponse.textContent = teddyMessage;
        
        // Set the reframed thought with just the output value
        this.reframedThought.innerHTML = `
            <div style="font-style: italic; color: #4a4a4a; white-space: pre-wrap;">
                "${outputMessage}"
            </div>
        `;
        
        // Store current thought for potential saving
        this.currentThought = {
            original: originalThought,
            reframed: outputMessage,
            timestamp: new Date().toLocaleString(),
            level: levelInfo.level,
            rawResponse: webhookResponse
        };
    }
    
    resetForm() {
        this.responseSection.classList.add('hidden');
        this.negativeThought.focus();
    }
    
    saveCurrentThought() {
        if (this.currentThought) {
            this.savedThoughtsArray.unshift(this.currentThought);
            
            // Keep only last 10 thoughts
            if (this.savedThoughtsArray.length > 10) {
                this.savedThoughtsArray.pop();
            }
            
            this.saveToLocalStorage();
            this.displaySavedThoughts();
            
            // Show subtle feedback
            this.saveThoughtBtn.textContent = '✓ Saved!';
            setTimeout(() => {
                this.saveThoughtBtn.innerHTML = '💾 Save This Reframe';
            }, 2000);
        }
    }
    
    displaySavedThoughts() {
        if (this.savedThoughtsArray.length === 0) {
            this.savedThoughts.innerHTML = `
                <div class="saved-thought-card" style="text-align: center; color: #b47d4e;">
                    <p>Your saved thoughts will appear here 🫙</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">Share a thought with Teddy to get started!</p>
                </div>
            `;
            return;
        }
        
        this.savedThoughts.innerHTML = this.savedThoughtsArray
            .map((thought, index) => {
                const levelEmoji = this.getLevelEmoji(thought.level || 1);
                return `
                    <div class="saved-thought-card">
                        <button class="delete-thought" onclick="teddyThoughts.deleteThought(${index})">✕</button>
                        <div class="saved-thought-header">
                            <span class="thought-level-badge">${levelEmoji} Lvl ${thought.level || 1}</span>
                        </div>
                        <p><strong>You said:</strong> "${thought.original}"</p>
                        <p><strong>Teddy said:</strong> "${thought.reframed}"</p>
                        <small>${thought.timestamp}</small>
                    </div>
                `;
            })
            .join('');
    }
    
    deleteThought(index) {
        this.savedThoughtsArray.splice(index, 1);
        this.saveToLocalStorage();
        this.displaySavedThoughts();
    }
    
    saveToLocalStorage() {
        localStorage.setItem('teddyThoughts', JSON.stringify(this.savedThoughtsArray));
        this.saveUserProgress();
    }
    
    loadSavedThoughts() {
        const saved = localStorage.getItem('teddyThoughts');
        return saved ? JSON.parse(saved) : [];
    }
    
    loadUserProgress() {
        const saved = localStorage.getItem('teddyThoughtsProgress');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default progress for new users
        return {
            points: 0,
            level: 1,
            totalSubmissions: 0,
            joinDate: new Date().toISOString()
        };
    }
    
    saveUserProgress() {
        localStorage.setItem('teddyThoughtsProgress', JSON.stringify(this.userProgress));
    }
}

// Initialize the app
const teddyThoughts = new TeddyThoughts();

// Add some keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const form = document.getElementById('thoughtForm');
        const event = new Event('submit', { cancelable: true });
        form.dispatchEvent(event);
    }
    
    // Escape to clear
    if (e.key === 'Escape') {
        const responseSection = document.getElementById('responseSection');
        if (!responseSection.classList.contains('hidden')) {
            responseSection.classList.add('hidden');
        }
    }
});