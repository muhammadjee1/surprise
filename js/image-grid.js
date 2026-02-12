/* ===================================
   IMAGE GRID SELECTION LOGIC
   Real reCAPTCHA validation with correct/wrong images
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    const imageGrid = document.getElementById('image-grid');
    const verifyBtn = document.getElementById('verify-btn');
    
    if (!imageGrid || !verifyBtn) return;

    // Define image sets
    const correctImages = [
        'assets/grid/correct1.jpg',
        'assets/grid/correct2.jpg',
        'assets/grid/correct3.jpg',
        'assets/grid/correct4.jpg',
        'assets/grid/correct5.jpg',
        'assets/grid/correct6.jpg'
    ];

    const wrongImages = [
        'assets/grid/wrong1.jpg',
        'assets/grid/wrong2.jpg',
        'assets/grid/wrong3.jpg'
    ];

    // Combine and shuffle all images
    const allImages = [...correctImages, ...wrongImages];
    const shuffledImages = shuffleArray(allImages);

    // Populate grid with shuffled images
    populateGrid(shuffledImages);

    let selectedCount = 0;
    const gridItems = imageGrid.querySelectorAll('.grid-item');

    // Add click handlers to all grid items
    gridItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            toggleSelection(item);
        });

        // Add stagger animation class
        item.classList.add('stagger-item');
    });

    // Shuffle array using Fisher-Yates algorithm
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Populate grid with images
    function populateGrid(images) {
        imageGrid.innerHTML = '';
        
        images.forEach((imageSrc, index) => {
            const isCorrect = correctImages.includes(imageSrc);
            
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.setAttribute('data-index', index);
            gridItem.setAttribute('data-correct', isCorrect ? 'true' : 'false');
            gridItem.setAttribute('data-src', imageSrc);
            
            gridItem.innerHTML = `
                <img src="${imageSrc}" alt="Image ${index + 1}" onerror="this.src='https://via.placeholder.com/150/FFB6C1/ffffff?text=💕'">
                <div class="checkmark-overlay">✓</div>
            `;
            
            imageGrid.appendChild(gridItem);
        });
    }

    // Toggle selection state
    function toggleSelection(item) {
        const isSelected = item.classList.contains('selected');
        
        if (isSelected) {
            item.classList.remove('selected');
            selectedCount--;
        } else {
            item.classList.add('selected');
            selectedCount++;
            
            // Add a little pop animation
            item.style.animation = 'popIn 0.3s ease-out';
            setTimeout(() => {
                item.style.animation = '';
            }, 300);
        }

        // Update verify button state
        updateVerifyButton();
    }

    // Update verify button enabled/disabled state
    function updateVerifyButton() {
        if (selectedCount > 0) {
            verifyBtn.disabled = false;
            verifyBtn.classList.add('animate-pulse');
        } else {
            verifyBtn.disabled = true;
            verifyBtn.classList.remove('animate-pulse');
        }
    }

    // Handle verify button click
    verifyBtn.addEventListener('click', function() {
        if (selectedCount === 0) {
            showMessage('Please select at least one image!', 'error');
            return;
        }

        // Validate selections
        const selectedItems = Array.from(gridItems).filter(item => 
            item.classList.contains('selected')
        );

        const correctSelections = selectedItems.filter(item => 
            item.getAttribute('data-correct') === 'true'
        );

        const wrongSelections = selectedItems.filter(item => 
            item.getAttribute('data-correct') === 'false'
        );

        const totalCorrectImages = Array.from(gridItems).filter(item => 
            item.getAttribute('data-correct') === 'true'
        ).length;

        // Check if user selected any wrong images
        if (wrongSelections.length > 0) {
            showMessage('Oops! That\'s not your valentine! Try again 💔', 'error');
            
            // Highlight wrong selections
            wrongSelections.forEach(item => {
                item.style.border = '4px solid #ff0000';
                setTimeout(() => {
                    item.style.border = '';
                    item.classList.remove('selected');
                }, 1500);
            });
            
            selectedCount -= wrongSelections.length;
            updateVerifyButton();
            return;
        }

        // Check if user missed any correct images
        if (correctSelections.length < totalCorrectImages) {
            const missed = totalCorrectImages - correctSelections.length;
            showMessage(`You missed ${missed} image${missed > 1 ? 's' : ''}! Select ALL images with your valentine 💕`, 'error');
            return;
        }

        // SUCCESS! All correct images selected, no wrong ones
        verifyBtn.textContent = 'Verifying...';
        verifyBtn.disabled = true;
        verifyBtn.classList.add('animate-pulse');

        // Simulate verification delay
        setTimeout(() => {
            verifyBtn.textContent = 'Success! ✓';
            verifyBtn.style.background = '#32cd32';
            
            // Add success animation to all correct selections
            selectedItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.animation = 'heartbeat 0.5s ease-out';
                }, index * 100);
            });
            
            // Transition to success screen after a brief pause
            setTimeout(() => {
                const event = new CustomEvent('gridVerified');
                document.dispatchEvent(event);
            }, 1500);
        }, 1000);
    });

    // Show feedback message
    function showMessage(text, type) {
        const message = document.createElement('div');
        message.className = 'grid-message ' + type;
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#ff4444' : '#32cd32'};
            color: white;
            padding: 15px 30px;
            border: 3px solid #000;
            font-family: 'Press Start 2P', cursive;
            font-size: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 4px 4px 0 #000;
            max-width: 90%;
            text-align: center;
            line-height: 1.6;
        `;

        document.body.appendChild(message);

        setTimeout(() => {
            message.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(message);
            }, 300);
        }, 3000);
    }

    // Grid controls functionality
    const refreshBtn = imageGrid.parentElement.querySelector('.icon-btn[title="Refresh"]');
    const audioBtn = imageGrid.parentElement.querySelector('.icon-btn[title="Audio"]');
    const infoBtn = imageGrid.parentElement.querySelector('.icon-btn[title="Info"]');

    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            // Clear all selections
            gridItems.forEach(item => {
                item.classList.remove('selected');
            });
            selectedCount = 0;
            updateVerifyButton();
            
            // Reshuffle and repopulate grid
            const reshuffled = shuffleArray(allImages);
            populateGrid(reshuffled);
            
            // Re-attach event listeners
            const newGridItems = imageGrid.querySelectorAll('.grid-item');
            newGridItems.forEach((item, index) => {
                item.addEventListener('click', function() {
                    toggleSelection(item);
                });
                item.classList.add('stagger-item');
            });
            
            // Add refresh animation
            imageGrid.style.animation = 'spin 0.5s ease-out';
            setTimeout(() => {
                imageGrid.style.animation = '';
            }, 500);
        });
    }

    if (audioBtn) {
        audioBtn.addEventListener('click', function() {
            showMessage('Audio challenge not available 🎧', 'error');
        });
    }

    if (infoBtn) {
        infoBtn.addEventListener('click', function() {
            showMessage('Select ALL images with your valentine! 💕', 'info');
        });
    }
});
