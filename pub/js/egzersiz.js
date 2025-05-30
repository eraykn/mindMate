document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Navigation
    const chairExerciseBox = document.getElementById('chair-exercise-box');
    const chairExercisesSection = document.getElementById('chair-exercises');
    const backToMenuButton = document.getElementById('back-to-menu');
    
    // DOM Elements - Exercise Completion
    const completeExerciseButton = document.getElementById('complete-exercise');
    const completionPercent = document.getElementById('completion-percent');
    const completionPath = document.getElementById('completion-path');
    
    // Exercise data from localStorage
    let exerciseData = getExerciseData();
    
    // Öncelikle DOM elemanlarının varlığını kontrol et
    console.log("Chair Exercise Box:", chairExerciseBox);
    console.log("Chair Exercises Section:", chairExercisesSection);
    
    // Elemanlar bulunduğunda event listener'ları ekle
    if (chairExerciseBox && chairExercisesSection) {
        // Calculate path length for the completion circle
        if (completionPath) {
            const pathLength = 2 * Math.PI * 54; // (2 * π * r)
            completionPath.style.strokeDasharray = pathLength;
            updateCompletionCircle();
        }
        
        // Event Listeners
        chairExerciseBox.addEventListener('click', showChairExercises);
        
        if (backToMenuButton) {
            backToMenuButton.addEventListener('click', hideChairExercises);
        }
        
        if (completeExerciseButton) {
            completeExerciseButton.addEventListener('click', markExerciseAsComplete);
        }
        
        // Debug için konsola logla
        console.log("Event listeners added successfully");
    } else {
        console.error("Required DOM elements not found!");
    }
    
    // Show Chair Exercises
    function showChairExercises() {
        console.log("showChairExercises function called");
        
        // Hide menu, show chair exercises
        const exerciseMenu = document.querySelector('.exercise-menu');
        if (exerciseMenu) {
            exerciseMenu.style.display = 'none';
        }
        
        if (chairExercisesSection) {
            chairExercisesSection.style.display = 'block';
            
            // Scroll to the exercises section
            setTimeout(() => {
                chairExercisesSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }, 100);
        }
    }
    
    // Hide Chair Exercises
    function hideChairExercises() {
        console.log("hideChairExercises function called");
        
        // Show menu, hide chair exercises
        const exerciseMenu = document.querySelector('.exercise-menu');
        if (exerciseMenu) {
            exerciseMenu.style.display = 'grid';
        }
        
        if (chairExercisesSection) {
            chairExercisesSection.style.display = 'none';
            
            // Scroll to the top
            const exerciseHeader = document.querySelector('.exercise-header');
            if (exerciseHeader) {
                exerciseHeader.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    }
    
    // Mark exercise as complete
    function markExerciseAsComplete() {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Check if already completed today
        if (exerciseData.chair && exerciseData.chair.includes(today)) {
            showMessage('Bu egzersizi bugün zaten tamamladınız!', 'info');
            return;
        }
        
        // Add today's date to the completion list
        if (!exerciseData.chair) {
            exerciseData.chair = [];
        }
        
        exerciseData.chair.push(today);
        
        // Save to localStorage
        localStorage.setItem('mindmate-exercise-data', JSON.stringify(exerciseData));
        
        // Update display
        updateCompletionCircle();
        showMessage('Harika! Egzersiz tamamlandı.', 'success');
        
        // Animate button
        if (completeExerciseButton) {
            completeExerciseButton.classList.add('animate-pulse');
            setTimeout(() => {
                completeExerciseButton.classList.remove('animate-pulse');
            }, 1000);
        }
    }
    
    // Get exercise data from localStorage
    function getExerciseData() {
        const savedData = localStorage.getItem('mindmate-exercise-data');
        return savedData ? JSON.parse(savedData) : {};
    }
    
    // Update completion circle
    function updateCompletionCircle() {
        if (!completionPercent || !completionPath) return;
        
        // Calculate completion percentage based on last 30 days
        const daysPassed = calculateCompletionPercentage();
        completionPercent.textContent = daysPassed;
        
        // Update circle
        const pathLength = 2 * Math.PI * 54;
        const dashOffset = pathLength * (1 - daysPassed / 100);
        completionPath.style.strokeDashoffset = dashOffset;
        
        // Update button text based on completion
        if (completeExerciseButton) {
            if (isCompletedToday()) {
                completeExerciseButton.innerHTML = '<i class="fas fa-check-double"></i> Bugün Tamamlandı';
                completeExerciseButton.disabled = true;
            } else {
                completeExerciseButton.innerHTML = '<i class="fas fa-check"></i> Bugün Tamamladım';
                completeExerciseButton.disabled = false;
            }
        }
    }
    
    // Calculate completion percentage (last 30 days)
    function calculateCompletionPercentage() {
        if (!exerciseData.chair || exerciseData.chair.length === 0) {
            return 0;
        }
        
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        // Filter completions from the last 30 days
        const recentCompletions = exerciseData.chair.filter(dateStr => {
            const completionDate = new Date(dateStr);
            return completionDate >= thirtyDaysAgo && completionDate <= now;
        });
        
        // Calculate percentage (max 100%)
        return Math.min(Math.round((recentCompletions.length / 30) * 100), 100);
    }
    
    // Check if exercise is completed today
    function isCompletedToday() {
        if (!exerciseData.chair) return false;
        
        const today = new Date().toISOString().split('T')[0];
        return exerciseData.chair.includes(today);
    }
    
    // Show message function
    function showMessage(message, type) {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(messageDiv);
        
        // Animate in
        setTimeout(() => {
            messageDiv.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 3000);
    }
    
    // Add message styles dynamically
    addMessageStyles();
    
    // Function to add message styles
    function addMessageStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .message {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 15px 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                transform: translateY(100px);
                opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
                z-index: 1000;
            }
            
            .message.show {
                transform: translateY(0);
                opacity: 1;
            }
            
            .message-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .message-success i {
                color: var(--exercise-primary);
            }
            
            .message-info i {
                color: #2196F3;
            }
            
            @keyframes pulse {
                0% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
                100% {
                    transform: scale(1);
                }
            }
            
            .animate-pulse {
                animation: pulse 0.5s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Hata ayıklama için özel olarak egzersiz kutusuna tıklama olayı ekleyelim
    document.querySelectorAll('.exercise-box').forEach(box => {
        box.addEventListener('click', function() {
            console.log("Exercise box clicked:", this.querySelector('h3').textContent);
            
            if (this.id === 'chair-exercise-box') {
                showChairExercises();
            }
        });
    });
});