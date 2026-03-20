// src/view/components/TrackCard/TrackCard.ts
import { el } from 'redom';
import { Track } from '../../../types/app.types';
import './TrackCard.css';

export interface TrackCardProps {
  track: Track;
  number: number;
  onPlay: (track: Track) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (trackId: string) => void;
}

export class TrackCard {
  el: HTMLElement;
  private track: Track;
  private isFavorite: boolean;
  private onToggleFavorite?: (trackId: string) => void;

  constructor({ track, number, onPlay, isFavorite = false, onToggleFavorite }: TrackCardProps) {
    this.track = track;
    this.isFavorite = isFavorite;
    this.onToggleFavorite = onToggleFavorite;
    
    this.el = el('div.track-card',
      // Номер трека
      el('div.track-card__number', number.toString()),
      
      // Обложка
      el('div.track-card__cover',
        track.coverUrl 
          ? el('img.track-card__image', { 
              src: track.coverUrl, 
              alt: track.title,
              loading: 'lazy'
            })
          : el('div.track-card__placeholder', '🎵')
      ),
      
      // Информация: название + артист
      el('div.track-card__info',
        el('h3.track-card__title', track.title),
        el('p.track-card__artist', track.artist)
      ),
      
      // Альбом
      el('div.track-card__album', track.album || '—'),
      
      // Дата добавления
      el('div.track-card__date', this.formatDate(track.uploadedAt)),
      
      // Кнопка избранного
      el('button.track-card__favorite' + (isFavorite ? ' track-card__favorite--active' : ''), 
        { 
          'data-track-id': track.id,
          'title': isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'
        },
        isFavorite ? '❤️' : '♡'
      ),
      
      // Длительность
      el('div.track-card__duration', this.formatDuration(track.duration)),
      
      // Меню
      el('button.track-card__menu', { 'title': 'Ещё' }, '⋯')
    );
    
    // Клик по карточке = воспроизведение (кроме кнопок)
    this.el.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const isButton = target.closest('button');
      
      if (!isButton) {
        onPlay(track);
      }
    });
    
    // Обработчик кнопки избранного
    const favBtn = this.el.querySelector('.track-card__favorite');
    if (favBtn && onToggleFavorite) {
      favBtn.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        this.toggleFavorite();
      });
    }
  }
  
  /**
   * Переключение статуса избранного
   */
  private async toggleFavorite(): Promise<void> {
    if (!this.onToggleFavorite) return;
    
    // Сразу меняем визуальное состояние для отзывчивости
    this.isFavorite = !this.isFavorite;
    this.updateVisualFavorite();
    
    // Вызываем колбэк для обновления состояния в родителе
    this.onToggleFavorite(this.track.id);
  }
  
  /**
   * Обновление визуального состояния кнопки избранного
   */
  private updateVisualFavorite(): void {
    const btn = this.el.querySelector('.track-card__favorite');
    if (btn) {
      btn.classList.toggle('track-card__favorite--active', this.isFavorite);
      btn.textContent = this.isFavorite ? '❤️' : '♡';
      btn.setAttribute('title', this.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное');
    }
  }
  
  /**
   * Публичный метод для обновления статуса (извне)
   */
  updateFavorite(isFavorite: boolean): void {
    this.isFavorite = isFavorite;
    this.updateVisualFavorite();
  }
  
  /**
   * Форматирование даты загрузки трека
   */
  private formatDate(dateString?: string): string {
    if (!dateString) return '7 дней назад';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'сегодня';
      if (diffDays === 1) return 'вчера';
      if (diffDays < 7) return `${diffDays} ${this.declension(diffDays, ['день', 'дня', 'дней'])} назад`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${this.declension(Math.floor(diffDays / 7), ['неделя', 'недели', 'недель'])} назад`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} ${this.declension(Math.floor(diffDays / 30), ['месяц', 'месяца', 'месяцев'])} назад`;
      
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return '—';
    }
  }
  
  /**
   * Форматирование длительности трека
   */
  private formatDuration(seconds?: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  /**
   * Склонение русских слов (день/дня/дней)
   */
  private declension(number: number, titles: string[]): string {
    const cases = [2, 0, 1, 1, 1, 2];
    return titles[
      (number % 100 > 4 && number % 100 < 20) 
        ? 2 
        : cases[(number % 10 < 5) ? number % 10 : 5]
    ];
  }
  
  /**
   * Обновление данных трека (если нужно)
   */
  updateTrack(track: Track): void {
    this.track = track;
    
    const titleEl = this.el.querySelector('.track-card__title');
    const artistEl = this.el.querySelector('.track-card__artist');
    const albumEl = this.el.querySelector('.track-card__album');
    const durationEl = this.el.querySelector('.track-card__duration');
    
    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
    if (albumEl) albumEl.textContent = track.album || '—';
    if (durationEl) durationEl.textContent = this.formatDuration(track.duration);
  }
  
  /**
   * Выделение карточки как текущей (воспроизводится)
   */
  setActive(isActive: boolean): void {
    if (isActive) {
      this.el.classList.add('track-card--playing');
    } else {
      this.el.classList.remove('track-card--playing');
    }
  }
  
  /**
   * Получение данных трека
   */
  getTrack(): Track {
    return this.track;
  }
}