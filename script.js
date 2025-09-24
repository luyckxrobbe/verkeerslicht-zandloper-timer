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
        
        this.timer = null;
        this.timeLeft = 0;
        this.totalTime = 0;
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        this.startButton.addEventListener('click', () => this.startTimer());
        this.stopButton.addEventListener('click', () => this.stopTimer());
        
        // Start met groen licht
        this.setTrafficLight('green');
        this.statusText.textContent = 'Ik steek mijn vinger op als ik de juf nodig heb.';
    }
    
    startTimer() {
        if (this.isRunning) return;
        
        const minutes = parseInt(this.timeInput.value);
        if (minutes < 1 || minutes > 59) {
            alert('Voer een tijd in tussen 1 en 59 minuten!');
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
        this.statusText.textContent = 'Ik werk in stilte, ik stoor de juf niet.';
        
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
