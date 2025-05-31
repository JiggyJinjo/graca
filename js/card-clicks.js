// Card click handler
document.addEventListener('DOMContentLoaded', function() {
    // Get all card elements
    const cards = document.querySelectorAll('.note');
    const cardContainer = document.querySelector('.card-container');
    const noteWrapper = document.querySelector('.note-wrapper');
    
    // Add this function to global scope for inline onclick handlers
    window.goToNextNote = function(e) {
        console.log('goToNextNote called', e);
        if (e) {
            e.stopPropagation(); // Prevent bubbling
        }
        goToNextCard();
    };
    
    // Function to find current index and navigate to next card
    function goToNextCard() {
        // Find active card index
        let currentIndex = 0;
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].classList.contains('active')) {
                currentIndex = i;
                break;
            }
        }
        
        // Calculate next index
        const nextIndex = (currentIndex + 1) % cards.length;
        
        // Try to find the existing showNote function in script.js
        const allFunctions = [];
        for (let prop in window) {
            if (typeof window[prop] === 'function') {
                allFunctions.push(prop);
            }
        }
        console.log('Available window functions:', allFunctions);
        
        // Manual navigation logic
        console.log('Current index:', currentIndex, 'Next index:', nextIndex);
        
        // Hide current card
        cards[currentIndex].classList.remove('active');
        
        // Show next card
        setTimeout(() => {
            cards[nextIndex].classList.add('active');
            console.log('Switched to card:', nextIndex);
            
            // Create particle effect on transition
            createSimpleParticleEffect();
        }, 100);
    }
    
    // Simple particle effect function
    function createSimpleParticleEffect() {
        const cardContainer = document.querySelector('.card-container');
        const rect = cardContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create particles
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.innerHTML = '❤️';
            
            document.body.appendChild(particle);
            
            // Set initial properties
            const size = Math.random() * 15 + 10;
            particle.style.position = 'fixed';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.fontSize = size + 'px';
            particle.style.zIndex = '1000';
            particle.style.opacity = '0';
            particle.style.pointerEvents = 'none';
            
            // Animate particle
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 100 + 50;
            
            // Simple animation with setTimeout
            particle.style.transition = 'all 0.5s ease-out';
            setTimeout(() => {
                particle.style.opacity = '1';
                particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
            }, 10);
            
            // Remove particle after animation
            setTimeout(() => {
                particle.style.opacity = '0';
                setTimeout(() => particle.remove(), 500);
            }, 600);
        }
    }
    
    // Add click handler to the entire card container
    cardContainer.addEventListener('click', function(e) {
        console.log('Card container clicked');
        goToNextCard();
    });
    
    // Also add click handlers to each card directly
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            console.log('Card clicked directly');
            e.stopPropagation(); // Prevent bubbling
            goToNextCard();
        });
    });
    
    console.log('Card click handlers installed successfully');
});
