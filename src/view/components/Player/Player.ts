import { el } from 'redom';
import { Track } from '../../../types/app.types';
import './Player.css';

export class Player {
  el: HTMLElement;
  private audio: HTMLAudioElement;
  private currentTrack: Track | null = null;
  private currentTrackIndex: number = -1;
  private tracks: Track[] = [];
  private isPlaying: boolean = false;
  private volume: number = 0.7;
  
  // DOM элементы
  private titleEl: HTMLElement;
  private artistEl: HTMLElement;
  private coverEl: HTMLImageElement;
  private placeholderEl: HTMLElement;
  private playBtn: HTMLButtonElement;
  private prevBtn: HTMLButtonElement;
  private nextBtn: HTMLButtonElement;
  private progressBar: HTMLElement;
  private progressFill: HTMLElement;
  private currentTimeEl: HTMLElement;
  private durationEl: HTMLElement;
  private volumeBtn: HTMLButtonElement;
  private volumeBar: HTMLElement;
  private volumeFill: HTMLElement;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.volume = this.volume;
    
    // Создаём элементы
    this.coverEl = el('img.player__image', { 
      src: '', 
      alt: 'Cover',
      style: 'display: none;'
    }) as HTMLImageElement;
    
    this.placeholderEl = el('div.player__placeholder', '🎵');
    
    this.titleEl = el('div.player__title', 'Выберите трек для воспроизведения');
    this.artistEl = el('div.player__artist', '');
    this.currentTimeEl = el('span.player__time-current', '0:00');
    this.durationEl = el('span.player__time-total', '0:00');
    
    this.progressBar = el('div.player__progress-bar');
    this.progressFill = el('div.player__progress-fill');
    this.progressBar.appendChild(this.progressFill);
    
    this.playBtn = el('button.player__control.player__control--play', '▶') as HTMLButtonElement;
    this.prevBtn = el('button.player__control.player__control--prev', '⏮') as HTMLButtonElement;
    this.nextBtn = el('button.player__control.player__control--next', '⏭') as HTMLButtonElement;
    
    this.volumeBtn = el('button.player__volume-btn', { title: 'Громкость' }, '🔊') as HTMLButtonElement;
    this.volumeBar = el('div.player__volume-bar');
    this.volumeFill = el('div.player__volume-fill', { style: `width: ${this.volume * 100}%` });
    this.volumeBar.appendChild(this.volumeFill);

    // Собираем структуру
    this.el = el('footer.player.main-layout__player',
      el('div.player__left',
        el('div.player__cover',
          this.coverEl,
          this.placeholderEl
        ),
        el('div.player__info',
          this.titleEl,
          this.artistEl
        )
      ),
      el('div.player__center',
        el('div.player__controls',
          this.prevBtn,
          this.playBtn,
          this.nextBtn
        ),
        el('div.player__progress',
          this.currentTimeEl,
          this.progressBar,
          this.durationEl
        )
      ),
      el('div.player__right',
        el('div.player__volume',
          this.volumeBtn,
          this.volumeBar
        )
      )
    );
    
    this.setupEventListeners();
  }
  
  /**
   * Настройка обработчиков событий
   */
  private setupEventListeners(): void {
    // Кнопки управления
    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.prevBtn.addEventListener('click', () => this.playPrevious());
    this.nextBtn.addEventListener('click', () => this.playNext());
    
    // Прогресс-бар
    this.progressBar.addEventListener('click', (e: Event) => this.seek(e));
    
    // Громкость
    this.volumeBtn.addEventListener('click', () => this.toggleMute());
    this.volumeBar.addEventListener('click', (e: MouseEvent) => this.setVolume(e));
    
    // ✅ ПЕРЕМОТКА КЛАВИАТУРОЙ (Shift + ←/→)
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      // Shift + Стрелка влево: перемотка назад на 10 сек
      if (e.key === 'ArrowLeft' && e.shiftKey) {
        e.preventDefault();
        this.rewind(-10);
        console.log('⏪ Rewind -10s');
      }
      
      // Shift + Стрелка вправо: перемотка вперёд на 10 сек
      if (e.key === 'ArrowRight' && e.shiftKey) {
        e.preventDefault();
        this.rewind(10);
        console.log('⏩ Rewind +10s');
      }
      
      // Пробел: пауза/воспроизведение
      if (e.key === ' ' && !e.target) {
        e.preventDefault();
        this.togglePlay();
      }
    });
    
    // События аудио
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
    this.audio.addEventListener('ended', () => this.onTrackEnded());
    this.audio.addEventListener('error', (e) => this.onAudioError(e));
  }
  
  /**
   * Установка списка треков для навигации
   */
  setTracks(tracks: Track[]): void {
    this.tracks = tracks;
  }
  
  /**
   * Воспроизведение трека
   */
  playTrack(track: Track, index: number): void {
    this.currentTrack = track;
    this.currentTrackIndex = index;
    
    // Обновляем обложку
    if (track.coverUrl) {
      this.coverEl.src = track.coverUrl;
      this.coverEl.style.display = 'block';
      this.placeholderEl.style.display = 'none';
    } else {
      this.coverEl.style.display = 'none';
      this.placeholderEl.style.display = 'flex';
      this.placeholderEl.textContent = track.artist ? track.artist.substring(0, 2).toUpperCase() : '🎵';
    }
    
    // Обновляем информацию
    this.titleEl.textContent = track.title || 'Без названия';
    this.artistEl.textContent = track.artist || 'Неизвестный артист';
    
    // Устанавливаем источник аудио
    if (track.audioUrl) {
      this.audio.src = track.audioUrl;
    } else {
      this.audio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    }
    
    this.isPlaying = true;
    this.updatePlayButton();
    
    this.audio.play().catch(err => {
      console.error('Playback error:', err);
      this.isPlaying = false;
      this.updatePlayButton();
    });
    
    // Отправляем событие о смене трека
    this.el.dispatchEvent(new CustomEvent('trackchange', {
      detail: { track: this.currentTrack, index: this.currentTrackIndex },
      bubbles: true
    }));
  }
  
  /**
   * Переключение воспроизведения
   */
  togglePlay(): void {
    if (!this.currentTrack) return;
    
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play().catch(err => console.error('Play error:', err));
    }
    this.isPlaying = !this.isPlaying;
    this.updatePlayButton();
  }
  
  /**
   * Следующий трек
   */
  playNext(): void {
    if (this.tracks.length === 0) return;
    
    const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    const nextTrack = this.tracks[nextIndex];
    this.playTrack(nextTrack, nextIndex);
  }
  
  /**
   * Предыдущий трек
   */
  playPrevious(): void {
    if (this.tracks.length === 0) return;
    
    const prevIndex = this.currentTrackIndex === -1 
      ? 0 
      : (this.currentTrackIndex === 0 ? this.tracks.length - 1 : this.currentTrackIndex - 1);
    const prevTrack = this.tracks[prevIndex];
    this.playTrack(prevTrack, prevIndex);
  }
  
  /**
   * ✅ ПЕРЕМОТКА НА ±10 СЕКУНД
   */
  private rewind(seconds: number): void {
    if (!this.audio.duration) return;
    
    const newTime = this.audio.currentTime + seconds;
    this.audio.currentTime = Math.max(0, Math.min(newTime, this.audio.duration));
    this.updateProgress();
  }
  
  /**
   * Перемотка по клику на прогресс-бар
   */
  seek(e: Event): void {
    if (!this.audio.duration) return;
    
    const rect = this.progressBar.getBoundingClientRect();
    const x = (e as MouseEvent).clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    
    this.audio.currentTime = percentage * this.audio.duration;
    this.updateProgress();
  }
  
  /**
   * Установка громкости
   */
  setVolume(e: MouseEvent): void {
    const rect = this.volumeBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    
    this.volume = percentage;
    this.audio.volume = percentage;
    this.volumeFill.style.width = `${percentage * 100}%`;
    this.updateVolumeIcon();
  }
  
  /**
   * Вкл/выкл звук
   */
  toggleMute(): void {
    if (this.audio.volume > 0) {
      this.audio.dataset.prevVolume = String(this.audio.volume);
      this.audio.volume = 0;
      this.volumeFill.style.width = '0%';
    } else {
      const prevVolume = parseFloat(this.audio.dataset.prevVolume || '0.7');
      this.audio.volume = prevVolume;
      this.volume = prevVolume;
      this.volumeFill.style.width = `${prevVolume * 100}%`;
    }
    this.updateVolumeIcon();
  }
  
  /**
   * Обновление иконки громкости
   */
  private updateVolumeIcon(): void {
    if (this.audio.volume === 0) {
      this.volumeBtn.textContent = '🔇';
    } else if (this.audio.volume < 0.5) {
      this.volumeBtn.textContent = '🔉';
    } else {
      this.volumeBtn.textContent = '🔊';
    }
  }
  
  /**
   * Обновление кнопки play/pause
   */
  private updatePlayButton(): void {
    this.playBtn.textContent = this.isPlaying ? '⏸' : '▶';
    this.playBtn.classList.toggle('player__control--playing', this.isPlaying);
  }
  
  /**
   * Обновление прогресс-бара
   */
  private updateProgress(): void {
    if (this.audio.duration && !isNaN(this.audio.duration)) {
      const progress = (this.audio.currentTime / this.audio.duration) * 100;
      this.progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
    }
  }
  
  /**
   * Обновление длительности
   */
  private updateDuration(): void {
    if (this.audio.duration && !isNaN(this.audio.duration)) {
      this.durationEl.textContent = this.formatTime(this.audio.duration);
    }
  }
  
  /**
   * Обработчик конца трека
   */
  private onTrackEnded(): void {
    this.isPlaying = false;
    this.updatePlayButton();
    this.playNext();
  }
  
  /**
   * Обработчик ошибки аудио
   */
  private onAudioError(e?: Event): void {
    console.error('Audio playback error:', e);
    console.log('Current src:', this.audio.src);
    this.isPlaying = false;
    this.updatePlayButton();
  }
  
  /**
   * Форматирование времени
   */
  private formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  /**
   * Получение текущего трека
   */
  getCurrentTrack(): Track | null {
    return this.currentTrack;
  }
  
  /**
   * Проверка, воспроизводится ли трек
   */
  isPlayingTrack(): boolean {
    return this.isPlaying;
  }
}