class TrafficLightTimer {
    constructor() {
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
        this.task1Display = document.getElementById('task1-display');
        this.task2Display = document.getElementById('task2-display');
        this.task3Display = document.getElementById('task3-display');
        this.task1Item = document.getElementById('task1-item');
        this.task2Item = document.getElementById('task2-item');
        this.task3Item = document.getElementById('task3-item');
        
        // Pagina range elementen
        this.task1PageFrom = document.getElementById('task1-page-from');
        this.task1PageTo = document.getElementById('task1-page-to');
        this.task2PageFrom = document.getElementById('task2-page-from');
        this.task2PageTo = document.getElementById('task2-page-to');
        
        this.timer = null;
        this.timeLeft = 0;
        this.totalTime = 0;
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        this.startButton.addEventListener('click', () => this.startTimer());
        this.stopButton.addEventListener('click', () => this.stopTimer());
        
        // Taak dropdown listeners
        this.task1Select.addEventListener('change', () => this.updateTaskDisplay(1));
        this.task2Select.addEventListener('change', () => this.updateTaskDisplay(2));
        this.task3Select.addEventListener('change', () => this.updateTaskDisplay(3));
        
        // Pagina range listeners
        this.task1PageFrom.addEventListener('input', () => this.updateTaskDisplay(1));
        this.task1PageTo.addEventListener('input', () => this.updateTaskDisplay(1));
        this.task2PageFrom.addEventListener('input', () => this.updateTaskDisplay(2));
        this.task2PageTo.addEventListener('input', () => this.updateTaskDisplay(2));
        
        // Start met groen licht
        this.setTrafficLight('green');
        this.statusText.textContent = 'Ik steek mijn vinger op als ik de juf nodig heb.';
        
        // Initialize task displays
        this.updateTaskDisplay(1);
        this.updateTaskDisplay(2);
        this.updateTaskDisplay(3);
    }
    
    updateTaskDisplay(taskNumber) {
        let select, display, pageFrom, pageTo, taskItem;
        
        switch(taskNumber) {
            case 1:
                select = this.task1Select;
                display = this.task1Display;
                pageFrom = this.task1PageFrom;
                pageTo = this.task1PageTo;
                taskItem = this.task1Item;
                break;
            case 2:
                select = this.task2Select;
                display = this.task2Display;
                pageFrom = this.task2PageFrom;
                pageTo = this.task2PageTo;
                taskItem = this.task2Item;
                break;
            case 3:
                select = this.task3Select;
                display = this.task3Display;
                pageFrom = null;
                pageTo = null;
                taskItem = this.task3Item;
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
            let html = `<div class="task-display-wrapper">
                <img src="${selectedValue}" alt="Taak ${taskNumber}">`;
            
            // Voeg pagina range toe als deze bestaat (voor taak 1 en 2)
            if (pageFrom && pageTo) {
                const fromValue = pageFrom.value;
                const toValue = pageTo.value;
                
                if (fromValue && toValue) {
                    html += `<div class="task-page-range">Pagina's ${fromValue} - ${toValue}</div>`;
                } else if (fromValue) {
                    html += `<div class="task-page-range">Vanaf pagina ${fromValue}</div>`;
                } else if (toValue) {
                    html += `<div class="task-page-range">Tot pagina ${toValue}</div>`;
                }
            }
            
            html += `</div>`;
            display.innerHTML = html;
        }
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
}

// Start de applicatie wanneer de pagina geladen is
document.addEventListener('DOMContentLoaded', () => {
    new TrafficLightTimer();
});
