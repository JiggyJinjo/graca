document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    initHearts();
    initNoteNavigation();
});

// Create and animate the floating hearts
function initHearts() {
    const heartsContainer = document.querySelector('.hearts-container');
    const colors = ['#ff6b6b', '#f9a1bc', '#ff3e78', '#ffb8b8', '#ffdbe0'];
    const heartCount = Math.min(window.innerWidth / 10, 40); // Responsive heart count
    
    // Create SVG hearts
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        
        // Using a heart SVG as background
        const color = colors[Math.floor(Math.random() * colors.length)];
        const svg = `
            <svg viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
        `;
        
        // Set heart as background with random size and position
        const size = Math.random() * 40 + 20;
        heart.style.width = `${size}px`;
        heart.style.height = `${size}px`;
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.top = `${Math.random() * 100}%`;
        heart.innerHTML = svg;
        
        // Apply initial animation delay
        heart.style.opacity = '0';
        
        heartsContainer.appendChild(heart);
        
        // Animate the heart
        animateHeart(heart);
    }
}

// Animate a heart element
function animateHeart(heart) {
    // Initial position and animation parameters
    const startDelay = Math.random() * 3; // Reduced delay
    const animDuration = Math.random() * 5 + 8; // 8-13 seconds (faster animation)
    
    // Use GSAP for smooth animations
    gsap.set(heart, { 
        opacity: 0,
        rotation: Math.random() * 30 - 15
    });
    
    // Animation timeline
    const tl = gsap.timeline({ repeat: -1 });
    
    tl.to(heart, {
        opacity: Math.random() * 0.5 + 0.4, // Slightly more visible
        duration: 1.5, // Faster fade in
        delay: startDelay
    })
    .to(heart, {
        rotation: `+=${Math.random() * 360}`,
        x: Math.random() * 120 - 60, // Wider movement range
        y: Math.random() * 120 - 60, // Wider movement range
        scale: Math.random() * 0.5 + 0.8,
        duration: animDuration,
        ease: "power1.inOut" // Different easing for smoother motion
    }, "<")
    .to(heart, {
        opacity: 0,
        duration: 1.5, // Faster fade out
        delay: animDuration - 1.5
    }, "<+=" + (animDuration - 1.5));
}

// Initialize note navigation functionality
function initNoteNavigation() {
    const notes = document.querySelectorAll('.note');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const currentPage = document.querySelector('.current');
    const totalPages = document.querySelector('.total');
    
    let currentIndex = 0;
    totalPages.textContent = notes.length;
    
    // Function to show a specific note
    function showNote(index) {
        // Hide all notes
        notes.forEach(note => {
            note.classList.remove('active');
            
            // Improved exit animation
            if (note.classList.contains('was-active')) {
                gsap.to(note, { 
                    opacity: 0, 
                    y: -30, 
                    scale: 0.9,
                    rotationY: -15, 
                    duration: 0.6,
                    ease: "power2.out"
                });
                note.classList.remove('was-active');
            } else {
                gsap.set(note, { opacity: 0, y: 30, scale: 0.9, rotationY: 15 });
            }
        });
        
        // Mark the current note as active
        notes[currentIndex].classList.add('was-active');
        
        // Show the current note with improved animation
        currentIndex = index;
        currentPage.textContent = currentIndex + 1;
        
        // Add a small delay to create a sequential feel
        setTimeout(() => {
            notes[currentIndex].classList.add('active');
            
            gsap.fromTo(notes[currentIndex], 
                { opacity: 0, y: 30, scale: 0.95, rotationY: 5 },
                { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    rotationY: 0, 
                    duration: 0.7,
                    ease: "power3.out"
                }
            );
        }, 150);
    }
    
    // Event listeners for navigation buttons
    prevBtn.addEventListener('click', () => {
        const newIndex = currentIndex === 0 ? notes.length - 1 : currentIndex - 1;
        showNote(newIndex);
    });
    
    nextBtn.addEventListener('click', () => {
        const newIndex = currentIndex === notes.length - 1 ? 0 : currentIndex + 1;
        showNote(newIndex);
    });
    
    // Handle touch events for swiping on mobile
    let touchStartX = 0;
    const noteWrapper = document.querySelector('.note-wrapper');
    
    noteWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    noteWrapper.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        
        // If swipe distance is significant
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                // Swipe right -> previous note
                prevBtn.click();
            } else {
                // Swipe left -> next note
                nextBtn.click();
            }
        }
    }, { passive: true });
    
    // Auto-rotate notes every 6 seconds if no interaction (faster rotation)
    let autoRotate = setInterval(() => {
        nextBtn.click();
    }, 6000);
    
    // Reset auto-rotation timer on any user interaction
    [prevBtn, nextBtn, noteWrapper].forEach(el => {
        el.addEventListener('click', resetAutoRotate);
        el.addEventListener('touchstart', resetAutoRotate, { passive: true });
    });
    
    function resetAutoRotate() {
        clearInterval(autoRotate);
        autoRotate = setInterval(() => {
            nextBtn.click();
        }, 6000);
    }
    
    // Show the first note initially
    showNote(0);
}

// Heartbeat pulse effect for heart elements (subtle background animation)
function pulseHearts() {
    const hearts = document.querySelectorAll('.heart');
    
    hearts.forEach(heart => {
        gsap.to(heart, {
            scale: 1.1,
            duration: 0.8,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });
    });
}
