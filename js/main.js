/* ===================================
   MAIN NAVIGATION & SCREEN MANAGEMENT
   Valentine's Day Website Flow
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    console.log('💕 Valentine\'s Day Website Loaded! 💕');

    // Get all screens
    const screens = {
        intro: document.getElementById('screen-intro'),
        question: document.getElementById('screen-question'),
        recaptcha: document.getElementById('screen-recaptcha'),
        loading: document.getElementById('screen-loading'),
        grid: document.getElementById('screen-grid'),
        success: document.getElementById('screen-success')
    };

    // Get buttons and elements
    const buttons = {
        envelope: document.getElementById('start-envelope'),
        yes: document.getElementById('yes-btn'),
        no: document.getElementById('no-btn'),
        robotCheckbox: document.getElementById('robot-checkbox'),
        home: document.getElementById('home-btn')
    };

    // Current screen tracker
    let currentScreen = 'intro';

    // ==================
    // SCREEN TRANSITIONS
    // ==================

    function showScreen(screenName) {
        // Hide all screens
        Object.keys(screens).forEach(key => {
            if (screens[key]) {
                screens[key].classList.remove('active');
            }
        });

        // Show target screen with animation
        if (screens[screenName]) {
            screens[screenName].classList.add('active');
            currentScreen = screenName;
            
            // Add entrance animation
            screens[screenName].style.animation = 'fadeIn 0.5s ease-out';
            
            // Show/hide home button based on screen
            if (screenName === 'intro') {
                buttons.home.style.display = 'none';
            } else {
                buttons.home.style.display = 'flex';
            }
        }
    }

    // ==================
    // BUTTON HANDLERS
    // ==================

    // ENVELOPE Click - Start journey
    if (buttons.envelope) {
        buttons.envelope.parentElement.addEventListener('click', function() {
            console.log('Envelope clicked! Starting journey... 💕');
            playClickSound();
            
            // Start background music
            const backgroundMusic = document.getElementById('background-music');
            if (backgroundMusic) {
                backgroundMusic.play().catch(function(error) {
                    console.log('Music play error:', error);
                });
            }
            
            // Add animation
            buttons.envelope.style.animation = 'heartbeat 0.5s ease-out';
            
            setTimeout(() => {
                showScreen('question');
            }, 500);
        });
    }

    // HOME Button - Return to intro
    if (buttons.home) {
        buttons.home.addEventListener('click', function() {
            console.log('Going home! 🏠');
            playClickSound();
            
            // Reset all states
            const checkbox = document.getElementById('checkbox');
            if (checkbox) {
                checkbox.classList.remove('checked');
            }
            
            // Reset grid selections
            const gridItems = document.querySelectorAll('.grid-item');
            gridItems.forEach(item => {
                item.classList.remove('selected');
            });
            
            showScreen('intro');
        });
    }

    // YES Button - Show reCAPTCHA
    if (buttons.yes) {
        buttons.yes.addEventListener('click', function() {
            console.log('Yes clicked! 💕');
            playClickSound();
            
            // Add success animation
            this.style.animation = 'popIn 0.3s ease-out';
            
            setTimeout(() => {
                showScreen('recaptcha');
            }, 300);
        });
    }

    // NO Button - Already handled in no-button-evasion.js
    // But we can add a backup handler
    if (buttons.no) {
        buttons.no.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('No button clicked (somehow!)');
            playErrorSound();
        });
    }

    // reCAPTCHA Checkbox
    if (buttons.robotCheckbox) {
        buttons.robotCheckbox.addEventListener('click', function() {
            const checkbox = document.getElementById('checkbox');
            
            if (!checkbox.classList.contains('checked')) {
                checkbox.classList.add('checked');
                playClickSound();
                
                // Show loading below checkbox (keep checkbox and logo visible)
                setTimeout(() => {
                    const loadingContainer = document.getElementById('recaptcha-loading');
                    
                    // Show loading container below the checkbox
                    if (loadingContainer) {
                        loadingContainer.style.display = 'block';
                        setTimeout(() => {
                            loadingContainer.classList.add('show');
                            
                            // Start progress bar animation
                            const progressFill = document.getElementById('recaptcha-progress-fill');
                            if (progressFill) {
                                let progress = 0;
                                const interval = setInterval(() => {
                                    progress += 5;
                                    progressFill.style.width = progress + '%';
                                    
                                    if (progress >= 100) {
                                        clearInterval(interval);
                                        // Show grid after loading completes
                                        setTimeout(() => {
                                            showScreen('grid');
                                            
                                            // Reset recaptcha box for future use
                                            if (loadingContainer) {
                                                loadingContainer.classList.remove('show');
                                                setTimeout(() => {
                                                    loadingContainer.style.display = 'none';
                                                    progressFill.style.width = '0%';
                                                }, 300);
                                            }
                                            checkbox.classList.remove('checked');
                                        }, 500);
                                    }
                                }, 80); // 100% in ~1.6 seconds
                            }
                        }, 10);
                    }
                }, 800);
            }
        });
    }

    // Listen for grid verification completion
    document.addEventListener('gridVerified', function() {
        console.log('Grid verified! Moving to success screen...');
        playSuccessSound();
        
        setTimeout(() => {
            showScreen('success');
            triggerConfetti();
        }, 500);
    });


    // ==================
    // UTILITY FUNCTIONS
    // ==================

    // Show modal/alert with custom styling
    function showModal(message) {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-message">${message}</div>
                <button class="pixel-btn modal-close">Close ♥</button>
            </div>
        `;
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        `;

        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: #f5f5dc;
            border: 4px solid #000;
            padding: 40px;
            max-width: 500px;
            text-align: center;
            box-shadow: 8px 8px 0 #000;
            animation: popIn 0.3s ease-out;
        `;

        const modalMessage = modal.querySelector('.modal-message');
        modalMessage.style.cssText = `
            font-family: 'Press Start 2P', cursive;
            font-size: 14px;
            color: #d63384;
            margin-bottom: 30px;
            line-height: 1.8;
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', function() {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });

        // Close on background click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeBtn.click();
            }
        });
    }

    // Trigger confetti animation
    function triggerConfetti() {
        const confettiCount = 50;
        const colors = ['#ff69b4', '#ff1493', '#ffc0cb', '#ffb6c1', '#ff6b9d'];

        for (let i = 0; i < confettiCount; i++) {
            createConfetti(colors[i % colors.length]);
        }
    }

    function createConfetti(color) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${color};
            top: -10px;
            left: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.5 + 0.5};
            transform: rotate(${Math.random() * 360}deg);
            animation: confetti-fall ${Math.random() * 3 + 2}s linear;
            pointer-events: none;
            z-index: 999;
        `;

        document.body.appendChild(confetti);

        confetti.addEventListener('animationend', function() {
            document.body.removeChild(confetti);
        });
    }

    // Sound effects (simple beep using Web Audio API)
    function playClickSound() {
        playTone(800, 0.1, 'sine');
    }

    function playSuccessSound() {
        playTone(1200, 0.2, 'sine');
        setTimeout(() => playTone(1400, 0.2, 'sine'), 100);
    }

    function playErrorSound() {
        playTone(300, 0.2, 'sawtooth');
    }

    function playTone(frequency, duration, type = 'sine') {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // Silent fail if Web Audio API not supported
            console.log('Audio not supported');
        }
    }

    // ==================
    // KEYBOARD SHORTCUTS
    // ==================

    document.addEventListener('keydown', function(e) {
        // Press Enter on Yes button
        if (e.key === 'Enter' && currentScreen === 'question') {
            buttons.yes.click();
        }

        // Press Space on checkbox
        if (e.key === ' ' && currentScreen === 'recaptcha') {
            e.preventDefault();
            buttons.robotCheckbox.click();
        }

        // Easter egg: Press heart emoji or 'L' for love
        if (e.key === 'l' || e.key === 'L') {
            console.log('💕 L is for LOVE! 💕');
        }
    });

    // ==================
    // EASTER EGGS
    // ==================

    // Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.key);
        konamiCode = konamiCode.slice(-10);

        if (konamiCode.join('').toLowerCase() === konamiSequence.join('').toLowerCase()) {
            triggerConfetti();
            showModal('🎮 Konami Code Activated! You found the secret! 💕✨');
        }
    });

    // Click heart counter
    let heartClicks = 0;
    const pixelHearts = document.querySelectorAll('.pixel-heart');
    
    pixelHearts.forEach(heart => {
        heart.addEventListener('click', function() {
            heartClicks++;
            this.style.animation = 'heartbeat 0.5s ease-out';
            
            if (heartClicks === 10) {
                showModal('💕 You really love clicking hearts! Here\'s some confetti! 💕');
                triggerConfetti();
                heartClicks = 0;
            }
        });
    });

    // ==================
    // INITIALIZATION
    // ==================

    // Show first screen (intro with envelope)
    showScreen('intro');
    
    // Hide home button on intro
    buttons.home.style.display = 'none';

    // ==================
    // BACKGROUND MUSIC
    // ==================
    
    const backgroundMusic = document.getElementById('background-music');
    const musicToggle = document.getElementById('music-toggle');
    const musicIcon = document.getElementById('music-icon');
    
    if (backgroundMusic && musicToggle) {
        // Set initial volume
        backgroundMusic.volume = 0.5; // Set volume to 50%
        let musicStarted = false;
        
        // Attempt autoplay
        backgroundMusic.play().catch(function(error) {
            console.log('Autoplay prevented, music will play after user interaction');
        });
        
        // Start music on any user interaction
        function startMusic() {
            if (!musicStarted) {
                backgroundMusic.play().then(function() {
                    musicStarted = true;
                    console.log('Music started!');
                }).catch(function(error) {
                    console.log('Music play error:', error);
                });
            }
        }
        
        // Listen for any click or touch to start music
        document.addEventListener('click', startMusic, { once: true });
        document.addEventListener('touchstart', startMusic, { once: true });
        
        // Toggle mute/unmute
        musicToggle.addEventListener('click', function() {
            if (backgroundMusic.muted) {
                backgroundMusic.muted = false;
                musicIcon.textContent = '🔊';
            } else {
                backgroundMusic.muted = true;
                musicIcon.textContent = '🔇';
            }
        });
    }

    // Log ASCII art to console
    console.log(`
    ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
    ♥                         ♥
    ♥   HAPPY VALENTINE'S!    ♥
    ♥                         ♥
    ♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
    `);
});

// Add confetti animation keyframe
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        0% {
            top: -10%;
            transform: translateX(0) rotateZ(0deg);
        }
        100% {
            top: 110%;
            transform: translateX(${Math.random() > 0.5 ? '' : '-'}100px) rotateZ(${Math.random() * 720}deg);
        }
    }
`;
document.head.appendChild(style);
