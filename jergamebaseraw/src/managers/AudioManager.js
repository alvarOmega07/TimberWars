export class AudioManager {
    constructor(scene, musicKey = 'background_music') {
        this.scene = scene;
        this.musicKey = musicKey;
        this.backgroundMusic = null;
        this.effectsVolume = 0.8;
        this.musicVolume = 0.6;

        this.init();
    }

    init() {
        if (this.scene.cache.audio.exists(this.musicKey)) {
            this.backgroundMusic = this.scene.sound.add(this.musicKey, { loop: true });
        }

        this.applyAudioSettings();

        // Escuchar el evento global de cambio de volumen desde el menú de opciones
        this.onAudioSettingsChanged = this.applyAudioSettings.bind(this);
        this.scene.game.events.on('audio-settings-changed', this.onAudioSettingsChanged);

        // Limpiar eventos y detener audio al cerrar la escena
        this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    }

    playMusic() {
        if (!this.backgroundMusic) return;

        if (this.backgroundMusic.isPaused) {
            this.backgroundMusic.resume();
        } else if (!this.backgroundMusic.isPlaying) {
            this.backgroundMusic.play();
        }
    }

    pauseMusic() {
        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
            this.backgroundMusic.pause();
        }
    }

    stopMusic() {
        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
            this.backgroundMusic.stop();
        }
    }

    playSFX(key, config = {}) {
        if (this.scene.cache.audio.exists(key) && this.effectsVolume > 0) {
            const volume = (config.volume !== undefined ? config.volume : 1) * this.effectsVolume;
            this.scene.sound.play(key, { ...config, volume });
        }
    }

    applyAudioSettings(settings) {
        this.musicVolume = settings
            ? settings.musicVolume
            : this.readVolumeSetting('musicVolume', 0.6);
        this.effectsVolume = settings
            ? settings.effectsVolume
            : this.readVolumeSetting('effectsVolume', 0.8);

        if (this.backgroundMusic) {
            this.backgroundMusic.setVolume(this.musicVolume);
        }
    }

    readVolumeSetting(key, fallback) {
        const value = Number.parseFloat(localStorage.getItem(key));
        return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
    }

    destroy() {
        if (this.scene && this.scene.game) {
            this.scene.game.events.off('audio-settings-changed', this.onAudioSettingsChanged);
        }
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic.destroy();
            this.backgroundMusic = null;
        }
    }
}