document.addEventListener('DOMContentLoaded', function() {
    // Değişkenler ve elemanlar
    const moodOptions = document.querySelectorAll('.mood-option');
    const moodNote = document.getElementById('mood-note');
    const saveMoodBtn = document.getElementById('save-mood');
    const moodEntriesContainer = document.getElementById('mood-entries');
    const clearHistoryBtn = document.getElementById('clear-history');
    const confirmModal = document.getElementById('confirm-modal');
    const cancelClearBtn = document.getElementById('cancel-clear');
    const confirmClearBtn = document.getElementById('confirm-clear');
    const successToast = document.getElementById('success-toast');
    const toastMessage = document.getElementById('toast-message');
    const moodCountEl = document.getElementById('mood-count');
    const moodAverageEl = document.getElementById('mood-average');
    const streakCountEl = document.getElementById('streak-count');
    
    // Tarih ve zaman
    const now = new Date();
    
    // Chart.js grafiği
    let moodChart;
    
    // Ruh hali girdileri
    let moodEntries = JSON.parse(localStorage.getItem('mindmate-mood-entries')) || [];
    
    // Seçilen ruh hali
    let selectedMood = null;
    let note = '';
    
    // Grafiği başlat
    initializeChart();
    
    // Ruh hali geçmişini göster
    renderMoodHistory();
    
    // İstatistikleri güncelle
    updateStats();
    
    // Ruh hali seçimi
    moodOptions.forEach(option => {
        option.addEventListener('click', function() {
            moodOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedMood = parseInt(this.getAttribute('data-mood'));
            saveMoodBtn.disabled = false;
        });
    });
    
    // Not giriş alanı
    moodNote.addEventListener('input', function() {
        note = this.value.trim();
    });
    
    saveMoodBtn.addEventListener('click', function() {
        if (!selectedMood) return;
        
        const now = new Date();
        const note = moodNote.value.trim();
        
        // Yeni ruh hali girişi
        const newMoodEntry = {
            id: generateId(),
            mood: selectedMood,
            note: note,
            timestamp: now.toISOString(),
            date: formatDate(now)
        };
        
        // Listeye ekle ve localStorage'a kaydet
        moodEntries.unshift(newMoodEntry); // En yeni giriş en üstte
        saveToLocalStorage();
        
        // Grafiği ve geçmişi güncelle
        updateChart();
        renderMoodHistory();
        updateStats();
        
        // Formu sıfırla
        resetForm();
        
        // Başarı mesajı göster
        showToast('Ruh haliniz başarıyla kaydedildi!');
    });
    
    // Geçmişi temizleme onay modalı
    clearHistoryBtn.addEventListener('click', function() {
        confirmModal.classList.add('active');
    });
    
    // Temizleme işlemini iptal et
    cancelClearBtn.addEventListener('click', function() {
        confirmModal.classList.remove('active');
    });
    
    // Temizleme işlemini onayla
    confirmClearBtn.addEventListener('click', function() {
        moodEntries = [];
        saveToLocalStorage();
        updateChart();
        renderMoodHistory();
        updateStats();
        confirmModal.classList.remove('active');
        showToast('Tüm ruh hali kayıtları temizlendi.');
    });
    
    // Modalın dışına tıklayınca kapatma
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            confirmModal.classList.remove('active');
        }
    });
    
    // Yardımcı Fonksiyonlar
    
    // ID oluşturma
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    // Tarihi formatla
    function formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('tr-TR', options);
    }
    
    // LocalStorage'a kaydet
    function saveToLocalStorage() {
        localStorage.setItem('mindmate-mood-entries', JSON.stringify(moodEntries));
    }
    
    // Formu sıfırla
    function resetForm() {
        moodOptions.forEach(opt => opt.classList.remove('selected'));
        moodNote.value = '';
        selectedMood = null;
        saveMoodBtn.disabled = true;
    }
    
    // Başarı mesajı göster
    function showToast(message) {
        toastMessage.textContent = message;
        successToast.classList.add('show');
        
        // 3 saniye sonra kapat
        setTimeout(() => {
            successToast.classList.remove('show');
        }, 3000);
    }
    
    // Chart.js grafiğini başlat
    function initializeChart() {
        const ctx = document.getElementById('moodChart').getContext('2d');
        
        // Son 7 girişi al (eğer varsa)
        const chartData = prepareChartData();
        
        // Grafik ayarları
        moodChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Ruh Hali',
                    data: chartData.data,
                    backgroundColor: 'rgba(91, 135, 248, 0.2)',
                    borderColor: 'rgba(91, 135, 248, 1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: chartData.pointColors,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0.5,
                        max: 5.5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                if (value === 1) return 'Çok Kötü';
                                if (value === 2) return 'Kötü';
                                if (value === 3) return 'Normal';
                                if (value === 4) return 'İyi';
                                if (value === 5) return 'Çok İyi';
                                return '';
                            }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                let label = '';
                                
                                if (value === 1) label = 'Çok Kötü';
                                else if (value === 2) label = 'Kötü';
                                else if (value === 3) label = 'Normal';
                                else if (value === 4) label = 'İyi';
                                else if (value === 5) label = 'Çok İyi';
                                
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Grafik için veri hazırlama
    function prepareChartData() {
        // Son 7 girişi al ve ters çevir (eskiden yeniye)
        const last7Entries = [...moodEntries].slice(0, 7).reverse();
        const labels = [];
        const data = [];
        const pointColors = [];
        
        // Veri yoksa
        if (last7Entries.length === 0) {
            return {
                labels: ['Henüz veri yok'],
                data: [],
                pointColors: []
            };
        }
        
        // Veri varsa
        last7Entries.forEach(entry => {
            const date = new Date(entry.timestamp);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
            labels.push(formattedDate);
            data.push(entry.mood);
            
            // Ruh haline göre nokta rengi
            if (entry.mood === 5) pointColors.push('#4CAF50');
            else if (entry.mood === 4) pointColors.push('#8BC34A');
            else if (entry.mood === 3) pointColors.push('#FFC107');
            else if (entry.mood === 2) pointColors.push('#FF9800');
            else if (entry.mood === 1) pointColors.push('#F44336');
        });
        
        return {
            labels,
            data,
            pointColors
        };
    }
    
    // Grafiği güncelle
    function updateChart() {
        const chartData = prepareChartData();
        
        moodChart.data.labels = chartData.labels;
        moodChart.data.datasets[0].data = chartData.data;
        moodChart.data.datasets[0].pointBackgroundColor = chartData.pointColors;
        
        moodChart.update();
    }
    
    // Ruh hali geçmişini göster
    function renderMoodHistory() {
        // Geçmişi temizle
        moodEntriesContainer.innerHTML = '';
        
        // Eğer giriş yoksa
        if (moodEntries.length === 0) {
            moodEntriesContainer.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-history"></i>
                    <p>Henüz kaydedilmiş ruh hali bulunmuyor.</p>
                </div>
            `;
            return;
        }
        
        // Girişleri ekle
        moodEntries.forEach(entry => {
            const moodEntryEl = document.createElement('div');
            moodEntryEl.className = 'mood-entry';
            
            // Ruh haline göre ikon sınıfı
            let iconClass = '';
            let iconName = '';
            
            if (entry.mood === 5) {
                iconClass = 'very-good';
                iconName = 'laugh-beam';
            } else if (entry.mood === 4) {
                iconClass = 'good';
                iconName = 'smile';
            } else if (entry.mood === 3) {
                iconClass = 'neutral';
                iconName = 'meh';
            } else if (entry.mood === 2) {
                iconClass = 'bad';
                iconName = 'frown';
            } else if (entry.mood === 1) {
                iconClass = 'very-bad';
                iconName = 'sad-tear';
            }
            
            // Giriş HTML'i
            moodEntryEl.innerHTML = `
                <div class="mood-entry-icon ${iconClass}">
                    <i class="fas fa-${iconName}"></i>
                </div>
                <div class="mood-entry-content">
                    <div class="mood-entry-header">
                        <div class="mood-entry-date">${entry.date}</div>
                    </div>
                    ${entry.note ? `<div class="mood-entry-note">${entry.note}</div>` : ''}
                </div>
            `;
            
            moodEntriesContainer.appendChild(moodEntryEl);
        });
    }
    
    // İstatistikleri güncelle
    function updateStats() {
        // Toplam kayıt sayısı
        moodCountEl.textContent = moodEntries.length;
        
        // Ortalama ruh hali
        if (moodEntries.length > 0) {
            const sum = moodEntries.reduce((acc, entry) => acc + entry.mood, 0);
            const average = sum / moodEntries.length;
            const roundedAverage = Math.round(average * 10) / 10; // 1 ondalık basamak
            
            let moodText = '';
            if (average >= 4.5) moodText = 'Çok İyi';
            else if (average >= 3.5) moodText = 'İyi';
            else if (average >= 2.5) moodText = 'Normal';
            else if (average >= 1.5) moodText = 'Kötü';
            else moodText = 'Çok Kötü';
            
            moodAverageEl.textContent = `${roundedAverage} (${moodText})`;
        } else {
            moodAverageEl.textContent = '-';
        }
        
        // Seri (streak) hesaplama
        let streak = calculateStreak();
        streakCountEl.textContent = streak;
    }
    
    // Seri (streak) hesaplama
    function calculateStreak() {
        if (moodEntries.length === 0) return 0;
        
        let streak = 1;
        let today = new Date().setHours(0, 0, 0, 0);
        
        // İlk giriş bugün mü kontrol et
        const firstEntryDate = new Date(moodEntries[0].timestamp).setHours(0, 0, 0, 0);
        if (firstEntryDate !== today) return 0;
        
        // Önceki günleri kontrol et
        let prevDate = today;
        
        for (let i = 1; i < moodEntries.length; i++) {
            const entryDate = new Date(moodEntries[i].timestamp).setHours(0, 0, 0, 0);
            const expectedDate = new Date(prevDate);
            expectedDate.setDate(expectedDate.getDate() - 1);
            
            // Ardışık gün mü?
            if (entryDate === expectedDate.setHours(0, 0, 0, 0)) {
                streak++;
                prevDate = entryDate;
            } else {
                break;
            }
        }
        
        return streak;
    }
});
