document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const startButton = document.getElementById('start-meditation');
    const pauseButton = document.getElementById('pause-meditation');
    const resetButton = document.getElementById('reset-meditation');
    const breathingCircle = document.getElementById('breathing-circle');
    const phaseText = document.getElementById('phase-text');
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const soundToggle = document.getElementById('sound-toggle');
    const backgroundSoundSelect = document.getElementById('background-sound');
    const completedSessionsDisplay = document.getElementById('completed-sessions');
    const totalTimeDisplay = document.getElementById('total-meditation-time');
    
    // Audio Elements
    const dingSound = document.getElementById('ding-sound');
    const natureSounds = document.getElementById('nature-sound');
    const rainSounds = document.getElementById('rain-sound');
    const oceanSounds = document.getElementById('ocean-sound');
    
    // State variables
    let isRunning = false;
    let currentPhase = 'ready'; // ready, inhale, hold, exhale, wait
    let phaseTimer = null;
    let sessionTimer = null;
    let sessionSeconds = 0;
    let completedCycles = 0;
    let completedSessions = parseInt(localStorage.getItem('mindmate-meditation-sessions') || '0');
    let totalMeditationTime = parseInt(localStorage.getItem('mindmate-meditation-time') || '0');
    
    // Phase durations in seconds
    const phaseDuration = {
        inhale: 4,
        hold: 4,
        exhale: 4,
        wait: 4
    };
    
    // Initialize displays
    updateSessionDisplay();
    completedSessionsDisplay.textContent = completedSessions;
    formatTimeDisplay(totalMeditationTime, totalTimeDisplay);
    
    // Event listeners
    startButton.addEventListener('click', startMeditation);
    pauseButton.addEventListener('click', pauseMeditation);
    resetButton.addEventListener('click', resetMeditation);
    soundToggle.addEventListener('change', toggleSounds);
    backgroundSoundSelect.addEventListener('change', changeBackgroundSound);
    
    // Load saved preferences
    loadPreferences();
    
    // Start meditation
    function startMeditation() {
        if (isRunning) return;
        
        isRunning = true;
        startButton.disabled = true;
        pauseButton.disabled = false;
        
        // Start session timer
        sessionTimer = setInterval(updateSessionTime, 1000);
        
        // Start breathing cycle
        startBreathingCycle();
        
        // Play background sound if selected
        playSelectedBackgroundSound();
    }
    
    // Pause meditation
    function pauseMeditation() {
        isRunning = false;
        startButton.disabled = false;
        pauseButton.disabled = true;
        
        // Pause timers
        clearInterval(phaseTimer);
        clearInterval(sessionTimer);
        
        // Pause background sounds
        pauseAllBackgroundSounds();
    }
    
    // Reset meditation
    function resetMeditation() {
        pauseMeditation();
        
        // Reset state
        currentPhase = 'ready';
        sessionSeconds = 0;
        completedCycles = 0;
        
        // Reset displays
        phaseText.textContent = 'Hazır';
        phaseText.className = 'phase-text';
        breathingCircle.className = 'breathing-circle';
        minutesDisplay.textContent = '00';
        secondsDisplay.textContent = '00';
    }
    
    // Start breathing cycle
    function startBreathingCycle() {
        // Set initial phase to inhale
        changePhase('inhale');
        
        // Schedule the phases in sequence
        let currentTime = 0;
        
        phaseTimer = setInterval(() => {
            currentTime++;
            
            // Change phase based on elapsed time
            if (currentPhase === 'inhale' && currentTime >= phaseDuration.inhale) {
                changePhase('hold');
                currentTime = 0;
            } 
            else if (currentPhase === 'hold' && currentTime >= phaseDuration.hold) {
                changePhase('exhale');
                currentTime = 0;
            }
            else if (currentPhase === 'exhale' && currentTime >= phaseDuration.exhale) {
                changePhase('wait');
                currentTime = 0;
            }
            else if (currentPhase === 'wait' && currentTime >= phaseDuration.wait) {
                changePhase('inhale');
                currentTime = 0;
                completedCycles++;
                
                // Play ding sound at the end of cycle if enabled
                if (soundToggle.checked) {
                    playDingSound();
                }
            }
        }, 1000);
    }
    
    // Change breathing phase
    function changePhase(phase) {
        currentPhase = phase;
        
        // Update text and circle appearance
        phaseText.className = 'phase-text ' + phase;
        breathingCircle.className = 'breathing-circle ' + phase;
        
        // Set instructional text
        switch (phase) {
            case 'inhale':
                phaseText.textContent = 'Nefes Al';
                break;
            case 'hold':
                phaseText.textContent = 'Nefesi Tut';
                break;
            case 'exhale':
                phaseText.textContent = 'Nefes Ver';
                break;
            case 'wait':
                phaseText.textContent = 'Bekle';
                break;
            default:
                phaseText.textContent = 'Hazır';
        }
    }
    
    // Update session timer
    function updateSessionTime() {
        sessionSeconds++;
        const minutes = Math.floor(sessionSeconds / 60);
        const seconds = sessionSeconds % 60;
        
        minutesDisplay.textContent = minutes < 10 ? `0${minutes}` : minutes;
        secondsDisplay.textContent = seconds < 10 ? `0${seconds}` : seconds;
    }
    
    // Play ding sound
    function playDingSound() {
        if (dingSound) {
            dingSound.currentTime = 0;
            dingSound.play().catch(error => {
                console.log('Ses çalma hatası:', error);
            });
        }
    }
    
    // Toggle sound effects
    function toggleSounds() {
        if (!soundToggle.checked) {
            pauseAllBackgroundSounds();
            backgroundSoundSelect.value = 'none';
        } else if (isRunning && backgroundSoundSelect.value !== 'none') {
            playSelectedBackgroundSound();
        }
        
        // Save preference
        savePreferences();
    }
    
    // Change background sound
    function changeBackgroundSound() {
        pauseAllBackgroundSounds();
        
        if (isRunning && soundToggle.checked && backgroundSoundSelect.value !== 'none') {
            playSelectedBackgroundSound();
        }
        
        // Save preference
        savePreferences();
    }
    
    // Play selected background sound
    function playSelectedBackgroundSound() {
        if (!soundToggle.checked || backgroundSoundSelect.value === 'none') return;
        
        switch (backgroundSoundSelect.value) {
            case 'nature':
                natureSounds.play().catch(error => console.log('Ses çalma hatası:', error));
                break;
            case 'rain':
                rainSounds.play().catch(error => console.log('Ses çalma hatası:', error));
                break;
            case 'ocean':
                oceanSounds.play().catch(error => console.log('Ses çalma hatası:', error));
                break;
        }
    }
    
    // Pause all background sounds
    function pauseAllBackgroundSounds() {
        natureSounds.pause();
        rainSounds.pause();
        oceanSounds.pause();
    }
    
    // Save user preferences
    function savePreferences() {
        localStorage.setItem('mindmate-meditation-sound', soundToggle.checked);
        localStorage.setItem('mindmate-meditation-background', backgroundSoundSelect.value);
    }
    
    // Load user preferences
    function loadPreferences() {
        const soundEnabled = localStorage.getItem('mindmate-meditation-sound');
        const backgroundSound = localStorage.getItem('mindmate-meditation-background');
        
        if (soundEnabled !== null) {
            soundToggle.checked = soundEnabled === 'true';
        }
        
        if (backgroundSound) {
            backgroundSoundSelect.value = backgroundSound;
        }
    }
    
    // Update session statistics
    function updateSessionDisplay() {
        completedSessionsDisplay.textContent = completedSessions;
        formatTimeDisplay(totalMeditationTime, totalTimeDisplay);
    }
    
    // Format time for display (converts seconds to MM:SS)
    function formatTimeDisplay(totalSeconds, displayElement) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        displayElement.textContent = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }
    
    // Save session data when finished
    function saveSessionData() {
        if (sessionSeconds > 10) { // Only count sessions longer than 10 seconds
            completedSessions++;
            totalMeditationTime += sessionSeconds;
            
            localStorage.setItem('mindmate-meditation-sessions', completedSessions);
            localStorage.setItem('mindmate-meditation-time', totalMeditationTime);
            
            updateSessionDisplay();
        }
    }
    
    // Handle page unload - save session data
    window.addEventListener('beforeunload', function() {
        if (isRunning) {
            saveSessionData();
            pauseAllBackgroundSounds();
        }
    });
    
    // Additional event for reset button to save session data
    resetButton.addEventListener('click', function() {
        if (isRunning) {
            saveSessionData();
        }
    });
});
