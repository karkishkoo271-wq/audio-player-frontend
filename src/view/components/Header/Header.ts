import { el } from 'redom';
import { PageName } from '../../../types/app.types';
import './Header.css';

export interface HeaderOptions {
  onSearch?: (query: string) => void;
  onProfileClick?: () => void;
  username?: string;
}

export class Header {
  el: HTMLElement;
  private titleElement: HTMLElement;
  private searchInput: HTMLInputElement;
  private profileElement: HTMLElement;
  private onSearch?: (query: string) => void;
  private onProfileClick?: () => void;
  private username: string;

  constructor(options: HeaderOptions = {}) {
    this.onSearch = options.onSearch;
    this.onProfileClick = options.onProfileClick;
    this.username = options.username || 'username';

    this.titleElement = el('h1.header__title', 'Аудиофайлы и треки');

    this.searchInput = el('input.header__search-input', {
      type: 'text',
      placeholder: 'ЧТО БУДЕМ ИСКАТЬ?'
    }) as HTMLInputElement;

    this.profileElement = el('div.header__profile', {
      title: 'Открыть профиль',
      style: 'cursor: pointer;'
    },
      el('img.header__user-avatar', {
        src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle fill="%23667eea" cx="50" cy="50" r="50"/%3E%3Ctext fill="white" x="50" y="50" text-anchor="middle" dy=".35em" font-size="40"%3E👤%3C/text%3E%3C/svg%3E',
        alt: 'Avatar'
      }),
      el('span.header__user-name', this.username),
      el('span.header__user-arrow', '›')
    );

    this.el = el('header.header',
      el('div.header__top',
        el('div.header__search',
          el('span.header__search-icon', '🔍'),
          this.searchInput
        ),
        this.profileElement
      ),
      el('div.header__bottom',
        this.titleElement
      )
    );

    this.setupSearch();
    this.setupProfileClick();
  }

  /**
   * Настройка поиска
   */
  private setupSearch(): void {
    let timeout: number | undefined;

    this.searchInput.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const query = target.value.trim();

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = window.setTimeout(() => {
        if (this.onSearch) {
          this.onSearch(query);
        } else {
          console.log('🔍 Search query:', query || '(пусто)');
        }
      }, 300);
    });

    this.searchInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const query = this.searchInput.value.trim();
        if (this.onSearch) {
          this.onSearch(query);
        }
      }
    });
  }

  /**
   * Настройка клика по профилю
   */
  private setupProfileClick(): void {
    this.profileElement.addEventListener('click', () => {
      console.log('👤 Profile clicked');
      if (this.onProfileClick) {
        this.onProfileClick();
      }
    });

    // Добавляем визуальный эффект при наведении
    this.profileElement.addEventListener('mouseenter', () => {
      this.profileElement.style.background = 'var(--color-border-light)';
    });

    this.profileElement.addEventListener('mouseleave', () => {
      this.profileElement.style.background = '';
    });
  }

  /**
   * Установка заголовка страницы
   */
  setTitle(title: string): void {
    this.titleElement.textContent = title;
  }

  /**
   * Установка обработчика поиска
   */
  setSearchHandler(handler: (query: string) => void): void {
    this.onSearch = handler;
  }

  /**
   * Установка обработчика клика по профилю
   */
  setProfileClickHandler(handler: () => void): void {
    this.onProfileClick = handler;
  }

  /**
   * Обновление имени пользователя
   */
  setUsername(name: string): void {
    this.username = name;
    const nameEl = this.profileElement.querySelector('.header__user-name');
    if (nameEl) {
      nameEl.textContent = name;
    }
  }

  /**
   * Очистка поискового поля
   */
  clearSearch(): void {
    this.searchInput.value = '';
  }
}