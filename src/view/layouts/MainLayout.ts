import { el, setChildren } from 'redom';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { Header } from '../components/Header/Header';
import { Player } from '../components/Player/Player';
import { Profile } from '../components/Profile/Profile';
import { Pagination } from '../components/Pagination/Pagination';
import { TrackCard } from '../components/TrackCard/TrackCard';
import { PageName, Track } from '../../types/app.types';
import { ApiService } from '../../services/api';

// Локальный интерфейс для статистики профиля
interface ProfileStats {
  tracksCount: number;
  favoritesCount: number;
  listeningTime?: string;
}

export class MainLayout {
  el!: HTMLElement; 
  private sidebar: Sidebar;
  private header: Header;
  private player: Player;
  private profile: Profile | null = null;
  private pagination: Pagination | null = null;
  private content: HTMLElement;
  private onNavigate: (page: PageName) => void;
  private tracks: Track[] = [];
  private favorites: Set<string> = new Set();
  private trackCards: Map<string, TrackCard> = new Map();
  private currentPage: PageName = 'tracks';
  private currentPageNum: number = 1;
  private tracksPerPage: number = 10;
  private totalTracks: number = 0;
  private activeTrackId: string | null = null;

  constructor(onNavigate: (page: PageName) => void) {
  this.onNavigate = onNavigate;
  
  this.sidebar = new Sidebar(this.onNavigate);
  this.header = new Header({
    onSearch: (query: string) => this.handleSearch(query),
    onProfileClick: () => this.onNavigate('profile'),
    username: this.getUsernameFromToken()
  });
  this.player = new Player();
  this.content = el('main.main-layout__content');
  
 this.el = el('div.main-layout',
  el('div.main-layout__wrapper',
    this.sidebar.el,
    el('div.main-layout__main',
      this.header.el,
      this.content,
      this.player.el
    )
  )
);

  
  // Подписка на событие trackchange
  this.player.el.addEventListener('trackchange', ((e: Event) => {
    const customEvent = e as CustomEvent<{ track: Track; index: number }>;
    const { track } = customEvent.detail;
    if (track?.id) {
      this.setActiveTrack(track.id);
    }
  }) as EventListener);
  
  this.setupInfiniteScroll();
  this.loadTracks();
}
  
  /**
   * Получение имени пользователя из токена
   */
  private getUsernameFromToken(): string {
    try {
      const token = ApiService.getToken();
      if (!token) return 'Гость';
      
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.username || 'Пользователь';
    } catch {
      return 'Пользователь';
    }
  }
  
  /**
   * Загрузка списка всех треков с бэкенда (с пагинацией)
   */
  private async loadTracks(page: number = 1): Promise<void> {
    console.log(`🔄 Loading tracks (page ${page})...`);
    this.content.innerHTML = '<div style="padding:40px;text-align:center;color:var(--color-text-muted)">Загрузка треков...</div>';
    
    try {
      const token = ApiService.getToken();
      console.log('🔑 Token present:', !!token);
      
      const response = await ApiService.getTracks(page, this.tracksPerPage);
      const { tracks, pagination } = response;
      
      console.log('📦 Tracks received:', tracks.length);
      console.log('📊 Pagination:', pagination);
      
      this.tracks = tracks;
      this.currentPageNum = pagination.page;
      this.totalTracks = pagination.total;
      
      this.player.setTracks(this.tracks);
      
      if (tracks.length === 0) {
        this.content.textContent = 'Список треков пуст 🎵';
        return;
      }
      
      this.renderTracks();
      this.renderPagination(pagination);
      await this.loadFavorites();
      
    } catch (error) {
      console.error('❌ Error loading tracks:', error);
      this.content.innerHTML = `
        <div style="padding:40px;text-align:center;color:var(--color-error)">
          <strong>Ошибка загрузки треков</strong><br>
          <small>${error instanceof Error ? error.message : 'Неизвестная ошибка'}</small><br>
          <button id="retryBtn" style="margin-top:16px;padding:10px 20px;background:var(--color-primary);color:white;border:none;border-radius:var(--radius-md);cursor:pointer;font-family:inherit;font-size:var(--font-size-base)">
            Попробовать снова
          </button>
        </div>
      `;
      
      const retryBtn = document.getElementById('retryBtn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => this.loadTracks());
      }
    }
  }
  
  /**
   * Загрузка списка избранного и обновление UI
   */
  private async loadFavorites(): Promise<void> {
    try {
      const favTracks = await ApiService.getFavorites();
      console.log('⭐ Favorites loaded:', favTracks.length);
      
      this.favorites = new Set(favTracks.map(t => t.id));
      
      this.trackCards.forEach((card, trackId) => {
        card.updateFavorite(this.favorites.has(trackId));
      });
      
    } catch (error) {
      console.error('❌ Error loading favorites:', error);
    }
  }
  
  /**
   * Рендеринг списка треков в DOM
   */
  private renderTracks(): void {
    if (this.tracks.length === 0) {
      this.content.innerHTML = '<div style="padding:40px;text-align:center;color:var(--color-text-muted)">Треков пока нет 🎵</div>';
      return;
    }
    
    const headers = el('div.track-list__headers',
      el('div.track-header__number', '№'),
      el('div.track-header__cover'),
      el('div.track-header__title', 'НАЗВАНИЕ'),
      el('div.track-header__album', 'АЛЬБОМ'),
      el('div.track-header__date', '📅'),
      el('div.track-header__favorite', '♡'),
      el('div.track-header__duration', '⏱'),
      el('div.track-header__menu')
    );
    
    this.trackCards.clear();
    
    const cardElements: HTMLElement[] = this.tracks.map((track, index) => {
      const globalIndex = ((this.currentPageNum - 1) * this.tracksPerPage) + index;
      const card = new TrackCard({
        track,
        number: globalIndex + 1,
        onPlay: (t) => {
          this.player.playTrack(t, globalIndex);
          this.setActiveTrack(track.id);
        },
        isFavorite: this.favorites.has(track.id),
        onToggleFavorite: (trackId) => this.handleFavoriteToggle(trackId)
      });
      
      this.trackCards.set(track.id, card);
      return card.el;
    });
    
    setChildren(this.content, [headers, ...cardElements]);
  }
  
  /**
   * Рендеринг пагинации
   */
  private renderPagination(pagination: { page: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean }): void {
    if (pagination.totalPages <= 1) {
      if (this.pagination) {
        this.pagination.el.remove();
        this.pagination = null;
      }
      return;
    }
    
    if (!this.pagination) {
      this.pagination = new Pagination({
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        onPageChange: (page) => {
          this.currentPageNum = page;
          this.loadTracks(page);
          this.content.scrollTop = 0;
        }
      });
      
      this.content.appendChild(this.pagination.el);
    } else {
      this.pagination.update(pagination.page, pagination.totalPages);
    }
  }
  
  /**
   * Подсветка активного трека
   */
  private setActiveTrack(trackId: string): void {
    this.activeTrackId = trackId;
    
    this.trackCards.forEach((card, id) => {
      if (id === trackId) {
        card.el.classList.add('track-card--active');
      } else {
        card.el.classList.remove('track-card--active');
      }
    });
  }
  
  /**
   * Обработчик поиска
   */
  private handleSearch(query: string): void {
    console.log('🔍 Searching for:', query);
    
    if (!query) {
      this.renderTracks();
      return;
    }
    
    const filtered = this.tracks.filter(track => 
      track.title.toLowerCase().includes(query.toLowerCase()) ||
      track.artist.toLowerCase().includes(query.toLowerCase())
    );
    
    console.log(`📊 Found ${filtered.length} results`);
    
    if (filtered.length === 0) {
      this.content.innerHTML = `
        <div style="padding:40px;text-align:center;color:var(--color-text-muted)">
          Ничего не найдено по запросу "<strong>${query}</strong>" 🔍
        </div>
      `;
      if (this.pagination) {
        this.pagination.el.style.display = 'none';
      }
    } else {
      const headers = el('div.track-list__headers',
        el('div.track-header__number', '№'),
        el('div.track-header__cover'),
        el('div.track-header__title', 'НАЗВАНИЕ'),
        el('div.track-header__album', 'АЛЬБОМ'),
        el('div.track-header__date', '📅'),
        el('div.track-header__favorite', '♡'),
        el('div.track-header__duration', '⏱'),
        el('div.track-header__menu')
      );
      
      const cardElements: HTMLElement[] = filtered.map((track, index) => {
        const card = new TrackCard({
          track,
          number: index + 1,
          onPlay: (t) => {
            this.player.playTrack(t, index);
            this.setActiveTrack(t.id);
          },
          isFavorite: this.favorites.has(track.id),
          onToggleFavorite: (trackId) => this.handleFavoriteToggle(trackId)
        });
        return card.el;
      });
      
      setChildren(this.content, [headers, ...cardElements]);
      
      if (this.pagination) {
        this.pagination.el.style.display = 'none';
      }
    }
  }
  
  /**
   * Обработчик переключения статуса "избранное"
   */
  private async handleFavoriteToggle(trackId: string): Promise<void> {
    try {
      const isFavorite = this.favorites.has(trackId);
      
      if (isFavorite) {
        await ApiService.removeFromFavorites({ trackId });
        this.favorites.delete(trackId);
        console.log('❤️ Removed from favorites:', trackId);
      } else {
        await ApiService.addToFavorites({ trackId });
        this.favorites.add(trackId);
        console.log('❤️ Added to favorites:', trackId);
      }
      
      const card = this.trackCards.get(trackId);
      if (card) {
        card.updateFavorite(this.favorites.has(trackId));
      }
      
      if (this.currentPage === 'favorites') {
        await this.loadFavoritesOnly();
      }
      
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      
      const card = this.trackCards.get(trackId);
      if (card) {
        card.updateFavorite(this.favorites.has(trackId));
      }
      
      alert('Не удалось обновить избранное. Попробуйте снова.');
    }
  }
  
  /**
   * Загрузка и отображение только избранных треков
   */
  private async loadFavoritesOnly(): Promise<void> {
    console.log('🔄 Loading favorites only...');
    this.content.innerHTML = '<div style="padding:40px;text-align:center;color:var(--color-text-muted)">Загрузка избранного...</div>';
    
    try {
      const favorites = await ApiService.getFavorites();
      console.log('⭐ Favorites received:', favorites.length);
      
      this.tracks = favorites;
      this.favorites = new Set(favorites.map(t => t.id));
      
      this.player.setTracks(this.tracks);
      
      if (this.pagination) {
        this.pagination.el.style.display = 'none';
      }
      
      if (favorites.length === 0) {
        this.content.innerHTML = '<div style="padding:40px;text-align:center;color:var(--color-text-muted)">В избранном пока нет треков ❤️</div>';
        return;
      }
      
      this.renderTracks();
      
    } catch (error) {
      console.error('❌ Error loading favorites:', error);
      this.content.textContent = 'Не удалось загрузить избранное';
    }
  }
  
  /**
   * Настройка бесконечного скролла для мобильных
   */
  private setupInfiniteScroll(): void {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;
    
    let isLoading = false;
    
    this.content.addEventListener('scroll', () => {
      if (isLoading) return;
      
      const { scrollTop, scrollHeight, clientHeight } = this.content;
      
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        if (this.pagination && this.currentPageNum < this.pagination.getTotalPages()) {
          isLoading = true;
          this.currentPageNum++;
          this.loadMoreTracks();
        }
      }
    });
  }
  
  /**
   * Дозагрузка треков для мобильных (infinite scroll)
   */
  private async loadMoreTracks(): Promise<void> {
    try {
      const response = await ApiService.getTracks(this.currentPageNum, this.tracksPerPage);
      const { tracks } = response;
      
      const startIndex = this.tracks.length;
      this.tracks = [...this.tracks, ...tracks];
      this.player.setTracks(this.tracks);
      
      const newCards = tracks.map((track, index) => {
        const globalIndex = startIndex + index;
        const card = new TrackCard({
          track,
          number: globalIndex + 1,
          onPlay: (t) => {
            this.player.playTrack(t, globalIndex);
            this.setActiveTrack(t.id);
          },
          isFavorite: this.favorites.has(track.id),
          onToggleFavorite: (trackId) => this.handleFavoriteToggle(trackId)
        });
        this.trackCards.set(track.id, card);
        return card.el;
      });
      
      const paginationEl = this.content.querySelector('.pagination');
      if (paginationEl) {
        const container = el('div', newCards);
        this.content.insertBefore(container, paginationEl);
      }
      
    } catch (error) {
      console.error('Error loading more tracks:', error);
    }
  }
  
  /**
   * Переключение активной страницы
   */
  setActivePage(page: PageName): void {
    this.currentPage = page;
    this.currentPageNum = 1;
    this.pagination = null;
    this.sidebar.setActive(page);
    
    switch (page) {
      case 'tracks':
        this.header.setTitle('Аудиофайлы и треки');
        this.loadTracks();
        break;
        
      case 'favorites':
        this.header.setTitle('Избранное');
        this.loadFavoritesOnly();
        break;
        
      case 'profile':
        this.header.setTitle('Профиль');
        this.renderProfilePage();
        break;
        
      default:
        this.currentPage = 'tracks';
        this.setActivePage('tracks');
    }
  }
  
  /**
   * Рендеринг страницы профиля
   */
  private renderProfilePage(): void {
    console.log('👤 Rendering profile page...');
    
    try {
      const stats: ProfileStats = {
        tracksCount: this.totalTracks,
        favoritesCount: this.favorites.size,
        listeningTime: this.calculateListeningTime()
      };
      
      this.profile = new Profile(
        ((page: PageName) => this.onNavigate(page)) as (page: string) => void,
        stats
      );
      
      console.log('✅ Profile component created');
      
      this.content.innerHTML = '';
      this.content.appendChild(this.profile.el);
      
      console.log('✅ Profile rendered to DOM');
      
    } catch (error) {
      console.error('❌ Error rendering profile:', error);
      this.content.innerHTML = `
        <div style="padding:40px;text-align:center;color:var(--color-error)">
          <strong>Ошибка загрузки профиля</strong><br>
          <small>${error instanceof Error ? error.message : 'Неизвестная ошибка'}</small>
        </div>
      `;
    }
  }
  
  /**
   * Расчёт времени прослушивания (заглушка)
   */
  private calculateListeningTime(): string {
    const totalMinutes = Math.floor(Math.random() * 500);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}ч ${minutes}м`;
  }
  
  /**
   * Публичный метод для получения текущей страницы
   */
  getCurrentPage(): PageName {
    return this.currentPage;
  }
  
  /**
   * Обновление статистики профиля
   */
  updateProfileStats(): void {
    if (this.profile && this.currentPage === 'profile') {
      const stats: ProfileStats = {
        tracksCount: this.totalTracks,
        favoritesCount: this.favorites.size,
        listeningTime: this.calculateListeningTime()
      };
      this.profile.updateStats(stats);
    }
  }
}