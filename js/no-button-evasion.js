/* ===================================
   NO BUTTON EVASION LOGIC
   The "No" button INSTANTLY teleports away from cursor!
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    const noButton = document.getElementById('no-btn');
    
    if (!noButton) {
        console.error('NO button not found!');
        return;
    }
    
    console.log('NO button found:', noButton);

    // Configuration
    const DETECTION_RADIUS = 100; // Distance to trigger teleport
    const MIN_SAFE_DISTANCE = 250; // Minimum distance from cursor after teleport
    const EDGE_PADDING = 50; // Padding from viewport edges
    
    let buttonInitialized = false;
    let lastTeleport = 0;
    let hasBeenHoveredOnce = false; // Track if button has been hovered for the first time
    const TELEPORT_COOLDOWN = 50; // 50ms cooldown between teleports

    // Track mouse position
    let mouseX = 0;
    let mouseY = 0;

    // Update mouse position
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        checkAndTeleport();
    });

    document.addEventListener('touchmove', function(e) {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
            checkAndTeleport();
        }
    }, { passive: true });

    // Initialize button positioning
    function initButton() {
        if (buttonInitialized) return;
        
        const rect = noButton.getBoundingClientRect();
        const buttonContainer = noButton.parentElement;
        
        if (!buttonContainer || rect.width === 0) return;
        
        // Create invisible placeholder to keep YES button in place
        const placeholder = document.createElement('div');
        placeholder.style.width = rect.width + 'px';
        placeholder.style.height = rect.height + 'px';
        placeholder.style.visibility = 'hidden';
        placeholder.className = 'no-btn-placeholder';
        
        noButton.parentNode.insertBefore(placeholder, noButton);
        
        // Convert to absolute positioning
        noButton.style.position = 'fixed'; // Use fixed to position relative to viewport
        noButton.style.left = rect.left + 'px';
        noButton.style.top = rect.top + 'px';
        noButton.style.margin = '0';
        noButton.style.transition = 'none'; // NO TRANSITION = INSTANT TELEPORT
        
        buttonInitialized = true;
        console.log('NO button initialized at:', noButton.style.left, noButton.style.top);
    }

    // Check proximity and teleport if needed
    function checkAndTeleport() {
        // Don't initialize until first hover
        if (!hasBeenHoveredOnce) {
            // Check if cursor is near the button for the first time
            const rect = noButton.getBoundingClientRect();
            
            if (rect.width === 0 || rect.height === 0) return;
            
            const buttonCenterX = rect.left + rect.width / 2;
            const buttonCenterY = rect.top + rect.height / 2;

            // Calculate distance from cursor to button
            const dx = mouseX - buttonCenterX;
            const dy = mouseY - buttonCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If cursor is close for the first time, initialize and teleport!
            if (distance < DETECTION_RADIUS) {
                console.log('First hover detected! Initializing button...');
                hasBeenHoveredOnce = true;
                initButton();
                teleportAway();
                lastTeleport = Date.now();
            }
            return; // Don't proceed until first hover
        }
        
        // After first hover, normal behavior
        if (!buttonInitialized) return;

        const rect = noButton.getBoundingClientRect();
        
        if (rect.width === 0 || rect.height === 0) return;
        
        const buttonCenterX = rect.left + rect.width / 2;
        const buttonCenterY = rect.top + rect.height / 2;

        // Calculate distance from cursor to button
        const dx = mouseX - buttonCenterX;
        const dy = mouseY - buttonCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If cursor is too close, TELEPORT!
        const now = Date.now();
        if (distance < DETECTION_RADIUS) {
            if (now - lastTeleport > TELEPORT_COOLDOWN) {
                teleportAway();
                lastTeleport = now;
            }
        }
    }

    // Teleport button to a random safe location
    function teleportAway() {
        const rect = noButton.getBoundingClientRect();
        const buttonWidth = rect.width;
        const buttonHeight = rect.height;

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate safe bounds
        const minX = EDGE_PADDING;
        const minY = EDGE_PADDING;
        const maxX = viewportWidth - buttonWidth - EDGE_PADDING;
        const maxY = viewportHeight - buttonHeight - EDGE_PADDING;

        let newX, newY, attempts = 0;
        const maxAttempts = 20;

        // Find a position far enough from cursor
        do {
            newX = minX + Math.random() * (maxX - minX);
            newY = minY + Math.random() * (maxY - minY);
            
            // Calculate distance from cursor to new position center
            const newCenterX = newX + buttonWidth / 2;
            const newCenterY = newY + buttonHeight / 2;
            const distanceFromCursor = Math.sqrt(
                Math.pow(mouseX - newCenterX, 2) + 
                Math.pow(mouseY - newCenterY, 2)
            );

            // Accept if far enough from cursor
            if (distanceFromCursor > MIN_SAFE_DISTANCE || attempts >= maxAttempts) {
                break;
            }
            
            attempts++;
        } while (attempts < maxAttempts);

        // INSTANT teleport (no transition)
        noButton.style.left = newX + 'px';
        noButton.style.top = newY + 'px';

        console.log('Teleported to:', newX, newY, 'Distance from cursor:', 
            Math.sqrt(Math.pow(mouseX - (newX + buttonWidth / 2), 2) + 
                     Math.pow(mouseY - (newY + buttonHeight / 2), 2)));
    }

    // Prevent any clicks
    noButton.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!hasBeenHoveredOnce) {
            hasBeenHoveredOnce = true;
            initButton();
        }
        teleportAway();
        return false;
    });

    noButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!hasBeenHoveredOnce) {
            hasBeenHoveredOnce = true;
            initButton();
        }
        teleportAway();
        return false;
    });

    noButton.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (!hasBeenHoveredOnce) {
            hasBeenHoveredOnce = true;
            initButton();
        }
        teleportAway();
        return false;
    }, { passive: false });

    // Re-initialize when screen changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const screen = noButton.closest('.screen');
                if (screen && screen.classList.contains('active')) {
                    // Screen became active - reset button state
                    buttonInitialized = false;
                    hasBeenHoveredOnce = false;
                    
                    // Reset button to original position
                    noButton.style.position = '';
                    noButton.style.left = '';
                    noButton.style.top = '';
                    noButton.style.margin = '';
                    
                    // Remove placeholder if exists
                    const placeholder = noButton.parentNode.querySelector('.no-btn-placeholder');
                    if (placeholder) {
                        placeholder.remove();
                    }
                    
                    console.log('Question screen activated - button will teleport on first hover!');
                }
            }
        });
    });

    const screen = noButton.closest('.screen');
    if (screen) {
        observer.observe(screen, { attributes: true });
    }

    console.log('NO button ready - will activate on first hover!');

    // Handle window resize
    window.addEventListener('resize', function() {
        if (!buttonInitialized) return;

        const rect = noButton.getBoundingClientRect();
        const buttonWidth = rect.width;
        const buttonHeight = rect.height;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let currentLeft = parseFloat(noButton.style.left);
        let currentTop = parseFloat(noButton.style.top);

        // Check if button is outside viewport after resize
        if (currentLeft + buttonWidth > viewportWidth - EDGE_PADDING) {
            currentLeft = viewportWidth - buttonWidth - EDGE_PADDING;
        }
        if (currentTop + buttonHeight > viewportHeight - EDGE_PADDING) {
            currentTop = viewportHeight - buttonHeight - EDGE_PADDING;
        }
        if (currentLeft < EDGE_PADDING) {
            currentLeft = EDGE_PADDING;
        }
        if (currentTop < EDGE_PADDING) {
            currentTop = EDGE_PADDING;
        }

        noButton.style.left = currentLeft + 'px';
        noButton.style.top = currentTop + 'px';
    });
});
