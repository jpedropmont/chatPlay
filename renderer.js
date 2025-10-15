const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

// ============================================
// STATE MANAGEMENT
// ============================================
let sounds = [];
let currentEffect = 'none';
let micActive = false;
let audioContext = null;
let micStream = null;
let sourceNode = null;
let destinationNode = null;
let youtubeAudio = null;
let youtubeSource = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  initSoundboard();
  initYouTube();
  initVoiceEffects();
  initPlayer(); // Initialize audio player
  await loadConfig();
});

// ============================================
// TAB SYSTEM
// ============================================
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // Update active tab
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      // Update active content
      document.querySelectorAll('.tab-content').forEach((content) => {
        content.classList.remove('active');
      });
      document.getElementById(targetTab).classList.add('active');
    });
  });
}

// ============================================
// SOUNDBOARD
// ============================================
function initSoundboard() {
  const addSoundBtn = document.getElementById('addSoundBtn');
  const sortBtn = document.getElementById('sortSoundsBtn');
  
  addSoundBtn.addEventListener('click', addSound);
  sortBtn.addEventListener('click', sortSounds);

  renderSounds();
}

function sortSounds() {
  sounds.sort((a, b) => a.name.localeCompare(b.name));
  renderSounds();
  saveConfig();
}

async function addSound() {
  const filePath = await ipcRenderer.invoke('select-audio-file');
  if (filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Get default hotkey
    const defaultHotkey = getNextAvailableHotkey();
    
    const sound = {
      id: Date.now(),
      name: fileName,
      path: filePath,
      icon: getRandomIcon(),
      source: 'local',
      hotkey: defaultHotkey
    };

    sounds.push(sound);
    renderSounds();
    saveConfig();
  }
}

// Get next available hotkey
function getNextAvailableHotkey() {
  // Try Shift+F1 through Shift+F12 (works on all keyboards!)
  for (let i = 1; i <= 12; i++) {
    const hotkey = `Shift+F${i}`;
    if (!sounds.find(s => s.hotkey === hotkey)) {
      return hotkey;
    }
  }
  
  // Try Ctrl+Shift+F1-F12
  for (let i = 1; i <= 12; i++) {
    const hotkey = `Ctrl+Shift+F${i}`;
    if (!sounds.find(s => s.hotkey === hotkey)) {
      return hotkey;
    }
  }
  
  // Try Alt+F1-F12
  for (let i = 1; i <= 12; i++) {
    const hotkey = `Alt+F${i}`;
    if (!sounds.find(s => s.hotkey === hotkey)) {
      return hotkey;
    }
  }
  
  // Try Ctrl+Alt+F1-F12
  for (let i = 1; i <= 12; i++) {
    const hotkey = `Ctrl+Alt+F${i}`;
    if (!sounds.find(s => s.hotkey === hotkey)) {
      return hotkey;
    }
  }
  
  // If all taken, return null
  return null;
}

function renderSounds() {
  const soundList = document.getElementById('soundList');

  if (sounds.length === 0) {
    soundList.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
        <p>Nenhum áudio adicionado</p>
        <p class="text-small">Vá para "Adicionar Áudio" para começar</p>
      </div>
    `;
    return;
  }

  soundList.innerHTML = sounds
    .map(
      (sound, index) => {
        const sourceIcon = sound.source === 'youtube' ? '🎵' : '🎵';
        const sourceLabel = sound.source === 'youtube' ? 'YouTube' : 'Local';
        
        return `
    <div class="sound-item" data-id="${sound.id}" draggable="true">
      <div class="sound-item-drag">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.5"/>
          <circle cx="9" cy="12" r="1.5"/>
          <circle cx="9" cy="19" r="1.5"/>
          <circle cx="15" cy="5" r="1.5"/>
          <circle cx="15" cy="12" r="1.5"/>
          <circle cx="15" cy="19" r="1.5"/>
        </svg>
      </div>
      <div class="sound-item-icon">${sound.icon || sourceIcon}</div>
      <div class="sound-item-info">
        <div class="sound-item-name">${sound.name}</div>
        <div class="sound-item-path">${sourceLabel} • ${sound.path.split('\\').pop()}</div>
      </div>
      <div class="sound-item-hotkey ${sound.hotkey ? 'has-hotkey' : ''}" data-sound-id="${sound.id}">
        ${sound.hotkey || 'Atalho'}
      </div>
      <div class="sound-item-actions">
        <button class="sound-item-btn delete" onclick="removeSound(${sound.id}, event)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  `;
      }
    )
    .join('');

  // Add click listeners for playing
  document.querySelectorAll('.sound-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.sound-item-hotkey') && 
          !e.target.closest('.sound-item-actions') &&
          !e.target.closest('.sound-item-drag')) {
        const soundId = parseInt(item.dataset.id);
        playSound(soundId);
      }
    });
  });

  // Add drag and drop listeners
  document.querySelectorAll('.sound-item').forEach((item, index) => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragend', handleDragEnd);
  });

  // Add hotkey listeners
  document.querySelectorAll('.sound-item-hotkey').forEach((hotkeyBtn) => {
    hotkeyBtn.addEventListener('click', () => {
      const soundId = parseInt(hotkeyBtn.dataset.soundId);
      startHotkeyRecording(soundId, hotkeyBtn);
    });
  });
}

// Drag and Drop
let draggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  this.style.opacity = '0.4';
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  return false;
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (draggedElement !== this) {
    const draggedId = parseInt(draggedElement.dataset.id);
    const targetId = parseInt(this.dataset.id);
    
    const draggedIndex = sounds.findIndex(s => s.id === draggedId);
    const targetIndex = sounds.findIndex(s => s.id === targetId);
    
    const [draggedSound] = sounds.splice(draggedIndex, 1);
    sounds.splice(targetIndex, 0, draggedSound);
    
    renderSounds();
    saveConfig();
  }

  return false;
}

function handleDragEnd(e) {
  this.style.opacity = '1';
  draggedElement = null;
}

// Hotkey Recording
let recordingHotkey = false;
let recordingForSoundId = null;

function startHotkeyRecording(soundId, button) {
  if (recordingHotkey) return;
  
  recordingHotkey = true;
  recordingForSoundId = soundId;
  button.classList.add('recording');
  button.textContent = 'Pressione tecla(s)...';
  
  document.addEventListener('keydown', handleHotkeyRecord);
}

function handleHotkeyRecord(e) {
  e.preventDefault();
  
  const sound = sounds.find(s => s.id === recordingForSoundId);
  if (!sound) return;
  
  // Build hotkey string
  let hotkey = '';
  
  // Check for modifiers
  if (e.ctrlKey) hotkey += 'Ctrl+';
  if (e.altKey) hotkey += 'Alt+';
  if (e.shiftKey) hotkey += 'Shift+';
  
  // Get the key - support for special keys
  let key = e.key;
  
  // Numpad keys
  if (e.code.startsWith('Numpad')) {
    key = e.code.replace('Numpad', 'Num');
  }
  // Function keys
  else if (key.startsWith('F') && key.length <= 3) {
    key = key; // F1-F24
  }
  // Regular keys
  else if (key.length === 1) {
    key = key.toUpperCase();
  }
  
  hotkey += key;
  
  // Save hotkey
  sound.hotkey = hotkey;
  
  // Stop recording
  recordingHotkey = false;
  recordingForSoundId = null;
  document.removeEventListener('keydown', handleHotkeyRecord);
  
  renderSounds();
  saveConfig();
}

// Global hotkey listener (for when app is in focus)
document.addEventListener('keydown', (e) => {
  if (recordingHotkey) return;
  
  // Build pressed hotkey
  let pressedHotkey = '';
  if (e.ctrlKey) pressedHotkey += 'Ctrl+';
  if (e.altKey) pressedHotkey += 'Alt+';
  if (e.shiftKey) pressedHotkey += 'Shift+';
  
  // Get the key
  let key = e.key;
  if (e.code.startsWith('Numpad')) {
    key = e.code.replace('Numpad', 'Num');
  } else if (key.startsWith('F') && key.length <= 3) {
    key = key;
  } else if (key.length === 1) {
    key = key.toUpperCase();
  }
  
  pressedHotkey += key;
  
  const sound = sounds.find(s => s.hotkey === pressedHotkey);
  if (sound) {
    e.preventDefault();
    playSound(sound.id);
  }
});

async function playSound(soundId, fromHotkey = false) {
  const sound = sounds.find((s) => s.id === soundId);
  if (!sound) return;

  const item = document.querySelector(`.sound-item[data-id="${soundId}"]`);

  // If triggered by hotkey, play ONLY this sound (no playlist)
  if (fromHotkey) {
    playlist = [sound]; // Only this sound
    currentPlaylistIndex = 0;
  } else {
    // If clicked, play with full playlist
    playlist = sounds;
    currentPlaylistIndex = sounds.findIndex((s) => s.id === soundId);
  }

  // Remove playing class from all
  document
    .querySelectorAll('.sound-item, .sound-btn')
    .forEach((c) => c.classList.remove('playing'));

  // Add playing class
  if (item) {
    item.classList.add('playing');
  }

  // Play in player bar
  playInPlayer(sound.path, sound.name, 'Soundboard', fromHotkey);
}

async function removeSound(soundId, event) {
  if (event) {
    event.stopPropagation();
  }
  
  const sound = sounds.find(s => s.id === soundId);
  if (!sound) return;
  
  // If it's a YouTube audio, delete the file too
  if (sound.source === 'youtube') {
    const filename = sound.path.split('\\').pop();
    await ipcRenderer.invoke('delete-youtube-audio', filename);
  }
  
  sounds = sounds.filter((s) => s.id !== soundId);
  renderSounds();
  saveConfig();
}

function getRandomIcon() {
  const icons = [
    '🎵',
    '🎶',
    '🎸',
    '🎹',
    '🥁',
    '🎺',
    '🎷',
    '🎤',
    '🔊',
    '📻',
    '💿',
    '🎧',
    '🎬',
    '🎮',
    '⚡',
    '🔥',
    '💥',
    '✨',
    '🎉',
    '🎊',
  ];
  return icons[Math.floor(Math.random() * icons.length)];
}

// ============================================
// YOUTUBE DOWNLOADER
// ============================================
function initYouTube() {
  const downloadBtn = document.getElementById('downloadYoutubeBtn');
  downloadBtn.addEventListener('click', downloadYouTube);
  
  // Load existing downloads and add to soundboard
  loadYouTubeSounds();
}

async function downloadYouTube() {
  const urlInput = document.getElementById('youtubeUrl');
  const url = urlInput.value.trim();

  if (!url) {
    showStatus('Por favor, cole um link do YouTube', 'error');
    return;
  }

  // Validate YouTube URL
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    showStatus('URL inválida. Use um link do YouTube.', 'error');
    return;
  }

  showStatus('📥 Baixando áudio do YouTube...', 'info');

  try {
    // Listen for progress updates
    ipcRenderer.on('youtube-progress', (event, progress) => {
      showStatus(`📥 Baixando: ${progress.toFixed(0)}%`, 'info');
    });

    // Download audio
    const result = await ipcRenderer.invoke('download-youtube-audio', url);

    if (result.success) {
      // Get default hotkey
      const defaultHotkey = getNextAvailableHotkey();
      
      // Create sound object with title from YouTube
      const sound = {
        id: Date.now(),
        name: result.title || 'YouTube Audio',
        path: result.path,
        icon: '🎵',
        source: 'youtube',
        hotkey: defaultHotkey
      };
      
      sounds.push(sound);
      renderSounds();
      saveConfig();
      
      showStatus('✅ Áudio baixado! Disponível no Soundboard.', 'success');
      
      // Clear input
      urlInput.value = '';
      
      // Switch to soundboard tab
      setTimeout(() => {
        document.querySelector('.tab[data-tab="soundboard"]').click();
      }, 1500);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('YouTube download error:', error);
    showStatus(`❌ Erro: ${error.message}`, 'error');
  } finally {
    // Remove progress listener
    ipcRenderer.removeAllListeners('youtube-progress');
  }
}

function showStatus(message, type) {
  const statusEl = document.getElementById('youtubeStatus');
  statusEl.textContent = message;
  statusEl.className = 'status-message';

  if (message) {
    statusEl.classList.add('show', type);
  }
}

// ============================================
// LOAD YOUTUBE SOUNDS INTO SOUNDBOARD
// ============================================
async function loadYouTubeSounds() {
  const result = await ipcRenderer.invoke('list-youtube-audios');
  
  if (result.success && result.audios.length > 0) {
    // Add YouTube audios to sounds array if not already there
    result.audios.forEach(ytAudio => {
      const exists = sounds.find(s => s.path === ytAudio.path);
      if (!exists) {
        const sound = {
          id: Date.now() + Math.random(), // Unique ID
          name: ytAudio.name,
          path: ytAudio.path,
          icon: '🎵',
          source: 'youtube',
          hotkey: getNextAvailableHotkey() // Add default hotkey
        };
        sounds.push(sound);
      }
    });
    
    renderSounds();
    saveConfig();
  }
}

// ============================================
// VOICE EFFECTS
// ============================================
function initVoiceEffects() {
  const toggleMicBtn = document.getElementById('toggleMicBtn');
  const effectCards = document.querySelectorAll('.effect-card');

  toggleMicBtn.addEventListener('click', toggleMicrophone);

  effectCards.forEach((card) => {
    card.addEventListener('click', () => {
      const effect = card.dataset.effect;
      selectEffect(effect);
    });
  });
}

async function toggleMicrophone() {
  if (micActive) {
    stopMicrophone();
  } else {
    await startMicrophone();
  }
}

async function startMicrophone() {
  try {
    // Initialize audio context
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Get microphone stream
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    // Create audio nodes
    sourceNode = audioContext.createMediaStreamSource(micStream);
    destinationNode = audioContext.createMediaStreamDestination();

    // Apply initial effect
    applyEffect(currentEffect);

    // Update UI
    micActive = true;
    document.getElementById('toggleMicBtn').innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="1" y1="1" x2="23" y2="23"/>
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
      Desligar Microfone
    `;
    document.getElementById('toggleMicBtn').style.background = '#ea4335';
    document.getElementById('micIndicator').classList.add('active');
    document.getElementById('micStatus').textContent = 'Microfone: Ativo';
  } catch (error) {
    console.error('Microphone error:', error);
    alert('Erro ao acessar microfone. Verifique as permissões.');
  }
}

function stopMicrophone() {
  if (micStream) {
    micStream.getTracks().forEach((track) => track.stop());
    micStream = null;
  }

  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }

  micActive = false;
  document.getElementById('toggleMicBtn').innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
    Ativar Microfone
  `;
  document.getElementById('toggleMicBtn').style.background = '';
  document.getElementById('micIndicator').classList.remove('active');
  document.getElementById('micStatus').textContent = 'Microfone: Desligado';
}

function selectEffect(effect) {
  currentEffect = effect;

  // Update UI
  document.querySelectorAll('.effect-card').forEach((card) => {
    card.classList.remove('active');
  });
  document
    .querySelector(`.effect-card[data-effect="${effect}"]`)
    .classList.add('active');

  // Apply effect if mic is active
  if (micActive && sourceNode) {
    applyEffect(effect);
  }
}

function applyEffect(effect) {
  if (!sourceNode || !audioContext) return;

  // Disconnect previous connections
  sourceNode.disconnect();

  // Create effect chain
  let currentNode = sourceNode;

  switch (effect) {
    case 'chipmunk':
      // Higher pitch (simulated with playback rate)
      const chipmunkGain = audioContext.createGain();
      chipmunkGain.gain.value = 1.2;
      currentNode.connect(chipmunkGain);
      chipmunkGain.connect(audioContext.destination);
      break;

    case 'deep':
      // Lower pitch
      const deepGain = audioContext.createGain();
      deepGain.gain.value = 0.8;
      currentNode.connect(deepGain);
      deepGain.connect(audioContext.destination);
      break;

    case 'robot':
      // Robotic effect with bit crusher simulation
      const robotGain = audioContext.createGain();
      robotGain.gain.value = 0.7;
      const robotFilter = audioContext.createBiquadFilter();
      robotFilter.type = 'bandpass';
      robotFilter.frequency.value = 1000;
      currentNode.connect(robotFilter);
      robotFilter.connect(robotGain);
      robotGain.connect(audioContext.destination);
      break;

    case 'tremolo':
      // Tremolo effect
      const tremoloGain = audioContext.createGain();
      const tremoloLFO = audioContext.createOscillator();
      tremoloLFO.frequency.value = 5; // 5 Hz tremolo
      const tremoloDepth = audioContext.createGain();
      tremoloDepth.gain.value = 0.5;
      tremoloLFO.connect(tremoloDepth);
      tremoloDepth.connect(tremoloGain.gain);
      currentNode.connect(tremoloGain);
      tremoloGain.connect(audioContext.destination);
      tremoloLFO.start();
      break;

    case 'echo':
      // Echo/delay effect
      const echoDelay = audioContext.createDelay();
      echoDelay.delayTime.value = 0.3;
      const echoGain = audioContext.createGain();
      echoGain.gain.value = 0.5;
      currentNode.connect(audioContext.destination);
      currentNode.connect(echoDelay);
      echoDelay.connect(echoGain);
      echoGain.connect(audioContext.destination);
      echoGain.connect(echoDelay);
      break;

    case 'none':
    default:
      // No effect, direct connection
      currentNode.connect(audioContext.destination);
      break;
  }
}

// ============================================
// CONFIG MANAGEMENT
// ============================================
async function saveConfig() {
  const config = {
    sounds: sounds,
    currentEffect: currentEffect,
  };

  await ipcRenderer.invoke('save-config', config);
  
  // Register global shortcuts
  await ipcRenderer.invoke('register-global-shortcuts', sounds);
}

async function loadConfig() {
  const config = await ipcRenderer.invoke('load-config');

  if (config) {
    sounds = config.sounds || [];
    currentEffect = config.currentEffect || 'none';

    renderSounds();

    if (currentEffect !== 'none') {
      document
        .querySelector(`.effect-card[data-effect="${currentEffect}"]`)
        ?.classList.add('active');
    }
    
    // Register global shortcuts after loading
    await ipcRenderer.invoke('register-global-shortcuts', sounds);
  }
}

// Listen for global hotkey triggers
ipcRenderer.on('trigger-hotkey', (event, soundId) => {
  playSound(soundId, true); // true = fromHotkey
});

// ============================================
// AUDIO PLAYER BAR
// ============================================
let playerBar = null;
let currentPlayingSound = null;
let playlist = [];
let currentPlaylistIndex = -1;

function initPlayer() {
  playerBar = document.getElementById('audioPlayerBar');
  const audioPlayer = document.getElementById('audioPlayer');
  const playBtn = document.getElementById('playerPlayBtn');
  const stopBtn = document.getElementById('playerStopBtn');
  const prevBtn = document.getElementById('playerPrevBtn');
  const nextBtn = document.getElementById('playerNextBtn');
  const volumeSlider = document.getElementById('playerVolume');
  const volumeValue = document.getElementById('playerVolumeValue');
  const progressBar = document.querySelector('.progress-bar');
  
  // Play/Pause
  playBtn.addEventListener('click', togglePlayPause);
  
  // Stop
  stopBtn.addEventListener('click', () => {
    stopPlayer();
  });
  
  // Previous/Next
  prevBtn.addEventListener('click', playPrevious);
  nextBtn.addEventListener('click', playNext);
  
  // Volume
  volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value;
    volumeValue.textContent = `${volume}%`;
    audioPlayer.volume = volume / 100;
  });
  
  // Progress bar click
  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioPlayer.currentTime = audioPlayer.duration * percent;
  });
  
  // Audio events
  audioPlayer.addEventListener('timeupdate', updateProgress);
  audioPlayer.addEventListener('ended', () => {
    // Only play next if playlist has more than 1 item (not from hotkey)
    if (playlist.length > 1) {
      playNext();
    } else {
      stopPlayer();
    }
  });
  audioPlayer.addEventListener('loadedmetadata', () => {
    updateDuration();
  });
}

function showPlayer(title, subtitle = '') {
  const playerTitle = document.getElementById('playerTitle');
  const playerSubtitle = document.getElementById('playerSubtitle');
  
  playerTitle.textContent = title;
  playerSubtitle.textContent = subtitle || 'Tocando agora...';
  
  playerBar.classList.remove('hidden');
  playerBar.classList.add('visible');
}

function hidePlayer() {
  playerBar.classList.remove('visible');
  setTimeout(() => {
    playerBar.classList.add('hidden');
  }, 300);
}

function togglePlayPause() {
  const audioPlayer = document.getElementById('audioPlayer');
  const playBtn = document.getElementById('playerPlayBtn');
  
  if (audioPlayer.paused) {
    audioPlayer.play();
    playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  } else {
    audioPlayer.pause();
    playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  }
}

function stopPlayer() {
  const audioPlayer = document.getElementById('audioPlayer');
  const playBtn = document.getElementById('playerPlayBtn');
  
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  
  document.querySelectorAll('.sound-card, .sound-btn').forEach((c) => c.classList.remove('playing'));
  
  hidePlayer();
  currentPlayingSound = null;
}

function playPrevious() {
  if (playlist.length === 0) return;
  
  currentPlaylistIndex--;
  if (currentPlaylistIndex < 0) {
    currentPlaylistIndex = playlist.length - 1;
  }
  
  const sound = playlist[currentPlaylistIndex];
  playInPlayer(sound.path, sound.name);
}

function playNext() {
  if (playlist.length === 0) return;
  
  currentPlaylistIndex++;
  if (currentPlaylistIndex >= playlist.length) {
    currentPlaylistIndex = 0;
  }
  
  const sound = playlist[currentPlaylistIndex];
  playInPlayer(sound.path, sound.name);
}

function updateProgress() {
  const audioPlayer = document.getElementById('audioPlayer');
  const progressFill = document.getElementById('playerProgress');
  const currentTimeEl = document.getElementById('playerCurrentTime');
  
  if (audioPlayer.duration) {
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressFill.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
  }
}

function updateDuration() {
  const audioPlayer = document.getElementById('audioPlayer');
  const durationEl = document.getElementById('playerDuration');
  
  if (audioPlayer.duration) {
    durationEl.textContent = formatTime(audioPlayer.duration);
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function playInPlayer(filePath, title, subtitle = '') {
  const audioPlayer = document.getElementById('audioPlayer');
  const playBtn = document.getElementById('playerPlayBtn');
  
  audioPlayer.src = filePath;
  audioPlayer.volume = document.getElementById('playerVolume').value / 100;
  audioPlayer.play();
  
  playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  
  showPlayer(title, subtitle);
  currentPlayingSound = filePath;
}
