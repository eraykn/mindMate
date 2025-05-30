document.addEventListener('DOMContentLoaded', function() {
    // Timer değişkenleri
    let isRunning = false;
    let workTime = 25 * 60; // 25 dakika
    let breakTime = 5 * 60; // 5 dakika
    let currentTime = workTime;
    let isWorkSession = true;
    let interval;
    let cycleCount = 1;
    let totalCycles = 4;
    let timerPathLength;

    // DOM elementleri
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const startButton = document.getElementById('start-timer');
    const pauseButton = document.getElementById('pause-timer');
    const resetButton = document.getElementById('reset-timer');
    const sessionType = document.getElementById('session-type');
    const cycleCountDisplay = document.getElementById('cycle-count');
    const timerPath = document.getElementById('timer-path-remaining');
    const breakNotification = document.getElementById('break-notification');
    const workNotification = document.getElementById('work-notification');
    const overlay = document.getElementById('overlay');
    const acknowledgeBreakBtn = document.getElementById('acknowledge-break');
    const acknowledgeWorkBtn = document.getElementById('acknowledge-work');
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task');
    const tasksList = document.getElementById('tasks-list');
    const timerCircle = document.querySelector('.timer-circle');
    const buttonSound = document.getElementById('button-sound'); // Ses elementi referansı

    // Timer yolunun uzunluğunu hesapla
    function calculateTimerPathLength() {
        if (timerPath) {
            timerPathLength = timerPath.getTotalLength();
            timerPath.style.strokeDasharray = timerPathLength;
            timerPath.style.strokeDashoffset = 0;
        }
    }

    // Ses çalma fonksiyonu
    function playButtonSound() {
        if (buttonSound) {
            buttonSound.currentTime = 0; // Sesi başa sar
            buttonSound.play().catch(error => {
                console.log('Ses çalma hatası:', error);
                // Bazı tarayıcılar kullanıcı etkileşimi olmadan ses çalmayı engelleyebilir
            });
        }
    }

    // Zamanı dakika:saniye formatında göster
    function updateTimeDisplay() {
        const minutes = Math.floor(currentTime / 60);
        const seconds = currentTime % 60;
        
        minutesDisplay.textContent = minutes < 10 ? `0${minutes}` : minutes;
        secondsDisplay.textContent = seconds < 10 ? `0${seconds}` : seconds;
        
        updateTimerProgress();
        
        document.title = `${minutesDisplay.textContent}:${secondsDisplay.textContent} - ${isWorkSession ? 'Çalışma' : 'Mola'} | MindMate`;
    }

    // Timer ilerleme çemberini güncelle
    function updateTimerProgress() {
        if (!timerPath || !timerPathLength) return;
        
        const timeTotal = isWorkSession ? workTime : breakTime;
        const timeRemaining = currentTime;
        const fraction = timeRemaining / timeTotal;
        
        const offset = timerPathLength * (1 - fraction);
        timerPath.style.strokeDashoffset = offset;
    }

    // Timer'ı başlat
    function startTimer() {
        if (isRunning) return;
        
        // Butona basıldığında ses çal
        playButtonSound();
        
        isRunning = true;
        startButton.disabled = true;
        pauseButton.disabled = false;
        timerCircle.classList.add('pulsing');
        
        interval = setInterval(() => {
            currentTime--;
            updateTimeDisplay();
            
            if (currentTime <= 0) {
                clearInterval(interval);
                isRunning = false;
                timerCircle.classList.remove('pulsing');
                
                if (isWorkSession) {
                    // Çalışma seansı bitti, mola başlat
                    isWorkSession = false;
                    currentTime = breakTime;
                    sessionType.textContent = 'Mola Zamanı';
                    sessionType.className = 'break-session';
                    document.querySelector('.timer-container').classList.add('break-active');
                    
                    // Mola bildirimini göster
                    showNotification(breakNotification);
                } else {
                    // Mola bitti, yeni çalışma seansı başlat
                    isWorkSession = true;
                    currentTime = workTime;
                    sessionType.textContent = 'Çalışma Zamanı';
                    sessionType.className = 'work-session';
                    document.querySelector('.timer-container').classList.remove('break-active');
                    
                    // Döngü sayısını güncelle
                    cycleCount = cycleCount < totalCycles ? cycleCount + 1 : 1;
                    cycleCountDisplay.textContent = `Döngü: ${cycleCount}/${totalCycles}`;
                    
                    // Çalışma bildirimini göster
                    showNotification(workNotification);
                }
                
                startButton.disabled = false;
                pauseButton.disabled = true;
                updateTimeDisplay();
            }
        }, 1000);
    }

    // Timer'ı durdur
    function pauseTimer() {
        if (!isRunning) return;
        
        // Durdur butonuna basıldığında da ses çal
        playButtonSound();
        
        clearInterval(interval);
        isRunning = false;
        startButton.disabled = false;
        pauseButton.disabled = true;
        timerCircle.classList.remove('pulsing');
    }

    // Timer'ı sıfırla
    function resetTimer() {
        // Sıfırla butonuna basıldığında da ses çal
        playButtonSound();
        
        clearInterval(interval);
        isRunning = false;
        
        isWorkSession = true;
        currentTime = workTime;
        sessionType.textContent = 'Çalışma Zamanı';
        sessionType.className = 'work-session';
        document.querySelector('.timer-container').classList.remove('break-active');
        
        cycleCount = 1;
        cycleCountDisplay.textContent = `Döngü: ${cycleCount}/${totalCycles}`;
        
        startButton.disabled = false;
        pauseButton.disabled = true;
        timerCircle.classList.remove('pulsing');
        
        updateTimeDisplay();
    }

    // Bildirim göster
    function showNotification(notification) {
        overlay.classList.add('show');
        notification.classList.add('show');
    }

    // Bildirim kapat
    function hideNotification(notification) {
        overlay.classList.remove('show');
        notification.classList.remove('show');
    }

    // Görev ekle
    function addTask() {
        const taskText = taskInput.value.trim();
        if (!taskText) return;
        
        const taskId = 'task-' + Date.now();
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item', 'new-task');
        taskItem.dataset.id = taskId;
        
        taskItem.innerHTML = `
            <div class="task-checkbox">
                <i class="fas fa-check"></i>
            </div>
            <div class="task-text">${taskText}</div>
            <div class="task-actions">
                <button class="task-edit"><i class="fas fa-pencil-alt"></i></button>
                <button class="task-delete"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        
        tasksList.appendChild(taskItem);
        taskInput.value = '';
        taskInput.focus();
        
        // Görevleri localStorage'a kaydet
        saveTasksToLocalStorage();
        
        // Görevi tamamlandı olarak işaretle
        const checkbox = taskItem.querySelector('.task-checkbox');
        checkbox.addEventListener('click', function() {
            toggleTaskCompletion(taskId);
        });
        
        // Görev silme
        const deleteBtn = taskItem.querySelector('.task-delete');
        deleteBtn.addEventListener('click', function() {
            deleteTask(taskId);
        });
        
        // Görev düzenleme
        const editBtn = taskItem.querySelector('.task-edit');
        editBtn.addEventListener('click', function() {
            editTask(taskId);
        });
    }

    // Görev tamamlama durumunu değiştir
    function toggleTaskCompletion(taskId) {
        const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        const checkbox = taskItem.querySelector('.task-checkbox');
        const taskText = taskItem.querySelector('.task-text');
        
        checkbox.classList.toggle('checked');
        taskText.classList.toggle('completed');
        
        saveTasksToLocalStorage();
    }

    // Görev sil
    function deleteTask(taskId) {
        const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        taskItem.style.opacity = '0';
        taskItem.style.transform = 'translateX(30px)';
        
        setTimeout(() => {
            taskItem.remove();
            saveTasksToLocalStorage();
        }, 300);
    }

    // Görev düzenle
    function editTask(taskId) {
        const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        const taskText = taskItem.querySelector('.task-text');
        const currentText = taskText.textContent;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-task-input';
        input.style.width = '100%';
        input.style.padding = '8px';
        input.style.border = '1px solid #ddd';
        input.style.borderRadius = '4px';
        
        taskText.innerHTML = '';
        taskText.appendChild(input);
        input.focus();
        
        // Düzenleme tamamlandığında
        input.addEventListener('blur', finishEditing);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                finishEditing();
            }
        });
        
        function finishEditing() {
            const newText = input.value.trim();
            if (newText) {
                taskText.textContent = newText;
                saveTasksToLocalStorage();
            } else {
                taskText.textContent = currentText;
            }
        }
    }

    // Görevleri localStorage'a kaydet
    function saveTasksToLocalStorage() {
        const tasks = [];
        document.querySelectorAll('.task-item').forEach(item => {
            const id = item.dataset.id;
            const text = item.querySelector('.task-text').textContent;
            const isCompleted = item.querySelector('.task-checkbox').classList.contains('checked');
            
            tasks.push({ id, text, isCompleted });
        });
        
        localStorage.setItem('mindmate-tasks', JSON.stringify(tasks));
    }

    // Görevleri localStorage'dan yükle
    function loadTasksFromLocalStorage() {
        const tasks = JSON.parse(localStorage.getItem('mindmate-tasks')) || [];
        
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            taskItem.dataset.id = task.id;
            
            taskItem.innerHTML = `
                <div class="task-checkbox ${task.isCompleted ? 'checked' : ''}">
                    <i class="fas fa-check"></i>
                </div>
                <div class="task-text ${task.isCompleted ? 'completed' : ''}">${task.text}</div>
                <div class="task-actions">
                    <button class="task-edit"><i class="fas fa-pencil-alt"></i></button>
                    <button class="task-delete"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            
            tasksList.appendChild(taskItem);
            
            // Görevi tamamlandı olarak işaretle
            const checkbox = taskItem.querySelector('.task-checkbox');
            checkbox.addEventListener('click', function() {
                toggleTaskCompletion(task.id);
            });
            
            // Görev silme
            const deleteBtn = taskItem.querySelector('.task-delete');
            deleteBtn.addEventListener('click', function() {
                deleteTask(task.id);
            });
            
            // Görev düzenleme
            const editBtn = taskItem.querySelector('.task-edit');
            editBtn.addEventListener('click', function() {
                editTask(task.id);
            });
        });
    }

    // Event listener'lar
    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);
    
    acknowledgeBreakBtn.addEventListener('click', function() {
        playButtonSound(); // Bildirim butonuna tıklandığında ses çal
        hideNotification(breakNotification);
        startTimer(); // Molayı otomatik başlat
    });
    
    acknowledgeWorkBtn.addEventListener('click', function() {
        playButtonSound(); // Bildirim butonuna tıklandığında ses çal
        hideNotification(workNotification);
        startTimer(); // Çalışma seansını otomatik başlat
    });
    
    addTaskBtn.addEventListener('click', function() {
        playButtonSound(); // Görev ekle butonuna tıklandığında ses çal
        addTask();
    });
    
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Sayfa yüklendiğinde
    calculateTimerPathLength();
    updateTimeDisplay();
    loadTasksFromLocalStorage();

    // Sayfa kapatılmadan önce görevleri kaydet
    window.addEventListener('beforeunload', saveTasksToLocalStorage);
});
