document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Box Menu
    const breathingMeditationBox = document.getElementById('breathing-meditation-box');
    const breathingMeditationContent = document.getElementById('breathing-meditation-content');
    const guidedMeditationBox = document.getElementById('guided-meditation-box');
    const guidedMeditationContent = document.getElementById('guided-meditation-content');
    const pauseMeditationBox = document.getElementById('pause-meditation-box');
    const pauseOverlay = document.getElementById('pause-overlay');
    const backToMenuBreathing = document.getElementById('back-to-menu-breathing');
    const backToMenuGuided = document.getElementById('back-to-menu-guided');
    
    // Mantra Meditation DOM Elements
    const mantraMeditationBox = document.getElementById('mantra-meditation-box');
    const mantraMeditationContent = document.getElementById('mantra-meditation-content');
    const backToMenuMantra = document.getElementById('back-to-menu-mantra');
    const mantraText = document.getElementById('mantra-text');
    const mantraAuthor = document.getElementById('mantra-author');
    const newMantraBtn = document.getElementById('new-mantra-btn');
    const customMantraInput = document.getElementById('custom-mantra');
    const mantraAuthorInput = document.getElementById('mantra-author-input');
    const saveMantraBtn = document.getElementById('save-mantra-btn');
    const mantrasList = document.getElementById('mantras-list');
    
    // DOM Elements - Breathing Meditation
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
    
    // DOM Elements - Guided Meditation
    const startGuided = document.getElementById('start-guided');
    const pauseGuided = document.getElementById('pause-guided');
    const resetGuided = document.getElementById('reset-guided');
    const guidedText = document.getElementById('guided-text');
    const guidedMinutesDisplay = document.getElementById('guided-minutes');
    const guidedSecondsDisplay = document.getElementById('guided-seconds');
    const voiceToggle = document.getElementById('voice-toggle');
    const guidedBackgroundSound = document.getElementById('guided-background-sound');
    const textSpeed = document.getElementById('text-speed');
    const guidedDuration = document.getElementById('guided-duration');
    
    // DOM Elements - The Pause
    const pauseSecondsDisplay = document.getElementById('pause-seconds');
    const pausePathRemaining = document.getElementById('pause-path-remaining');
    const pauseMessage = document.getElementById('pause-message');
    
    // Audio Elements
    const dingSound = document.getElementById('ding-sound');
    const bellSound = document.getElementById('bell-sound');
    const natureSounds = document.getElementById('nature-sound');
    const rainSounds = document.getElementById('rain-sound');
    const oceanSounds = document.getElementById('ocean-sound');
    const lofiSound = document.getElementById('lofi-sound');
    
    // State variables - Breathing Meditation
    let isRunning = false;
    let currentPhase = 'ready'; // ready, inhale, hold, exhale, wait
    let phaseTimer = null;
    let sessionTimer = null;
    let sessionSeconds = 0;
    let completedCycles = 0;
    let completedSessions = parseInt(localStorage.getItem('mindmate-meditation-sessions') || '0');
    let totalMeditationTime = parseInt(localStorage.getItem('mindmate-meditation-time') || '0');
    
    // State variables - Guided Meditation
    let isGuidedRunning = false;
    let guidedTimer = null;
    let guidedSessionTimer = null;
    let guidedSessionSeconds = 0;
    let currentGuidedIndex = 0;
    let speechSynthesis = window.speechSynthesis;
    let speechUtterance = null;
    
    // State variables - The Pause
    let isPauseRunning = false;
    let pauseTimer = null;
    let pauseRemainingSeconds = 90; // 90 saniye
    let pauseCircleLength = 2 * Math.PI * 120; // SVG daire çevresi (r=120)
    
    // Phase durations in seconds
    const phaseDuration = {
        inhale: 4,
        hold: 4,
        exhale: 4,
        wait: 4
    };
    
    // Guided meditation texts
    const guidedTexts = [
        "Rahat bir pozisyon alın, sırtınızı düz tutun.",
        "Şimdi gözlerinizi kapayın...",
        "Yavaşça nefes alın...",
        "Vücudunuzu hissedin...",
        "Kendinizi güvende ve huzurlu hissedin.",
        "Zihninizden geçen düşünceleri fark edin ve bırakın gitsin.",
        "Şimdi daha derin bir nefes alın...",
        "Nefesinizi tutun...",
        "Ve yavaşça bırakın...",
        "Tüm gerginliğin vücudunuzdan aktığını hissedin.",
        "Omuzlarınızı, boynunuzu, yüzünüzü gevşetin.",
        "Şu anın farkındalığında kalın...",
        "Her nefesle biraz daha sakinleşin.",
        "İç huzurunuzun keyfini çıkarın.",
        "Dış dünyadan uzaklaşın, sadece burada ve şimdi olun.",
        "Her nefes sizi daha derinden rahatlatıyor.",
        "Kendinize olumlu düşünceler gönderin.",
        "Sevgi ve şefkatle dolun...",
        "Şu an için minnettarlık hissedin.",
        "Yavaşça farkındalığınızı tekrar çevrenize getirin.",
        "Ellerinizi ve ayaklarınızı hafifçe hareket ettirin.",
        "Gözlerinizi açtığınızda, tazelenmiş ve canlanmış hissedeceksiniz.",
        "Meditasyonu tamamladığınızda derin bir nefes alın.",
        "Kendinize teşekkür edin ve gözlerinizi açın."
    ];
    
    // The Pause messages
    const pauseMessages = [
        "Sadece an'da kal",
        "Şu ana odaklan",
        "Derin bir nefes al",
        "Duyumsadığın sessizliği hisset",
        "Hiçbir şeye ihtiyacın yok",
        "Burada ve şimdi"
    ];
    
    // Speed settings for guided text (in milliseconds)
    const textSpeedOptions = {
        slow: 10000,
        medium: 7000,
        fast: 5000
    };
    
    // Default mantras array - positive affirmations
    const defaultMantras = [
        { text: "You're not behind. You're on your way.", author: "MindMate" },
        { text: "Bugün kendim için bir fark yaratacağım.", author: "MindMate" },
        { text: "Her zorluk, gücümü keşfetmem için bir fırsattır.", author: "MindMate" },
        { text: "Kendi hikayemin yazarıyım ve bugün yeni bir sayfa başlıyor.", author: "MindMate" },
        { text: "Ben yeterince iyiyim, hazırım ve yapabilirim.", author: "MindMate" },
        { text: "Her gün, her şekilde, daha da iyiye gidiyorum.", author: "MindMate" },
        { text: "Küçük adımlar da ilerleme demektir.", author: "MindMate" },
        { text: "Şu an buradayım ve bu yeterli.", author: "MindMate" },
        { text: "Hayatımda şükredecek çok şey var.", author: "MindMate" },
        { text: "Huzur ve güç içimde.", author: "MindMate" },
        { text: "Bugün sadece yapabildiğim kadarını yapacağım, ve bu yeterli.", author: "MindMate" },
        { text: "Kendi değerimi başkalarının düşüncelerine göre belirlemiyorum.", author: "MindMate" },
        { text: "Ben sürekli gelişen ve öğrenen biriyim.", author: "MindMate" },
        { text: "Kendime karşı sabırlı ve anlayışlıyım.", author: "MindMate" },
        { text: "Her yeni gün, yeni bir başlangıç şansı.", author: "MindMate" }
    ];
    
    // User mantras from localStorage
    let userMantras = JSON.parse(localStorage.getItem('mindmate-mantras')) || [];
    
    // Current displayed mantra
    let currentMantra = null;
    
    // Last displayed mantra date
    let lastMantraDate = localStorage.getItem('mindmate-last-mantra-date');
    
    // Initialize displays
    updateSessionDisplay();
    completedSessionsDisplay.textContent = completedSessions;
    formatTimeDisplay(totalMeditationTime, totalTimeDisplay);
    initializePauseTimer();
    
    // Event listeners - Box Menu
    breathingMeditationBox.addEventListener('click', showBreathingMeditation);
    backToMenuBreathing.addEventListener('click', hideBreathingMeditation);
    guidedMeditationBox.addEventListener('click', showGuidedMeditation);
    backToMenuGuided.addEventListener('click', hideGuidedMeditation);
    pauseMeditationBox.addEventListener('click', startPause);
    mantraMeditationBox.addEventListener('click', showMantraMeditation);
    backToMenuMantra.addEventListener('click', hideMantraMeditation);
    
    // Event listeners - Breathing Meditation
    startButton.addEventListener('click', startMeditation);
    pauseButton.addEventListener('click', pauseMeditation);
    resetButton.addEventListener('click', resetMeditation);
    soundToggle.addEventListener('change', toggleSounds);
    backgroundSoundSelect.addEventListener('change', changeBackgroundSound);
    
    // Event listeners - Guided Meditation
    startGuided.addEventListener('click', startGuidedMeditation);
    pauseGuided.addEventListener('click', pauseGuidedMeditation);
    resetGuided.addEventListener('click', resetGuidedMeditation);
    voiceToggle.addEventListener('change', toggleVoice);
    guidedBackgroundSound.addEventListener('change', changeGuidedBackgroundSound);
    
    // Load saved preferences
    loadPreferences();
    
    // Initialize pause timer circle
    function initializePauseTimer() {
        pausePathRemaining.style.strokeDasharray = pauseCircleLength;
        pausePathRemaining.style.strokeDashoffset = 0;
    }
    
    // Start The Pause - 90 second silence
    function startPause() {
        if (isPauseRunning) return;
        
        isPauseRunning = true;
        pauseRemainingSeconds = 90;
        
        // Choose a random message
        const randomIndex = Math.floor(Math.random() * pauseMessages.length);
        pauseMessage.textContent = pauseMessages[randomIndex];
        
        // Show overlay with animation
        pauseOverlay.classList.add('active');
        
        // Disable page interactions
        document.body.style.overflow = 'hidden';
        
        // Update timer display
        pauseSecondsDisplay.textContent = pauseRemainingSeconds;
        pausePathRemaining.style.strokeDashoffset = 0;
        
        // Start countdown
        pauseTimer = setInterval(() => {
            pauseRemainingSeconds--;
            
            // Update timer display
            pauseSecondsDisplay.textContent = pauseRemainingSeconds;
            
            // Update circle progress
            const progress = (90 - pauseRemainingSeconds) / 90;
            const dashoffset = pauseCircleLength * progress;
            pausePathRemaining.style.strokeDashoffset = dashoffset;
            
            // Change message occasionally
            if (pauseRemainingSeconds % 15 === 0 && pauseRemainingSeconds > 0) {
                const randomIndex = Math.floor(Math.random() * pauseMessages.length);
                pauseMessage.textContent = pauseMessages[randomIndex];
            }
            
            // End of pause
            if (pauseRemainingSeconds <= 0) {
                endPause();
            }
        }, 1000);
        
        // Save this as a meditation session
        saveSessionData(90);
    }
    
    // End The Pause
    function endPause() {
        clearInterval(pauseTimer);
        
        // Play bell sound
        if (bellSound) {
            bellSound.play().catch(error => {
                console.log('Ses çalma hatası:', error);
            });
        }
        
        // Wait for bell sound to complete, then hide overlay
        setTimeout(() => {
            pauseOverlay.classList.remove('active');
            
            // Re-enable page interactions
            document.body.style.overflow = '';
            
            isPauseRunning = false;
        }, 2000); // Wait for bell sound to finish
    }
    
    // Show Breathing Meditation
    function showBreathingMeditation() {
        hideAllMeditationContent();
        breathingMeditationContent.style.display = 'block';
        
        // Auto-scroll to the breathing content
        setTimeout(() => {
            breathingMeditationContent.scrollIntoView({
                behavior: 'smooth'
            });
        }, 100);
    }
    
    // Hide Breathing Meditation
    function hideBreathingMeditation() {
        // If a meditation session is running, ask for confirmation
        if (isRunning) {
            if (!confirm('Meditasyon seansınız devam ediyor. Geri dönmek istediğinize emin misiniz?')) {
                return;
            }
            pauseMeditation();
            saveSessionData(sessionSeconds);
        }
        
        resetMeditation();
        hideAllMeditationContent();
    }
    
    // Show Guided Meditation
    function showGuidedMeditation() {
        hideAllMeditationContent();
        guidedMeditationContent.style.display = 'block';
        
        // Auto-scroll to the guided content
        setTimeout(() => {
            guidedMeditationContent.scrollIntoView({
                behavior: 'smooth'
            });
        }, 100);
    }
    
    // Hide Guided Meditation
    function hideGuidedMeditation() {
        // If a guided session is running, ask for confirmation
        if (isGuidedRunning) {
            if (!confirm('Rehberli meditasyon seansınız devam ediyor. Geri dönmek istediğinize emin misiniz?')) {
                return;
            }
            pauseGuidedMeditation();
            saveSessionData(guidedSessionSeconds);
        }
        
        resetGuidedMeditation();
        hideAllMeditationContent();
    }
    
    // Show Mantra Meditation
    function showMantraMeditation() {
        hideAllMeditationContent();
        mantraMeditationContent.style.display = 'block';
        
        // Display daily mantra
        displayDailyMantra();
        
        // Render user mantras
        renderUserMantras();
        
        // Auto-scroll to the mantra content
        setTimeout(() => {
            mantraMeditationContent.scrollIntoView({
                behavior: 'smooth'
            });
        }, 100);
    }
    
    // Hide Mantra Meditation
    function hideMantraMeditation() {
        hideAllMeditationContent();
    }
    
    // Hide all meditation content
    function hideAllMeditationContent() {
        breathingMeditationContent.style.display = 'none';
        guidedMeditationContent.style.display = 'none';
        mantraMeditationContent.style.display = 'none';
    }
    
    // Start breathing meditation
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
    
    // Pause breathing meditation
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
    
    // Reset breathing meditation
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
    
    // Start guided meditation
    function startGuidedMeditation() {
        if (isGuidedRunning) return;
        
        isGuidedRunning = true;
        startGuided.disabled = true;
        pauseGuided.disabled = false;
        
        // Start session timer
        guidedSessionTimer = setInterval(updateGuidedSessionTime, 1000);
        
        // Start guided texts
        showGuidedTexts();
        
        // Play background sound if selected
        playSelectedGuidedBackgroundSound();
    }
    
    // Pause guided meditation
    function pauseGuidedMeditation() {
        isGuidedRunning = false;
        startGuided.disabled = false;
        pauseGuided.disabled = true;
        
        // Pause timers
        clearTimeout(guidedTimer);
        clearInterval(guidedSessionTimer);
        
        // Stop speech
        if (speechSynthesis && speechUtterance) {
            speechSynthesis.cancel();
        }
        
        // Pause background sounds
        pauseAllBackgroundSounds();
    }
    
    // Reset guided meditation
    function resetGuidedMeditation() {
        pauseGuidedMeditation();
        
        // Reset state
        guidedSessionSeconds = 0;
        currentGuidedIndex = 0;
        
        // Reset displays
        guidedText.textContent = '';
        guidedText.className = 'guided-text';
        guidedMinutesDisplay.textContent = '00';
        guidedSecondsDisplay.textContent = '00';
    }
    
    // Show guided texts sequentially
    function showGuidedTexts() {
        if (!isGuidedRunning) return;
        
        const duration = parseInt(guidedDuration.value) * 60; // Convert minutes to seconds
        const speed = textSpeedOptions[textSpeed.value];
        const numberOfTexts = guidedTexts.length;
        
        // Calculate how many texts to show based on duration
        const textsToShow = Math.min(numberOfTexts, Math.ceil(duration / (speed / 1000)));
        
        // If we've shown all texts or exceeded the duration, end the session
        if (currentGuidedIndex >= textsToShow) {
            saveSessionData(guidedSessionSeconds);
            resetGuidedMeditation();
            return;
        }
        
        // Show current text with fade-in effect
        guidedText.textContent = guidedTexts[currentGuidedIndex];
        guidedText.className = 'guided-text active';
        
        // Speak the text if voice is enabled
        if (voiceToggle.checked) {
            speakText(guidedTexts[currentGuidedIndex]);
        }
        
        // Schedule text fade-out
        setTimeout(() => {
            guidedText.className = 'guided-text fade-out';
            
            // After fade-out, show next text
            setTimeout(() => {
                currentGuidedIndex++;
                showGuidedTexts();
            }, 2000); // Fade-out time
            
        }, speed - 2000); // Show time minus fade-out time
    }
    
    // Speak text using Speech Synthesis API
    function speakText(text) {
        if (!speechSynthesis) return;
        
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        // Create new utterance
        speechUtterance = new SpeechSynthesisUtterance(text);
        
        // Get available voices
        const voices = speechSynthesis.getVoices();
        
        // Try to find a Turkish voice
        let turkishVoice = voices.find(voice => voice.lang.includes('tr'));
        
        // If no Turkish voice, use the default voice
        speechUtterance.voice = turkishVoice || voices[0];
        
        // Set properties
        speechUtterance.rate = 0.9; // Slightly slower
        speechUtterance.pitch = 1;
        
        // Speak
        speechSynthesis.speak(speechUtterance);
    }
    
    // Toggle voice for guided meditation
    function toggleVoice() {
        // No need to do anything, will be used when showing next text
        saveGuidedPreferences();
    }
    
    // Change background sound for guided meditation
    function changeGuidedBackgroundSound() {
        pauseAllBackgroundSounds();
        
        if (isGuidedRunning && guidedBackgroundSound.value !== 'none') {
            playSelectedGuidedBackgroundSound();
        }
        
        // Save preference
        saveGuidedPreferences();
    }
    
    // Play selected guided background sound
    function playSelectedGuidedBackgroundSound() {
        if (guidedBackgroundSound.value === 'none') return;
        
        switch (guidedBackgroundSound.value) {
            case 'lofi':
                lofiSound.play().catch(error => console.log('Ses çalma hatası:', error));
                break;
            case 'nature':
                natureSounds.play().catch(error => console.log('Ses çalma hatası:', error));
                break;
            case 'rain':
                rainSounds.play().catch(error => console.log('Ses çalma hatası:', error));
                break;
        }
    }
    
    // Save guided preferences
    function saveGuidedPreferences() {
        localStorage.setItem('mindmate-guided-voice', voiceToggle.checked);
        localStorage.setItem('mindmate-guided-background', guidedBackgroundSound.value);
        localStorage.setItem('mindmate-guided-speed', textSpeed.value);
        localStorage.setItem('mindmate-guided-duration', guidedDuration.value);
    }
    
    // Load guided preferences
    function loadGuidedPreferences() {
        const voiceEnabled = localStorage.getItem('mindmate-guided-voice');
        const backgroundSound = localStorage.getItem('mindmate-guided-background');
        const speed = localStorage.getItem('mindmate-guided-speed');
        const duration = localStorage.getItem('mindmate-guided-duration');
        
        if (voiceEnabled !== null) {
            voiceToggle.checked = voiceEnabled === 'true';
        }
        
        if (backgroundSound) {
            guidedBackgroundSound.value = backgroundSound;
        }
        
        if (speed) {
            textSpeed.value = speed;
        }
        
        if (duration) {
            guidedDuration.value = duration;
        }
    }
    
    // Update guided session timer
    function updateGuidedSessionTime() {
        guidedSessionSeconds++;
        const minutes = Math.floor(guidedSessionSeconds / 60);
        const seconds = guidedSessionSeconds % 60;
        
        guidedMinutesDisplay.textContent = minutes < 10 ? `0${minutes}` : minutes;
        guidedSecondsDisplay.textContent = seconds < 10 ? `0${seconds}` : seconds;
        
        // Check if session duration has been reached
        const durationInSeconds = parseInt(guidedDuration.value) * 60;
        if (guidedSessionSeconds >= durationInSeconds) {
            saveSessionData(guidedSessionSeconds);
            resetGuidedMeditation();
        }
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
        if (natureSounds) natureSounds.pause();
        if (rainSounds) rainSounds.pause();
        if (oceanSounds) oceanSounds.pause();
        if (lofiSound) lofiSound.pause();
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
        
        // Also load guided preferences
        loadGuidedPreferences();
    }
    
    // Update session statistics
    function updateSessionDisplay() {
        if (completedSessionsDisplay) {
            completedSessionsDisplay.textContent = completedSessions;
        }
        if (totalTimeDisplay) {
            formatTimeDisplay(totalMeditationTime, totalTimeDisplay);
        }
    }
    
    // Format time for display (converts seconds to MM:SS)
    function formatTimeDisplay(totalSeconds, displayElement) {
        if (!displayElement) return;
        
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        displayElement.textContent = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }
    
    // Save session data when finished
    function saveSessionData(seconds) {
        if (seconds > 10) { // Only count sessions longer than 10 seconds
            completedSessions++;
            totalMeditationTime += seconds;
            
            localStorage.setItem('mindmate-meditation-sessions', completedSessions);
            localStorage.setItem('mindmate-meditation-time', totalMeditationTime);
            
            updateSessionDisplay();
        }
    }
    
    // Handle page unload - save session data
    window.addEventListener('beforeunload', function() {
        if (isRunning) {
            saveSessionData(sessionSeconds);
            pauseAllBackgroundSounds();
        }
        
        if (isGuidedRunning) {
            saveSessionData(guidedSessionSeconds);
            pauseAllBackgroundSounds();
        }
    });
    
    // Additional event for reset button to save session data
    resetButton.addEventListener('click', function() {
        if (isRunning) {
            saveSessionData(sessionSeconds);
        }
    });
    
    // Additional event for guided reset button to save session data
    resetGuided.addEventListener('click', function() {
        if (isGuidedRunning) {
            saveSessionData(guidedSessionSeconds);
        }
    });
    
    // Initialize Speech Synthesis voices when available
    if (speechSynthesis) {
        // Chrome needs this to load voices
        speechSynthesis.onvoiceschanged = function() {
            // This is just to ensure voices are loaded
            speechSynthesis.getVoices();
        };
    }
    
    // Display daily mantra
    function displayDailyMantra() {
        const today = new Date().toDateString();
        
        // If we already displayed a mantra today, show the same one
        if (lastMantraDate === today && currentMantra) {
            mantraText.textContent = `"${currentMantra.text}"`;
            mantraAuthor.textContent = currentMantra.author;
            return;
        }
        
        // Get a new random mantra
        const allMantras = [...defaultMantras, ...userMantras];
        const randomIndex = Math.floor(Math.random() * allMantras.length);
        currentMantra = allMantras[randomIndex];
        
        // Update the display
        mantraText.textContent = `"${currentMantra.text}"`;
        mantraAuthor.textContent = currentMantra.author;
        
        // Save today's date
        lastMantraDate = today;
        localStorage.setItem('mindmate-last-mantra-date', today);
        localStorage.setItem('mindmate-current-mantra', JSON.stringify(currentMantra));
    }
    
    // Display a new random mantra
    function getNewMantra() {
        const allMantras = [...defaultMantras, ...userMantras];
        
        // If we only have one mantra, just show it
        if (allMantras.length <= 1) {
            currentMantra = allMantras[0];
            mantraText.textContent = `"${currentMantra.text}"`;
            mantraAuthor.textContent = currentMantra.author;
            return;
        }
        
        // Get a different mantra than the current one
        let randomIndex;
        let newMantra;
        
        do {
            randomIndex = Math.floor(Math.random() * allMantras.length);
            newMantra = allMantras[randomIndex];
        } while (newMantra.text === currentMantra.text);
        
        currentMantra = newMantra;
        
        // Apply a fade-out effect
        mantraText.style.opacity = 0;
        mantraAuthor.style.opacity = 0;
        
        // After fade-out, update text and fade-in
        setTimeout(() => {
            mantraText.textContent = `"${currentMantra.text}"`;
            mantraAuthor.textContent = currentMantra.author;
            
            mantraText.style.opacity = 1;
            mantraAuthor.style.opacity = 1;
            
            // Save the current mantra
            localStorage.setItem('mindmate-current-mantra', JSON.stringify(currentMantra));
        }, 500);
    }
    
    // Save a custom mantra
    function saveCustomMantra() {
        const text = customMantraInput.value.trim();
        if (!text) return;
        
        // Get the author (default to "Ben" if not provided)
        let author = mantraAuthorInput.value.trim();
        if (!author) author = "Ben";
        
        // Create a new mantra object
        const newMantra = {
            text: text,
            author: author,
            date: new Date().toISOString()
        };
        
        // Add to user mantras
        userMantras.push(newMantra);
        
        // Save to localStorage
        localStorage.setItem('mindmate-mantras', JSON.stringify(userMantras));
        
        // Show a success message or animation
        showMantraSaved();
        
        // Clear the form
        customMantraInput.value = '';
        mantraAuthorInput.value = '';
        
        // Render the updated list
        renderUserMantras();
        
        // Set the new mantra as current
        currentMantra = newMantra;
        mantraText.textContent = `"${currentMantra.text}"`;
        mantraAuthor.textContent = currentMantra.author;
        localStorage.setItem('mindmate-current-mantra', JSON.stringify(currentMantra));
    }
    
    // Show a success message when mantra is saved
    function showMantraSaved() {
        // Create a success message element
        const successMessage = document.createElement('div');
        successMessage.className = 'mantra-saved-message';
        successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Mantran kaydedildi!';
        
        // Add to the page
        document.querySelector('.mantra-form').appendChild(successMessage);
        
        // Remove after animation
        setTimeout(() => {
            successMessage.classList.add('fade-out');
            setTimeout(() => {
                successMessage.remove();
            }, 500);
        }, 2000);
    }
    
    // Render user mantras
    function renderUserMantras() {
        // Clear the list
        mantrasList.innerHTML = '';
        
        // If no user mantras, show empty state
        if (userMantras.length === 0) {
            mantrasList.innerHTML = `
                <div class="empty-mantras">
                    <i class="fas fa-quote-right"></i>
                    <p>Henüz kaydedilmiş mantran yok.</p>
                </div>
            `;
            return;
        }
        
        // Add each mantra to the list
        userMantras.forEach((mantra, index) => {
            const mantraItem = document.createElement('div');
            mantraItem.className = 'mantra-item';
            
            // Format the date
            const date = new Date(mantra.date);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            
            // Create the HTML for the mantra item
            mantraItem.innerHTML = `
                <div class="mantra-item-content">
                    <div class="mantra-item-text">"${mantra.text}"</div>
                    <div class="mantra-item-author">${mantra.author}</div>
                    <div class="mantra-item-date">${formattedDate}</div>
                </div>
                <div class="mantra-item-actions">
                    <button class="mantra-use-btn" title="Bu mantrayı kullan">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="mantra-delete-btn" title="Bu mantrayı sil">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add event listeners
            mantraItem.querySelector('.mantra-use-btn').addEventListener('click', () => {
                useMantra(index);
            });
            
            mantraItem.querySelector('.mantra-delete-btn').addEventListener('click', () => {
                deleteMantra(index);
            });
            
            mantrasList.appendChild(mantraItem);
        });
    }
    
    // Use a specific mantra
    function useMantra(index) {
        if (index < 0 || index >= userMantras.length) return;
        
        currentMantra = userMantras[index];
        
        // Apply a fade-out effect
        mantraText.style.opacity = 0;
        mantraAuthor.style.opacity = 0;
        
        // After fade-out, update text and fade-in
        setTimeout(() => {
            mantraText.textContent = `"${currentMantra.text}"`;
            mantraAuthor.textContent = currentMantra.author;
            
            mantraText.style.opacity = 1;
            mantraAuthor.style.opacity = 1;
            
            // Save the current mantra
            localStorage.setItem('mindmate-current-mantra', JSON.stringify(currentMantra));
        }, 500);
    }
    
    // Delete a mantra
    function deleteMantra(index) {
        if (index < 0 || index >= userMantras.length) return;
        
        // Ask for confirmation
        if (confirm('Bu mantrayı silmek istediğinize emin misiniz?')) {
            // Remove from array
            userMantras.splice(index, 1);
            
            // Save to localStorage
            localStorage.setItem('mindmate-mantras', JSON.stringify(userMantras));
            
            // Re-render the list
            renderUserMantras();
        }
    }
    
    // Initialize mantra tool
    function initMantraTool() {
        // Load the current mantra from localStorage
        const savedMantra = localStorage.getItem('mindmate-current-mantra');
        if (savedMantra) {
            currentMantra = JSON.parse(savedMantra);
        }
    }
    
    // Event listeners for mantra tool
    if (newMantraBtn) {
        newMantraBtn.addEventListener('click', getNewMantra);
    }
    
    if (saveMantraBtn) {
        saveMantraBtn.addEventListener('click', saveCustomMantra);
    }
    
    // When Enter key is pressed in the custom mantra textarea
    if (customMantraInput) {
        customMantraInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                saveCustomMantra();
            }
        });
    }
    
    // Initialize the mantra tool
    initMantraTool();
});