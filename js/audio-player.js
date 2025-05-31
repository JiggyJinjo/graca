// Audio Player Controller for SoundCloud
// Handles starting music on user interaction due to autoplay restrictions

document.addEventListener('DOMContentLoaded', function() {
    let audioStarted = false;
    let widget = null;
    let widgetReady = false;
    
    // Initialize SoundCloud widget only after user interaction
    function initSoundCloudWidget() {
        const iframe = document.getElementById('soundcloud-player');
        if (iframe && window.SC) {
            try {
                widget = SC.Widget(iframe);
                
                // Wait for widget to be ready
                widget.bind(SC.Widget.Events.READY, function() {
                    widgetReady = true;
                    console.log('SoundCloud widget ready');
                    
                    // Try to play immediately if we're initializing after user interaction
                    if (audioStarted) {
                        startPlayback();
                    }
                });
                
                widget.bind(SC.Widget.Events.PLAY, function() {
                    console.log('Music started playing');
                });
                
                widget.bind(SC.Widget.Events.PAUSE, function() {
                    console.log('Music paused');
                });
                
                widget.bind(SC.Widget.Events.ERROR, function() {
                    console.log('SoundCloud widget error');
                });
                
                console.log('SoundCloud widget initialized');
            } catch (error) {
                console.log('Error initializing widget:', error);
                widgetReady = false;
            }
        }
    }
    
    // Function to start playback
    function startPlayback() {
        if (!widgetReady || !widget) {
            console.log('Widget not ready yet');
            return;
        }
        
        try {
            widget.play();
            widget.setVolume(50); // Set volume to 50%
            console.log('Playback started via Widget API');
        } catch (error) {
            console.log('Error starting playback:', error);
            // Fallback: reload iframe with autoplay
            fallbackStart();
        }
    }
    
    // Fallback method: reload iframe with autoplay
    function fallbackStart() {
        const iframe = document.getElementById('soundcloud-player');
        if (iframe) {
            const currentSrc = iframe.src;
            iframe.src = currentSrc.replace('auto_play=false', 'auto_play=true');
            console.log('Using fallback iframe reload method');
        }
    }
    
    // Function to handle user interaction
    function handleUserInteraction(e) {
        if (audioStarted) return;
        
        console.log('User interaction detected:', e.type);
        audioStarted = true;
        
        // Initialize widget after user interaction to comply with autoplay policy
        if (!widget) {
            initSoundCloudWidget();
        }
        
        // If widget is already ready, start playback immediately
        if (widgetReady) {
            startPlayback();
        }
        
        // Remove all event listeners after first successful interaction
        const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown', 'pointerdown'];
        interactionEvents.forEach(event => {
            document.removeEventListener(event, handleUserInteraction, true);
        });
    }
    
    // Wait for SoundCloud API to load, then set up interaction listeners
    function waitForSoundCloudAPI() {
        if (window.SC && window.SC.Widget) {
            // Don't initialize widget yet - wait for user interaction
            
            // Add event listeners for user interactions
            const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown', 'pointerdown'];
            interactionEvents.forEach(event => {
                document.addEventListener(event, handleUserInteraction, true);
            });
            
            console.log('Audio player ready - music will start on first user interaction');
        } else {
            // Retry in 100ms if SoundCloud API not ready
            setTimeout(waitForSoundCloudAPI, 100);
        }
    }
    
    // Start waiting for SoundCloud API
    waitForSoundCloudAPI();
});
