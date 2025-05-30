document.addEventListener('DOMContentLoaded', function() {
    // DOM Elemanları
    const addNoteBtn = document.getElementById('add-note-btn');
    const noteModal = document.getElementById('note-modal');
    const closeModal = document.getElementById('close-modal');
    const noteForm = document.getElementById('note-form');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const noteColorInput = document.getElementById('note-color');
    const colorOptions = document.querySelectorAll('.color-option');
    const pinnedNotesContainer = document.getElementById('pinned-notes');
    const allNotesContainer = document.getElementById('all-notes');
    const modalTitle = document.getElementById('modal-title');
    const searchInput = document.getElementById('search-notes');
    const sortSelect = document.getElementById('sort-notes');
    const filterSelect = document.getElementById('filter-notes');
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const addFirstNoteBtn = document.querySelector('.add-first-note-btn');

    // Durum değişkenleri
    let notes = JSON.parse(localStorage.getItem('mindmate-notes')) || [];
    let currentNoteId = null;
    let noteToDelete = null;

    // Yardımcı fonksiyonlar
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    function formatDate(date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(date).toLocaleDateString('tr-TR', options);
    }

    function getRelativeTime(date) {
        const now = new Date();
        const noteDate = new Date(date);
        const diffInSeconds = Math.floor((now - noteDate) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Az önce';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} dakika önce`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} saat önce`;
        } else {
            return formatDate(date);
        }
    }

    // Not ekleme/düzenleme modalını açma
    function openNoteModal(note = null) {
        modalTitle.textContent = note ? 'Notu Düzenle' : 'Yeni Not';
        
        if (note) {
            noteTitleInput.value = note.title;
            noteContentInput.value = note.content;
            noteColorInput.value = note.color || '#ffffff';
            currentNoteId = note.id;
            
            // Renk seçeneğini işaretle
            colorOptions.forEach(option => {
                if (option.dataset.color === note.color) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        } else {
            noteForm.reset();
            currentNoteId = null;
            colorOptions.forEach(option => option.classList.remove('selected'));
            colorOptions[0].classList.add('selected'); // Beyaz rengi varsayılan olarak seç
            noteColorInput.value = '#ffffff';
        }
        
        noteModal.classList.add('active');
    }

    // Not ekleme/düzenleme modalını kapatma
    function closeNoteModal() {
        noteModal.classList.remove('active');
    }

    // Not silme onay modalını açma
    function openDeleteConfirmModal(noteId) {
        noteToDelete = noteId;
        deleteConfirmModal.classList.add('active');
    }

    // Not silme onay modalını kapatma
    function closeDeleteConfirmModal() {
        deleteConfirmModal.classList.remove('active');
        noteToDelete = null;
    }

    // Notu silme
    function deleteNote() {
        if (!noteToDelete) return;
        
        notes = notes.filter(note => note.id !== noteToDelete);
        saveNotes();
        renderNotes();
        closeDeleteConfirmModal();
    }

    // Not pinleme/pin kaldırma
    function togglePinNote(noteId) {
        const note = notes.find(n => n.id === noteId);
        if (note) {
            note.isPinned = !note.isPinned;
            saveNotes();
            renderNotes();
        }
    }

    // Notu favorilere ekleme/çıkarma
    function toggleFavoriteNote(noteId) {
        const note = notes.find(n => n.id === noteId);
        if (note) {
            note.isFavorite = !note.isFavorite;
            saveNotes();
            renderNotes();
        }
    }

    // Not oluşturma veya güncelleme
    function saveOrUpdateNote(event) {
        event.preventDefault();
        
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        const color = noteColorInput.value;
        
        if (!title || !content) return;
        
        if (currentNoteId) {
            // Mevcut notu güncelle
            const noteIndex = notes.findIndex(note => note.id === currentNoteId);
            if (noteIndex !== -1) {
                const updatedNote = {
                    ...notes[noteIndex],
                    title,
                    content,
                    color,
                    updatedAt: new Date().toISOString()
                };
                notes[noteIndex] = updatedNote;
            }
        } else {
            // Yeni not oluştur
            const newNote = {
                id: generateId(),
                title,
                content,
                color,
                isPinned: false,
                isFavorite: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            notes.push(newNote);
        }
        
        saveNotes();
        renderNotes();
        closeNoteModal();
    }

    // Notları localStorage'a kaydetme
    function saveNotes() {
        localStorage.setItem('mindmate-notes', JSON.stringify(notes));
    }

    // Notları filtreleme ve sıralama
    function filterAndSortNotes() {
        const searchTerm = searchInput.value.toLowerCase();
        const sortBy = sortSelect.value;
        const filterBy = filterSelect.value;
        
        let filteredNotes = [...notes];
        
        // Arama filtreleme
        if (searchTerm) {
            filteredNotes = filteredNotes.filter(note => 
                note.title.toLowerCase().includes(searchTerm) || 
                note.content.toLowerCase().includes(searchTerm)
            );
        }
        
        // Kategori filtreleme
        if (filterBy === 'pinned') {
            filteredNotes = filteredNotes.filter(note => note.isPinned);
        } else if (filterBy === 'favorites') {
            filteredNotes = filteredNotes.filter(note => note.isFavorite);
        }
        
        // Sıralama
        filteredNotes.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                case 'oldest':
                    return new Date(a.updatedAt) - new Date(b.updatedAt);
                case 'alphabetical':
                    return a.title.localeCompare(b.title);
                case 'reverse-alphabetical':
                    return b.title.localeCompare(a.title);
                default:
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
            }
        });
        
        return filteredNotes;
    }

    // Not HTML'i oluşturma
    function createNoteElement(note) {
        const noteCard = document.createElement('div');
        noteCard.className = `note-card ${note.isPinned ? 'pinned' : ''}`;
        noteCard.style.backgroundColor = note.color || '#ffffff';
        
        noteCard.innerHTML = `
            <div class="note-header">
                <h3 class="note-title">${note.title}</h3>
                <div class="note-actions">
                    <button class="note-action-btn edit-btn" title="Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="note-action-btn pin-btn ${note.isPinned ? 'active' : ''}" title="${note.isPinned ? 'Pini Kaldır' : 'Pinle'}">
                        <i class="fas fa-thumbtack"></i>
                    </button>
                    <button class="note-action-btn favorite-btn ${note.isFavorite ? 'active' : ''}" title="${note.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="note-action-btn delete-btn" title="Sil">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="note-content">${note.content}</div>
            <div class="note-footer">
                <div class="note-date">
                    <i class="far fa-clock"></i>
                    <span>${getRelativeTime(note.updatedAt)}</span>
                </div>
                <div class="note-badges">
                    ${note.isPinned ? '<span class="note-badge badge-pinned">Pinli</span>' : ''}
                    ${note.isFavorite ? '<span class="note-badge badge-favorite">Favori</span>' : ''}
                </div>
            </div>
        `;
        
        // Düzenleme butonu için olay dinleyicisi
        noteCard.querySelector('.edit-btn').addEventListener('click', () => {
            openNoteModal(note);
        });
        
        // Pin butonu için olay dinleyicisi
        noteCard.querySelector('.pin-btn').addEventListener('click', () => {
            togglePinNote(note.id);
        });
        
        // Favori butonu için olay dinleyicisi
        noteCard.querySelector('.favorite-btn').addEventListener('click', () => {
            toggleFavoriteNote(note.id);
        });
        
        // Silme butonu için olay dinleyicisi
        noteCard.querySelector('.delete-btn').addEventListener('click', () => {
            openDeleteConfirmModal(note.id);
        });
        
        return noteCard;
    }

    // Notları ekrana render etme
    function renderNotes() {
        const filteredNotes = filterAndSortNotes();
        const pinnedNotes = filteredNotes.filter(note => note.isPinned);
        const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);
        
        // Pinli notlar bölümünü temizle ve render et
        pinnedNotesContainer.innerHTML = '';
        if (pinnedNotes.length === 0) {
            pinnedNotesContainer.innerHTML = `
                <div class="empty-state pinned-empty">
                    <i class="fas fa-thumbtack"></i>
                    <p>Henüz pinlenmiş not yok</p>
                </div>
            `;
        } else {
            pinnedNotes.forEach(note => {
                pinnedNotesContainer.appendChild(createNoteElement(note));
            });
        }
        
        // Tüm notlar bölümünü temizle ve render et
        allNotesContainer.innerHTML = '';
        if (unpinnedNotes.length === 0 && pinnedNotes.length === 0) {
            allNotesContainer.innerHTML = `
                <div class="empty-state all-empty">
                    <i class="fas fa-book"></i>
                    <p>Henüz not eklenmemiş</p>
                    <button class="add-first-note-btn">İlk Notunuzu Ekleyin</button>
                </div>
            `;
            // İlk not ekleme butonuna olay dinleyicisi ekle
            const addFirstNoteButton = allNotesContainer.querySelector('.add-first-note-btn');
            if (addFirstNoteButton) {
                addFirstNoteButton.addEventListener('click', () => openNoteModal());
            }
        } else if (unpinnedNotes.length === 0 && filteredNotes.length !== 0) {
            // Pinli notlar var ama filtreleme sonucunda unpinned not yok
            allNotesContainer.innerHTML = `
                <div class="empty-state all-empty">
                    <i class="fas fa-search"></i>
                    <p>Kriterlere uygun not bulunamadı</p>
                </div>
            `;
        } else {
            unpinnedNotes.forEach(note => {
                allNotesContainer.appendChild(createNoteElement(note));
            });
        }
    }

    // Olay Dinleyicileri
    addNoteBtn.addEventListener('click', () => openNoteModal());
    closeModal.addEventListener('click', closeNoteModal);
    noteForm.addEventListener('submit', saveOrUpdateNote);
    cancelDeleteBtn.addEventListener('click', closeDeleteConfirmModal);
    confirmDeleteBtn.addEventListener('click', deleteNote);
    
    if (addFirstNoteBtn) {
        addFirstNoteBtn.addEventListener('click', () => openNoteModal());
    }
    
    // Modalın dışına tıklandığında kapatma
    noteModal.addEventListener('click', (e) => {
        if (e.target === noteModal) {
            closeNoteModal();
        }
    });
    
    deleteConfirmModal.addEventListener('click', (e) => {
        if (e.target === deleteConfirmModal) {
            closeDeleteConfirmModal();
        }
    });
    
    // Arama, filtreleme ve sıralama olayları
    searchInput.addEventListener('input', renderNotes);
    sortSelect.addEventListener('change', renderNotes);
    filterSelect.addEventListener('change', renderNotes);
    
    // Renk seçimi
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            noteColorInput.value = option.dataset.color;
        });
    });
    
    // Escape tuşu ile modalı kapatma
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeNoteModal();
            closeDeleteConfirmModal();
        }
    });
    
    // Sayfa yüklendiğinde notları render et
    renderNotes();
});
