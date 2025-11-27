// Soundboard Konfiguration - Instrumente und Töne
const instruments = {
    piano: {
        name: 'Piano',
        icon: '🎹',
        sounds: {
            'C': 261.63,
            'C#': 277.18,
            'D': 293.66,
            'D#': 311.13,
            'E': 329.63,
            'F': 349.23,
            'F#': 369.99,
            'G': 392.00,
            'G#': 415.30,
            'A': 440.00,
            'A#': 466.16,
            'B': 493.88
        },
        waveType: 'sine'
    },
    gitarre: {
        name: 'Gitarre',
        icon: '🎸',
        sounds: {
            'E': 329.63,
            'A': 440.00,
            'D': 293.66,
            'G': 392.00,
            'B': 493.88,
            'e': 659.25,
            'Power': 220.00,
            'Slide': 330.00,
            'Bend': 440.00,
            'Hammer': 494.00,
            'Pull': 349.23,
            'Mute': 200.00
        },
        waveType: 'sawtooth'
    },
    schlagzeug: {
        name: 'Schlagzeug',
        icon: '🥁',
        sounds: {
            'Kick': { type: 'drum', freq: 60 },
            'Snare': { type: 'drum', freq: 200 },
            'Hi-Hat': { type: 'drum', freq: 400 },
            'Crash': { type: 'drum', freq: 300 },
            'Tom 1': { type: 'drum', freq: 150 },
            'Tom 2': { type: 'drum', freq: 120 },
            'Ride': { type: 'drum', freq: 500 },
            'Open Hat': { type: 'drum', freq: 450 },
            'Rim': { type: 'drum', freq: 250 },
            'Cowbell': { type: 'drum', freq: 350 }
        },
        waveType: 'sawtooth'
    },
    trompete: {
        name: 'Trompete',
        icon: '🎺',
        sounds: {
            'C': 261.63,
            'D': 293.66,
            'E': 329.63,
            'F': 349.23,
            'G': 392.00,
            'A': 440.00,
            'B': 493.88,
            'C High': 523.25,
            'D High': 587.33,
            'E High': 659.25
        },
        waveType: 'square'
    },
    flöte: {
        name: 'Flöte',
        icon: '🎵',
        sounds: {
            'C': 523.25,
            'D': 587.33,
            'E': 659.25,
            'F': 698.46,
            'G': 783.99,
            'A': 880.00,
            'B': 987.77,
            'C High': 1046.50,
            'D High': 1174.66,
            'E High': 1318.51
        },
        waveType: 'sine'
    },
    synthesizer: {
        name: 'Synthesizer',
        icon: '🎹',
        sounds: {
            'Bass': 110.00,
            'Lead 1': 440.00,
            'Lead 2': 554.37,
            'Pad': 220.00,
            'Pluck': 330.00,
            'Arp': 440.00,
            'Saw': 440.00,
            'Square': 440.00,
            'Triangle': 440.00,
            'Noise': 440.00
        },
        waveType: 'triangle'
    }
};

// Globale Variablen
let currentInstrument = 'piano';
let audioContext = null;
let activeOscillators = {};
let isInitialized = false;

// Tastenbelegung: Speichert für jedes Instrument welche 8 Töne den 8 Tasten zugeordnet sind
let keyMappings = {};

// Anzahl der Tasten (immer 8)
const NUM_KEYS = 8;

// Audio Context initialisieren (benötigt User-Interaktion)
function initAudioContext() {
    if (audioContext) return audioContext;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        isInitialized = true;
        return audioContext;
    } catch (error) {
        console.error('Audio Context Fehler:', error);
        alert('Ihr Browser unterstützt keine Audio-Funktionen.');
        return null;
    }
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    // Gespeicherte Tastenbelegungen laden
    loadKeyMappings();
    
    createInstrumentTabs();
    loadInstrument(currentInstrument);
    setupInstrumentTabToggle();
    setupConfigurationModal();
    
    // Partikel-Kugel initialisieren
    initParticleSphere();
    
    // Audio Context erstellen beim ersten Klick/Touch
    document.addEventListener('click', initAudioOnFirstInteraction, { once: true });
    document.addEventListener('touchstart', initAudioOnFirstInteraction, { once: true });
});

function initAudioOnFirstInteraction() {
    initAudioContext();
}

// Toggle-Button für Instrument-Reiter einrichten
function setupInstrumentTabToggle() {
    const toggle = document.getElementById('instrumentTabToggle');
    const panel = document.getElementById('instrumentPanel');
    const currentDisplay = document.getElementById('currentInstrumentDisplay');
    
    // Panel öffnen/schließen
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('active');
    });
    
    // Panel schließen bei Klick außerhalb
    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !toggle.contains(e.target)) {
            panel.classList.remove('active');
        }
    });
    
    // Touch-Event für mobile Geräte
    toggle.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        panel.classList.toggle('active');
    });
    
    // Aktuelles Instrument im Toggle-Button anzeigen
    updateCurrentInstrumentDisplay();
}

// Anzeige des aktuellen Instruments aktualisieren
function updateCurrentInstrumentDisplay() {
    const currentDisplay = document.getElementById('currentInstrumentDisplay');
    const instrument = instruments[currentInstrument];
    if (currentDisplay && instrument) {
        currentDisplay.textContent = `${instrument.icon} ${instrument.name}`;
    }
}

// Instrument-Tabs erstellen
function createInstrumentTabs() {
    const container = document.getElementById('instrumentTabs');
    container.innerHTML = '';
    
    Object.keys(instruments).forEach(instrumentKey => {
        const instrument = instruments[instrumentKey];
        const tab = document.createElement('button');
        tab.className = 'instrument-tab';
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', instrumentKey === currentInstrument);
        tab.textContent = `${instrument.icon} ${instrument.name}`;
        tab.dataset.instrument = instrumentKey;
        
        if (instrumentKey === currentInstrument) {
            tab.classList.add('active');
        }
        
        tab.addEventListener('click', (e) => {
            e.stopPropagation();
            switchInstrument(instrumentKey);
            // Panel nach Auswahl schließen
            const panel = document.getElementById('instrumentPanel');
            if (panel) {
                panel.classList.remove('active');
            }
        });
        
        container.appendChild(tab);
    });
}

// Instrument wechseln
function switchInstrument(instrumentKey) {
    // Alle laufenden Töne stoppen
    stopAllSounds();
    
    // Aktives Instrument ändern
    currentInstrument = instrumentKey;
    
    // Instrument laden
    loadInstrument(instrumentKey);
    
    // Tab-States aktualisieren
    document.querySelectorAll('.instrument-tab').forEach(tab => {
        const isActive = tab.dataset.instrument === instrumentKey;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive);
    });
    
    // Anzeige im Toggle-Button aktualisieren
    updateCurrentInstrumentDisplay();
}

// Alle Töne stoppen
function stopAllSounds() {
    Object.values(activeOscillators).forEach(oscData => {
        if (oscData && oscData.oscillator) {
            try {
                oscData.oscillator.stop();
                oscData.oscillator.disconnect();
                if (oscData.gainNode) {
                    oscData.gainNode.disconnect();
                }
            } catch (e) {
                // Ignorieren wenn bereits gestoppt
            }
        }
    });
    activeOscillators = {};
    
    // Alle visuellen States entfernen
    document.querySelectorAll('.sound-btn').forEach(btn => {
        btn.classList.remove('playing');
    });
}

// Tastenbelegungen aus LocalStorage laden
function loadKeyMappings() {
    const saved = localStorage.getItem('soundboardKeyMappings');
    if (saved) {
        try {
            keyMappings = JSON.parse(saved);
        } catch (e) {
            console.error('Fehler beim Laden der Tastenbelegungen:', e);
            keyMappings = {};
        }
    }
    
    // Standardbelegungen für Instrumente erstellen, falls nicht vorhanden
    Object.keys(instruments).forEach(instrumentKey => {
        if (!keyMappings[instrumentKey]) {
            keyMappings[instrumentKey] = getDefaultKeyMapping(instrumentKey);
        }
    }
    );
}

// Standardbelegung für ein Instrument (erste 8 Töne)
function getDefaultKeyMapping(instrumentKey) {
    const instrument = instruments[instrumentKey];
    const soundNames = Object.keys(instrument.sounds);
    const mapping = [];
    
    for (let i = 0; i < NUM_KEYS; i++) {
        mapping.push(soundNames[i] || soundNames[0]); // Fallback auf ersten Ton
    }
    
    return mapping;
}

// Tastenbelegungen in LocalStorage speichern
function saveKeyMappings() {
    try {
        localStorage.setItem('soundboardKeyMappings', JSON.stringify(keyMappings));
    } catch (e) {
        console.error('Fehler beim Speichern der Tastenbelegungen:', e);
    }
}

// Instrument laden und Soundboard mit 8 Tasten erstellen
function loadInstrument(instrumentKey) {
    const instrument = instruments[instrumentKey];
    const soundboard = document.getElementById('soundboard');
    
    // Sicherstellen, dass Belegung existiert
    if (!keyMappings[instrumentKey]) {
        keyMappings[instrumentKey] = getDefaultKeyMapping(instrumentKey);
    }
    
    // Soundboard leeren
    soundboard.innerHTML = '';
    
    // Genau 8 Tasten erstellen basierend auf der Belegung
    const mapping = keyMappings[instrumentKey];
    
    for (let i = 0; i < NUM_KEYS; i++) {
        const soundName = mapping[i] || Object.keys(instrument.sounds)[0];
        const btn = document.createElement('button');
        btn.className = 'sound-btn';
        btn.textContent = soundName;
        btn.dataset.sound = soundName;
        btn.dataset.keyIndex = i;
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-label', `Taste ${i + 1}: ${soundName}`);
        
        // Touch und Mouse Events
        btn.addEventListener('touchstart', handleSoundStart, { passive: true });
        btn.addEventListener('touchend', handleSoundEnd, { passive: true });
        btn.addEventListener('touchcancel', handleSoundEnd, { passive: true });
        btn.addEventListener('mousedown', handleSoundStart);
        btn.addEventListener('mouseup', handleSoundEnd);
        btn.addEventListener('mouseleave', handleSoundEnd);
        
        soundboard.appendChild(btn);
    }
}

// Sound Start Handler
function handleSoundStart(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!audioContext) {
        initAudioContext();
    }
    
    const btn = e.currentTarget;
    const soundName = btn.dataset.sound;
    
    playSound(soundName, currentInstrument);
}

// Sound End Handler
function handleSoundEnd(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const btn = e.currentTarget;
    const soundName = btn.dataset.sound;
    
    stopSound(soundName);
}

// Ton abspielen
function playSound(soundName, instrumentKey) {
    if (!audioContext || audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const instrument = instruments[instrumentKey];
    const soundValue = instrument.sounds[soundName];
    const soundId = `${instrumentKey}-${soundName}`;
    
    // Bereits laufenden Ton stoppen
    if (activeOscillators[soundId]) {
        stopSound(soundName);
    }
    
    // Visuelles Feedback
    const btn = document.querySelector(`[data-sound="${soundName}"]`);
    if (btn) {
        btn.classList.add('playing');
    }
    
    // Animation auslösen
    triggerSoundboardAnimation();
    
    // Schlagzeug-Sounds (perkussive Sounds)
    if (soundValue && typeof soundValue === 'object' && soundValue.type === 'drum') {
        playDrumSound(soundValue.freq, soundId);
        return;
    }
    
    // Normale Töne (frequenzbasiert)
    const frequency = typeof soundValue === 'number' ? soundValue : 440;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = instrument.waveType || 'sine';
    oscillator.frequency.value = frequency;
    
    // Envelope für natürlicheren Klang
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(now);
    
    // Speichern für späteres Stoppen
    activeOscillators[soundId] = {
        oscillator: oscillator,
        gainNode: gainNode,
        startTime: now
    };
}

// Schlagzeug-Sound abspielen
function playDrumSound(frequency, soundId) {
    const now = audioContext.currentTime;
    
    // Kurzer perkussiver Sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = frequency;
    
    filter.type = 'lowpass';
    filter.frequency.value = frequency * 3;
    
    // Sehr kurzer, perkussiver Envelope
    gainNode.gain.setValueAtTime(0.6, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 0.15);
    
    // Visuelles Feedback für Schlagzeug
    setTimeout(() => {
        const btn = document.querySelector(`[data-sound="${soundId.split('-')[1]}"]`);
        if (btn) {
            btn.classList.remove('playing');
        }
    }, 150);
}

// Ton stoppen
function stopSound(soundName) {
    const soundId = `${currentInstrument}-${soundName}`;
    
    if (activeOscillators[soundId]) {
        const oscData = activeOscillators[soundId];
        const now = audioContext.currentTime;
        
        // Sanftes Ausblenden
        if (oscData.gainNode && oscData.oscillator) {
            oscData.gainNode.gain.cancelScheduledValues(now);
            oscData.gainNode.gain.setValueAtTime(oscData.gainNode.gain.value, now);
            oscData.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            
            setTimeout(() => {
                try {
                    oscData.oscillator.stop();
                    oscData.oscillator.disconnect();
                    if (oscData.gainNode) {
                        oscData.gainNode.disconnect();
                    }
                } catch (e) {
                    // Ignorieren wenn bereits gestoppt
                }
                delete activeOscillators[soundId];
            }, 100);
        }
    }
    
    // Visuelles Feedback entfernen
    const btn = document.querySelector(`[data-sound="${soundName}"]`);
    if (btn) {
        btn.classList.remove('playing');
    }
}

// Konfigurations-Modal einrichten
function setupConfigurationModal() {
    const configWheel = document.getElementById('configWheel');
    const configModal = document.getElementById('configModal');
    const closeModal = document.getElementById('closeModal');
    const saveConfig = document.getElementById('saveConfig');
    const resetConfig = document.getElementById('resetConfig');
    
    // Modal öffnen
    configWheel.addEventListener('click', () => {
        openConfigurationModal();
    });
    
    // Modal schließen
    closeModal.addEventListener('click', () => {
        closeConfigurationModal();
    });
    
    // Modal schließen bei Klick außerhalb
    configModal.addEventListener('click', (e) => {
        if (e.target === configModal) {
            closeConfigurationModal();
        }
    });
    
    // Speichern-Button
    saveConfig.addEventListener('click', () => {
        saveConfiguration();
        closeConfigurationModal();
    });
    
    // Zurücksetzen-Button
    resetConfig.addEventListener('click', () => {
        resetConfiguration();
    });
    
    // ESC-Taste zum Schließen
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && configModal.classList.contains('active')) {
            closeConfigurationModal();
        }
    });
}

// Konfigurations-Modal öffnen
function openConfigurationModal() {
    const configModal = document.getElementById('configModal');
    const keyPreviewGrid = document.getElementById('keyPreviewGrid');
    const availableSounds = document.getElementById('availableSounds');
    
    // Sicherstellen, dass Belegung existiert
    if (!keyMappings[currentInstrument]) {
        keyMappings[currentInstrument] = getDefaultKeyMapping(currentInstrument);
    }
    
    // Leere Container
    keyPreviewGrid.innerHTML = '';
    availableSounds.innerHTML = '';
    
    const instrument = instruments[currentInstrument];
    const soundNames = Object.keys(instrument.sounds);
    const currentMapping = keyMappings[currentInstrument];
    
    // Neon-Farben für die Taste-Vorlagen
    const previewColors = [
        'var(--neon-cyan)',
        'var(--neon-pink)',
        'var(--neon-green)',
        'var(--neon-blue)',
        'var(--neon-purple)',
        'var(--neon-yellow)',
        'var(--neon-orange)',
        'var(--neon-red)'
    ];
    
    // Erstelle 8 Taste-Vorlagen
    for (let i = 0; i < NUM_KEYS; i++) {
        const keyPreview = document.createElement('div');
        keyPreview.className = 'key-preview';
        keyPreview.dataset.keyIndex = i;
        keyPreview.style.setProperty('--preview-key-color', previewColors[i]);
        
        // Nummer anzeigen
        const number = document.createElement('span');
        number.className = 'key-preview-number';
        number.textContent = i + 1;
        keyPreview.appendChild(number);
        
        // Aktuell zugewiesener Sound anzeigen
        const soundName = currentMapping[i];
        if (soundName) {
            keyPreview.textContent = soundName;
            keyPreview.classList.add('has-sound');
        }
        
        // Drag & Drop Event Listeners
        keyPreview.addEventListener('dragover', handleDragOver);
        keyPreview.addEventListener('drop', handleDrop);
        keyPreview.addEventListener('dragenter', handleDragEnter);
        keyPreview.addEventListener('dragleave', handleDragLeave);
        
        keyPreviewGrid.appendChild(keyPreview);
    }
    
    // Erstelle verfügbare Sounds
    soundNames.forEach(soundName => {
        const soundItem = document.createElement('div');
        soundItem.className = 'sound-item';
        soundItem.textContent = soundName;
        soundItem.draggable = true;
        soundItem.dataset.sound = soundName;
        
        // Drag Event Listeners
        soundItem.addEventListener('dragstart', handleDragStart);
        soundItem.addEventListener('dragend', handleDragEnd);
        
        availableSounds.appendChild(soundItem);
    });
    
    configModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Scrollen verhindern
}

// Drag & Drop Handler
let draggedSound = null;

function handleDragStart(e) {
    draggedSound = e.target.dataset.sound;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedSound);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedSound = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const keyIndex = parseInt(e.currentTarget.dataset.keyIndex);
    const soundName = draggedSound || e.dataTransfer.getData('text/plain');
    
    if (soundName && keyIndex !== undefined) {
        // Update die Taste-Vorlage
        e.currentTarget.textContent = soundName;
        e.currentTarget.classList.add('has-sound');
        
        // Nummer wieder hinzufügen
        const number = document.createElement('span');
        number.className = 'key-preview-number';
        number.textContent = keyIndex + 1;
        e.currentTarget.insertBefore(number, e.currentTarget.firstChild);
    }
}

// Konfigurations-Modal schließen
function closeConfigurationModal() {
    const configModal = document.getElementById('configModal');
    configModal.classList.remove('active');
    document.body.style.overflow = ''; // Scrollen wieder erlauben
}

// Konfiguration speichern
function saveConfiguration() {
    const keyPreviews = document.querySelectorAll('.key-preview');
    const newMapping = [];
    
    keyPreviews.forEach(preview => {
        const keyIndex = parseInt(preview.dataset.keyIndex);
        let soundName = null;
        
        if (preview.classList.contains('has-sound')) {
            // Hole den Sound-Namen (alles außer der Nummer)
            const numberSpan = preview.querySelector('.key-preview-number');
            const fullText = preview.textContent;
            soundName = numberSpan ? fullText.replace(numberSpan.textContent, '').trim() : fullText.trim();
        }
        
        // Fallback auf Standard, falls kein Sound zugewiesen
        newMapping[keyIndex] = soundName || Object.keys(instruments[currentInstrument].sounds)[keyIndex] || 
                               Object.keys(instruments[currentInstrument].sounds)[0];
    });
    
    keyMappings[currentInstrument] = newMapping;
    saveKeyMappings();
    
    // Soundboard neu laden
    loadInstrument(currentInstrument);
}

// Konfiguration zurücksetzen
function resetConfiguration() {
    if (confirm('Möchten Sie die Tastenbelegung wirklich zurücksetzen?')) {
        keyMappings[currentInstrument] = getDefaultKeyMapping(currentInstrument);
        saveKeyMappings();
        openConfigurationModal(); // Modal neu öffnen mit Standardwerten
    }
}

// Partikel-Kugel initialisieren
let particleCanvas = null;
let particleCtx = null;
let particles = [];
let sphereRadius = 120;
let numParticles = 500;
let pulseScale = 1;

// Neon-Farben Array
const neonColors = [
    [77, 208, 225],   // Cyan
    [244, 143, 177],  // Pink
    [129, 199, 132],  // Grün
    [100, 181, 246],  // Blau
    [186, 104, 200],  // Lila
    [255, 241, 118],  // Gelb
    [255, 183, 77],   // Orange
    [229, 115, 115]   // Rot
];

// Initialisiere Partikel-Kugel
function initParticleSphere() {
    particleCanvas = document.getElementById('particleCanvas');
    if (!particleCanvas) return;
    
    particleCtx = particleCanvas.getContext('2d');
    
    // Canvas-Größe basierend auf verfügbarem Platz setzen
    function updateCanvasSize() {
        const container = particleCanvas.parentElement;
        const soundboardContainer = document.querySelector('.soundboard-container');
        
        // Berechne verfügbare Höhe: Viewport-Höhe minus Tasten-Container-Höhe
        const soundboardHeight = soundboardContainer ? soundboardContainer.offsetHeight : 200;
        const availableHeight = window.innerHeight - soundboardHeight - 40; // 40px Padding
        const availableWidth = container.offsetWidth - 40;
        const size = Math.min(availableWidth, availableHeight, 500);
        
        particleCanvas.width = size;
        particleCanvas.height = size;
        
        // Update container padding-bottom dynamisch
        container.style.paddingBottom = `${soundboardHeight + 20}px`;
    }
    
    updateCanvasSize();
    
    // Canvas-Größe bei Window-Resize oder nach Layout-Änderungen anpassen
    window.addEventListener('resize', updateCanvasSize);
    
    // Observer für Änderungen am Soundboard-Container
    if (window.ResizeObserver) {
        const soundboardContainer = document.querySelector('.soundboard-container');
        if (soundboardContainer) {
            const resizeObserver = new ResizeObserver(() => {
                updateCanvasSize();
            });
            resizeObserver.observe(soundboardContainer);
        }
    }
    
    // Partikel erstellen
    particles = [];
    for (let i = 0; i < numParticles; i++) {
        // Gleichmäßige Verteilung auf einer Kugeloberfläche
        const theta = Math.random() * Math.PI * 2; // Azimut-Winkel
        const phi = Math.acos(2 * Math.random() - 1); // Polar-Winkel
        const r = sphereRadius;
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        // Zufällige Farbe aus dem Neon-Farben Array
        const colorIndex = Math.floor(Math.random() * neonColors.length);
        const color = neonColors[colorIndex];
        
        particles.push({
            x: x,
            y: y,
            z: z,
            baseX: x,
            baseY: y,
            baseZ: z,
            color: color,
            size: Math.random() * 2 + 1
        });
    }
    
    // Animations-Loop starten
    animateParticles();
    
    // Warte kurz, bis das Layout vollständig geladen ist, dann Größe aktualisieren
    setTimeout(() => {
        updateCanvasSize();
    }, 100);
}

// Zeichne Partikel-Kugel
function drawParticles() {
    if (!particleCtx || !particleCanvas) return;
    
    // Canvas leeren
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    const centerX = particleCanvas.width / 2;
    const centerY = particleCanvas.height / 2;
    
    // Sortiere Partikel nach Z-Position (für Tiefeneffekt)
    const sortedParticles = [...particles].sort((a, b) => {
        const aZ = a.baseZ * pulseScale;
        const bZ = b.baseZ * pulseScale;
        return bZ - aZ;
    });
    
    // Zeichne jeden Partikel
    sortedParticles.forEach(particle => {
        const x = centerX + particle.baseX * pulseScale;
        const y = centerY + particle.baseY * pulseScale;
        const z = particle.baseZ * pulseScale;
        
        // Perspektive
        const perspective = 200;
        const scale = perspective / (perspective + z);
        const screenX = centerX + (x - centerX) * scale;
        const screenY = centerY + (y - centerY) * scale;
        const screenSize = particle.size * scale;
        
        // Opacity basierend auf Z-Position
        const opacity = Math.max(0.3, Math.min(1, (z + sphereRadius) / (sphereRadius * 2)));
        
        // Zeichne Partikel
        particleCtx.beginPath();
        particleCtx.arc(screenX, screenY, screenSize, 0, Math.PI * 2);
        particleCtx.fillStyle = `rgba(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]}, ${opacity})`;
        particleCtx.fill();
        
        // Glow-Effekt
        particleCtx.shadowBlur = 5;
        particleCtx.shadowColor = `rgba(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]}, 0.8)`;
        particleCtx.fill();
        particleCtx.shadowBlur = 0;
    });
}

// Animations-Loop
function animateParticles() {
    drawParticles();
    
    // Pulse-Effekt langsam zurückführen
    pulseScale = 0.95 * pulseScale + 0.05 * 1;
    
    requestAnimationFrame(animateParticles);
}

// Animation oberhalb der Tasten auslösen
function triggerSoundboardAnimation() {
    const animationEl = document.getElementById('particleSphere');
    if (animationEl) {
        // Pulse-Effekt verstärken
        pulseScale = 1.3;
        
        // CSS-Animation auslösen
        animationEl.classList.remove('pulse');
        setTimeout(() => {
            animationEl.classList.add('pulse');
        }, 10);
        
        // Zurücksetzen nach Animation
        setTimeout(() => {
            animationEl.classList.remove('pulse');
        }, 600);
    }
}

// Keyboard-Unterstützung (optional - nur für Desktop)
let keyboardEnabled = false;

document.addEventListener('keydown', (e) => {
    if (!keyboardEnabled) return;
    
    const instrument = instruments[currentInstrument];
    const sounds = Object.keys(instrument.sounds);
    
    // Mapping: qwertyuiop[] für erste 12 Töne
    const keyMap = 'qwertyuiop[]'.split('');
    const keyIndex = keyMap.indexOf(e.key.toLowerCase());
    
    if (keyIndex !== -1 && keyIndex < sounds.length) {
        e.preventDefault();
        playSound(sounds[keyIndex], currentInstrument);
    }
});

document.addEventListener('keyup', (e) => {
    if (!keyboardEnabled) return;
    
    const instrument = instruments[currentInstrument];
    const sounds = Object.keys(instrument.sounds);
    const keyMap = 'qwertyuiop[]'.split('');
    const keyIndex = keyMap.indexOf(e.key.toLowerCase());
    
    if (keyIndex !== -1 && keyIndex < sounds.length) {
        e.preventDefault();
        stopSound(sounds[keyIndex]);
    }
});

// Keyboard-Hinweis für Desktop-Nutzer
if (window.innerWidth > 768) {
    setTimeout(() => {
        keyboardEnabled = true;
        console.log('Tastatur aktiviert: Verwende Q-P und [] zum Spielen');
    }, 1000);
}

