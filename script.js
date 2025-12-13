class TrafficLightTimer {
    constructor() {
        // Basis-URL voor assets: afgeleid van waar script.js vandaan komt
        // Dit voorkomt kapotte relatieve paden (bv. wanneer de pagina-URL geen trailing '/' heeft).
        this.assetsBaseUrl = this.getAssetsBaseUrl();

        this.timeInput = document.getElementById('minutes-input');
        this.startButton = document.getElementById('global-start');
        this.stopButton = document.getElementById('global-stop');
        this.statusText = document.getElementById('status-text');
        
        // Stoplicht elementen
        this.redLight = document.getElementById('red-light');
        this.yellowLight = document.getElementById('yellow-light');
        this.greenLight = document.getElementById('green-light');
        
        // Zandloper elementen
        this.sandAnimation = document.querySelector('#sand animate[attributeName="d"]');
        this.sandFillAnimation = document.querySelector('#sand animate[attributeName="fill"]');
        
        // Taak elementen
        this.task1Select = document.getElementById('task1-select');
        this.task2Select = document.getElementById('task2-select');
        this.task3Select = document.getElementById('task3-select');
        this.task4Select = document.getElementById('task4-select');
        this.task1Display = document.getElementById('task1-display');
        this.task2Display = document.getElementById('task2-display');
        this.task3Display = document.getElementById('task3-display');
        this.task4Display = document.getElementById('task4-display');
        this.task1Item = document.getElementById('task1-item');
        this.task2Item = document.getElementById('task2-item');
        this.task3Item = document.getElementById('task3-item');
        this.task4Item = document.getElementById('task4-item');
        
        // Notitie velden
        this.task1Notes = document.getElementById('task1-notes');
        this.task2Notes = document.getElementById('task2-notes');
        this.task3Notes = document.getElementById('task3-notes');
        this.task4Notes = document.getElementById('task4-notes');
        
        
        // Scroll indicator
        this.scrollIndicator = document.getElementById('scroll-indicator');
        this.scrollTimer = null;
        this.hasScrolled = false;
        
        this.timer = null;
        this.timeLeft = 0;
        this.totalTime = 0;
        this.isRunning = false;
        
        this.init();
    }
    
    async init() {
        // Load available files for each task type
        await this.loadAvailableFiles();
        this.startButton.addEventListener('click', () => this.startTimer());
        this.stopButton.addEventListener('click', () => this.stopTimer());
        
        // Taak dropdown listeners
        this.task1Select.addEventListener('change', () => this.updateTaskDisplay(1));
        this.task2Select.addEventListener('change', () => this.updateTaskDisplay(2));
        this.task3Select.addEventListener('change', () => this.updateTaskDisplay(3));
        this.task4Select.addEventListener('change', () => this.updateTaskDisplay(4));
        
        // Notities listeners
        this.task1Notes.addEventListener('input', () => this.updateTaskDisplay(1));
        this.task2Notes.addEventListener('input', () => this.updateTaskDisplay(2));
        this.task3Notes.addEventListener('input', () => this.updateTaskDisplay(3));
        this.task4Notes.addEventListener('input', () => this.updateTaskDisplay(4));
        
        // Start met groen licht
        this.setTrafficLight('green');
        this.statusText.textContent = 'Ik steek mijn vinger op als ik de juf nodig heb.';
        
        // Initialize task displays
        this.updateTaskDisplay(1);
        this.updateTaskDisplay(2);
        this.updateTaskDisplay(3);
        this.updateTaskDisplay(4);
        
        // Initialize scroll indicator
        this.initScrollIndicator();
    }
    
    async loadAvailableFiles() {
        // Define the folders and their corresponding select elements
        const folders = [
            { folder: 'werkboeken', select: this.task1Select, prefix: 'Werkboekje' },
            { folder: 'leesboeken', select: this.task2Select, prefix: 'Leesboek' },
            { folder: 'taak3', select: this.task3Select, prefix: 'Taak 3' },
            { folder: 'extra', select: this.task4Select, prefix: 'Extra' }
        ];
        
        // For GitHub Pages, we'll use the fallback options directly since directory listing is not available
        // This is more reliable and works consistently across different hosting platforms
        for (const { folder, select, prefix } of folders) {
            this.addFallbackOptions(folder, select, prefix);
        }
    }
    
    addFallbackOptions(folder, select, prefix) {
        // Add known files as fallback - updated to match actual files
        const knownFiles = {
            'werkboeken': [
                'Werkboekje 1.jpg', 'Werkboekje 2.jpg', 'Werkboekje 3.jpg', 
                'Werkboekje 4.jpg', 'Werkboekje 5.jpg', 'Werkboekje 6.jpg',
                'Werkboekje 7.jpg', 'Werkboekje 8.jpg', 'Werkboekje 9.jpg'
            ],
            'leesboeken': [
                'Leesboekje 1.jpg', 'Leesboekje 2.jpg', 'Leesboekje 3.jpg',
                'Leesboekje 4.jpg', 'Leesboekje 5.jpg', 'Leesboekje 6.jpg',
                'Leesboekje 7.jpg', 'Leesboekje 8.jpg', 'Leesboekje 9.jpg'
            ],
            'taak3': ['Splitsen tot 6.png'],
            'extra': ['Kleurpotloden.png']
        };
        
        const files = knownFiles[folder] || [];
        files.forEach(fileName => {
            const option = document.createElement('option');
            const finalPath = `${folder}/${fileName}`;
            option.value = finalPath;
            // Remove file extension for display - only show filename
            const cleanName = fileName.replace(/\.[^/.]+$/, "");
            option.textContent = cleanName;
            select.appendChild(option);
        });
    }

    getAssetsBaseUrl() {
        // Probeer het script-element te vinden dat script.js laadt
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const scriptEl =
            scripts.find(s => s.getAttribute('src') === 'script.js') ||
            scripts.find(s => (s.getAttribute('src') || '').endsWith('/script.js')) ||
            scripts.find(s => (s.getAttribute('src') || '').includes('script.js')) ||
            null;

        if (scriptEl && scriptEl.src) {
            return new URL('.', scriptEl.src);
        }

        // Fallbacks
        return new URL('.', document.baseURI);
    }

    resolveAssetUrl(relativePath) {
        try {
            return new URL(relativePath, this.assetsBaseUrl).toString();
        } catch {
            return relativePath;
        }
    }
    
    updateTaskDisplay(taskNumber) {
        let select, display, notesField, taskItem;
        
        switch(taskNumber) {
            case 1:
                select = this.task1Select;
                display = this.task1Display;
                notesField = this.task1Notes;
                taskItem = this.task1Item;
                break;
            case 2:
                select = this.task2Select;
                display = this.task2Display;
                notesField = this.task2Notes;
                taskItem = this.task2Item;
                break;
            case 3:
                select = this.task3Select;
                display = this.task3Display;
                notesField = this.task3Notes;
                taskItem = this.task3Item;
                break;
            case 4:
                select = this.task4Select;
                display = this.task4Display;
                notesField = this.task4Notes;
                taskItem = this.task4Item;
                break;
        }
        
        const selectedValue = select.value;
        
        if (selectedValue === '') {
            // Geen taak geselecteerd - verberg het hele vakje
            taskItem.style.display = 'none';
            display.innerHTML = '';
        } else {
            // Toon het vakje
            taskItem.style.display = 'flex';
            
            // Toon de afbeelding
            const imgSrc = this.resolveAssetUrl(selectedValue);
            let html = `<div class="task-display-wrapper">
                <img src="${imgSrc}" alt="Taak ${taskNumber}">`;
            
            // Voeg notities toe (voor taak 1 en 2)
            if (notesField) {
                const notes = notesField.value.trim();
                if (notes) {
                    html += `<div class=\"task-notes\">${this.escapeHtml(notes)}</div>`;
                }
            }
            
            html += `</div>`;
            display.innerHTML = html;
        }

        // Nummering updaten op basis van zichtbare taken
        this.renumberVisibleTasks();
    }

    renumberVisibleTasks() {
        const taskItems = [this.task1Item, this.task2Item, this.task3Item, this.task4Item];
        let currentNumber = 1;
        taskItems.forEach((item) => {
            const numberEl = item.querySelector('.task-number');
            if (item.style.display !== 'none') {
                if (numberEl) numberEl.textContent = `${currentNumber}.`;
                currentNumber += 1;
            }
        });
    }

    // Eenvoudige HTML escaping voor gebruikersinvoer
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    startTimer() {
        if (this.isRunning) return;
        
        const minutes = parseInt(this.timeInput.value);
        if (minutes < 1) {
            alert('Voer een tijd in van minimaal 1 minuut!');
            return;
        }
        
        this.totalTime = minutes * 60; // Converteer naar seconden
        this.timeLeft = this.totalTime;
        this.isRunning = true;
        
        // Update buttons
        this.startButton.disabled = true;
        this.stopButton.disabled = false;
        
        // Start met rood licht
        this.setTrafficLight('red');
        this.statusText.textContent = 'Ik stoor de juf niet!';
        
        // Start zandloper animatie
        this.startHourglassAnimation();
        
        // Scroll naar boven om main container te centreren
        this.scrollToTop();
        
        // Start timer
        this.timer = setInterval(() => {
            this.timeLeft--;
            
            if (this.timeLeft <= 0) {
                this.timerFinished();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (!this.isRunning) return;
        
        clearInterval(this.timer);
        this.isRunning = false;
        
        // Update buttons
        this.startButton.disabled = false;
        this.stopButton.disabled = true;
        
        // Reset status
        this.statusText.textContent = 'Ik steek mijn vinger op als ik de juf nodig heb.';
        this.setTrafficLight('green');
        this.resetHourglass();
    }
    
    timerFinished() {
        clearInterval(this.timer);
        this.isRunning = false;
        
        // Update buttons
        this.startButton.disabled = false;
        this.stopButton.disabled = true;
        
        // Groen licht!
        this.setTrafficLight('green');
        this.statusText.textContent = 'Ik steek mijn vinger op als ik de juf nodig heb.';
        
        // Zandloper animatie is klaar
        this.resetHourglass();
        
        // Speel een geluidseffect (als browser het toestaat)
        this.playSound();
        
        // Na 3 seconden terug naar groen
        setTimeout(() => {
            this.setTrafficLight('green');
            this.statusText.textContent = 'Ik steek mijn vinger op als ik de juf nodig heb.';
            this.resetHourglass();
        }, 3000);
    }
    
    setTrafficLight(color) {
        // Alle lichten uit
        this.redLight.classList.remove('active');
        this.yellowLight.classList.remove('active');
        this.greenLight.classList.remove('active');
        
        // Specifiek licht aan
        if (color === 'red') {
            this.redLight.classList.add('active');
        } else if (color === 'yellow') {
            this.yellowLight.classList.add('active');
        } else if (color === 'green') {
            this.greenLight.classList.add('active');
        }
    }
    
    
    startHourglassAnimation() {
        if (this.sandAnimation && this.sandFillAnimation) {
            // Stel de duur in op basis van de timer
            const duration = this.totalTime;
            this.sandAnimation.setAttribute('dur', `${duration}s`);
            this.sandFillAnimation.setAttribute('dur', `${duration}s`);
            
            // Start de animatie
            this.sandAnimation.beginElement();
            this.sandFillAnimation.beginElement();
        }
    }
    
    resetHourglass() {
        if (this.sandAnimation && this.sandFillAnimation) {
            // Stop de animatie
            this.sandAnimation.endElement();
            this.sandFillAnimation.endElement();
        }
    }
    
    playSound() {
        // Maak een eenvoudig geluidseffect
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    initScrollIndicator() {
        // Start timer to show scroll indicator after 5 seconds
        this.scrollTimer = setTimeout(() => {
            if (!this.hasScrolled) {
                this.showScrollIndicator();
            }
        }, 5000);
        
        // Listen for scroll events
        window.addEventListener('scroll', () => {
            this.hasScrolled = true;
            this.hideScrollIndicator();
        });
        
        // Add click listener to scroll indicator
        this.scrollIndicator.addEventListener('click', () => {
            this.scrollToControls();
        });
    }
    
    showScrollIndicator() {
        this.scrollIndicator.classList.add('visible');
    }
    
    hideScrollIndicator() {
        this.scrollIndicator.classList.remove('visible');
    }
    
    scrollToControls() {
        const controlsContainer = document.querySelector('.controls-container');
        if (controlsContainer) {
            controlsContainer.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            this.hideScrollIndicator();
        }
    }
    
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Start de applicatie wanneer de pagina geladen is
document.addEventListener('DOMContentLoaded', () => {
    new TrafficLightTimer();
});
