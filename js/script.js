document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    initHearts();
    initNoteNavigation();
    
    // URGENT FIX: Add a global click handler that works regardless of propagation
    document.body.addEventListener('click', function(e) {
        console.log('Global click detected', e.target);
        
        // Find the active note and proceed to the next one
        const activeNote = document.querySelector('.note.active');
        if (activeNote) {
            console.log('Found active note:', activeNote.id);
            
            // Get all notes and find the current index
            const allNotes = document.querySelectorAll('.note');
            let currentIdx = 0;
            
            for (let i = 0; i < allNotes.length; i++) {
                if (allNotes[i].classList.contains('active')) {
                    currentIdx = i;
                    break;
                }
            }
            
            // Calculate new index
            const newIdx = (currentIdx + 1) % allNotes.length;
            
            // Call showNote if it exists in the global scope
            if (typeof window.showNoteFunction === 'function') {
                window.showNoteFunction(newIdx);
            }
        }
    });
});

// Helper function to debug click events - uncomment in DOMContentLoaded if needed
function debugClickEvents() {
    document.addEventListener('click', (e) => {
        console.log('Click target:', e.target);
        console.log('Click currentTarget:', e.currentTarget);
        
        // Check if click is on or within a note
        const note = e.target.closest('.note');
        if (note) {
            console.log('Note clicked:', note.id);
            if (note.classList.contains('active')) {
                console.log('Active note clicked!');
            } else {
                console.log('Non-active note clicked');
            }
        } else {
            console.log('Click not on a note');
        }
    });
}

// Create and animate the floating hearts
function initHearts() {
    const heartsContainer = document.querySelector('.hearts-container');
    const colors = ['#ff6b6b', '#f9a1bc', '#ff3e78', '#ffb8b8', '#ffdbe0', '#ff97b7', '#ff4d94'];
    const heartCount = Math.min(window.innerWidth / 8, 60); // More hearts for a denser effect
    
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
        const size = Math.random() * 60 + 15; // Wider range of sizes for more variety
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
    
    // Add a subtle glow effect to the background
    const glowEffect = document.createElement('div');
    glowEffect.className = 'background-glow';
    document.querySelector('.container').appendChild(glowEffect);
}

// Animate a heart element
function animateHeart(heart) {
    // Initial position and animation parameters
    const startDelay = Math.random() * 2; // Even shorter delay for faster startup
    const animDuration = Math.random() * 4 + 6; // 6-10 seconds for faster movement
    
    // Use GSAP for smooth animations
    gsap.set(heart, { 
        opacity: 0,
        rotation: Math.random() * 30 - 15,
        scale: 0
    });
    
    // Add a special reveal animation for a percentage of hearts
    const hasSpecialEffect = Math.random() > 0.7;
    
    // Animation timeline
    const tl = gsap.timeline({ repeat: -1 });
    
    // Initial reveal animation
    if (hasSpecialEffect) {
        tl.to(heart, {
            opacity: Math.random() * 0.4 + 0.6, // More visible
            scale: 1.2,
            duration: 0.7,
            delay: startDelay,
            ease: "back.out(1.7)" // Elastic bouncy effect
        })
        .to(heart, {
            scale: 0.9,
            duration: 0.3,
            ease: "power1.out"
        });
    } else {
        tl.to(heart, {
            opacity: Math.random() * 0.4 + 0.5, // More visible
            scale: 1,
            duration: 0.7,
            delay: startDelay,
            ease: "power2.out"
        });
    }
    
    // Movement animation with more dramatic paths
    tl.to(heart, {
        rotation: `+=${Math.random() * 360 - 180}`,
        x: Math.random() * 150 - 75, // Even wider movement range
        y: Math.random() * 150 - 75, // Even wider movement range
        scale: Math.random() * 0.5 + 0.8,
        duration: animDuration,
        ease: "sine.inOut"
    }, "<+=0.2")
    
    // Add small "pulse" effect during the movement for some hearts
    if (Math.random() > 0.6) {
        tl.to(heart, {
            scale: "+=0.3",
            duration: 0.5,
            yoyo: true,
            repeat: 1,
            ease: "sine.inOut"
        }, "<+=" + (Math.random() * 2));
    }
    
    // Fade out
    tl.to(heart, {
        opacity: 0,
        scale: Math.random() > 0.7 ? 1.5 : 0.5, // Some grow, some shrink
        duration: 0.8,
        delay: animDuration - 0.8,
        ease: "power1.in"
    }, "<+=" + (animDuration - 0.8));
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
    
    // Get the note wrapper for click events
    const noteWrapper = document.querySelector('.note-wrapper');
    
    // Function to show a specific note
    function showNote(index) {
        console.log('Showing note index:', index);
        
        // Hide all notes
        notes.forEach(note => {
            note.classList.remove('active');                // Create more dramatic exit animation
                if (note.classList.contains('was-active')) {
                    // Get text elements to keep them visible during transition
                    const title = note.querySelector('h2');
                    const paragraph = note.querySelector('p');
                    
                    // Keep text fully visible during card exit
                    gsap.set([title, paragraph], { opacity: 1 });
                    
                    // Animate the card out
                    gsap.to(note, { 
                        opacity: 0, 
                        y: -50, 
                        scale: 0.8,
                        rotationY: -25, 
                        duration: 0.7,
                        ease: "back.in(1.2)",
                        filter: "blur(5px)"
                    });
                    note.classList.remove('was-active');
                
                // Add particles burst effect on exit
                if (window.innerWidth > 480) {  // Only on larger screens
                    createParticlesBurst(note);
                }
            } else {
                gsap.set(note, { opacity: 0, y: 50, scale: 0.8, rotationY: 25, filter: "blur(5px)" });
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
            
            // Pre-show the text content before animating the card
            const title = notes[currentIndex].querySelector('h2');
            const paragraph = notes[currentIndex].querySelector('p');
            
            // Set text to fully visible immediately to prevent flicker
            gsap.set([title, paragraph], { opacity: 1, y: 0, scale: 1 });
            
            // Prepare the card with content already visible
            gsap.set(notes[currentIndex], { 
                transformOrigin: "center center",
                perspective: 1000,
                transformStyle: "preserve-3d"
            });
            
            // Create more dramatic entrance animation for the card
            gsap.fromTo(notes[currentIndex], 
                { opacity: 0, y: 60, scale: 0.85, rotationY: 15, filter: "blur(8px)" },
                { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    rotationY: 0, 
                    filter: "blur(0px)",
                    duration: 0.8,
                    ease: "elastic.out(1, 0.75)",
                    onStart: () => {
                        // Start the bounce effect sooner, during the main animation
                        gsap.to(notes[currentIndex], {
                            y: -10,
                            duration: 0.3,
                            yoyo: true,
                            repeat: 1,
                            ease: "sine.inOut",
                            delay: 0.3 // Reduced delay to start animation sooner
                        });
                    },
                    onComplete: () => {
                        // Subtle text animation after the card is fully visible
                        // Just a gentle emphasis without hiding the text
                        const title = notes[currentIndex].querySelector('h2');
                        const paragraph = notes[currentIndex].querySelector('p');
                        
                        gsap.fromTo(title, 
                            { scale: 0.98 },
                            { scale: 1, duration: 0.4, ease: "back.out(1.5)" }
                        );
                        
                        gsap.fromTo(paragraph, 
                            { scale: 0.98 },
                            { scale: 1, duration: 0.4, delay: 0.1, ease: "back.out(1.2)" }
                        );
                    }
                }
            );
        }, 200);
    }
    
    // Function to create particle burst effect
    function createParticlesBurst(note) {
        const rect = note.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create particles
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random heart or star
            const isHeart = Math.random() > 0.5;
            particle.innerHTML = isHeart ? '❤️' : '✨';
            
            // Set initial position at the center of the note
            document.body.appendChild(particle);
            
            // Random position and size
            const size = Math.random() * 15 + 10;
            particle.style.position = 'fixed';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.fontSize = size + 'px';
            particle.style.zIndex = '100';
            particle.style.opacity = '0';
            particle.style.pointerEvents = 'none';
            
            // Animate particle
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 100 + 50;
            const duration = Math.random() * 0.8 + 0.6;
            
            gsap.to(particle, {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                opacity: Math.random() * 0.7 + 0.3,
                duration: duration / 2,
                ease: "power2.out",
                onComplete: () => {
                    gsap.to(particle, {
                        opacity: 0,
                        duration: duration / 2,
                        delay: 0.1,
                        onComplete: () => {
                            particle.remove();
                        }
                    });
                }
            });
        }
    }
    
    // Let's completely rewrite the click handling
    // Use event delegation on the document level for better click capturing
    document.addEventListener('click', (e) => {
        console.log('Click detected on:', e.target);
        
        // Check if the click is within the card container
        const cardContainer = document.querySelector('.card-container');
        if (cardContainer.contains(e.target)) {
            console.log('Click within card container detected');
            // Go to next note
            const newIndex = currentIndex === notes.length - 1 ? 0 : currentIndex + 1;
            showNote(newIndex);
        }
    });
    
    // Debugging - log when a note becomes active
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const element = mutation.target;
                if (element.classList.contains('active')) {
                    console.log('Note became active:', element.id);
                    console.log('Is pointer-events set correctly:', getComputedStyle(element).pointerEvents);
                }
            }
        });
    });
    
    // Observe all notes
    notes.forEach(note => {
        observer.observe(note, { attributes: true });
        console.log('Initial note status:', note.id, note.classList.contains('active'));
    });
    
    // Handle touch events for swiping on mobile
    let touchStartX = 0;
    
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
                const newIndex = currentIndex === 0 ? notes.length - 1 : currentIndex - 1;
                showNote(newIndex);
            } else {
                // Swipe left -> next note
                const newIndex = currentIndex === notes.length - 1 ? 0 : currentIndex + 1;
                showNote(newIndex);
            }
        }
    }, { passive: true });
    
    // Auto-rotate notes every 6 seconds if no interaction (faster rotation)
    let autoRotate = setInterval(() => {
        const newIndex = currentIndex === notes.length - 1 ? 0 : currentIndex + 1;
        showNote(newIndex);
    }, 6000);
    
    // Reset auto-rotation timer on any user interaction
    noteWrapper.addEventListener('click', resetAutoRotate);
    noteWrapper.addEventListener('touchstart', resetAutoRotate, { passive: true });
    
    function resetAutoRotate() {
        clearInterval(autoRotate);
        autoRotate = setInterval(() => {
            const newIndex = currentIndex === notes.length - 1 ? 0 : currentIndex + 1;
            showNote(newIndex);
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
