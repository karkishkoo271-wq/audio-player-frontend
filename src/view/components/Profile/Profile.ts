// src/view/components/Profile/Profile.ts
import { el } from 'redom';
import { ApiService } from '../../../services/api';
import './Profile.css';

export interface ProfileStats {
  tracksCount: number;
  favoritesCount: number;
  listeningTime?: string;
}

export class Profile {
  el: HTMLElement;
  private onNavigate: (page: string) => void;

  constructor(onNavigate: (page: string) => void, stats?: ProfileStats) {
    this.onNavigate = onNavigate;
    
    const token = ApiService.getToken();
    const username = token ? this.getUsernameFromToken(token) : 'Гость';
    
    this.el = el('div.profile',
      el('div.profile__header',
        el('div.profile__avatar',
          el('div.profile__avatar-placeholder', '👤')
        ),
        el('div.profile__info',
          el('h1.profile__name', username),
          el('p.profile__username', '@' + username.toLowerCase().replace(/\s+/g, '')),
          el('div.profile__badge', 'Premium')
        )
      ),
      
      el('div.profile__stats',
        el('div.profile__stat',
          el('div.profile__stat-value', String(stats?.tracksCount || 0)),
          el('div.profile__stat-label', 'Треков')
        ),
        el('div.profile__stat',
          el('div.profile__stat-value', String(stats?.favoritesCount || 0)),
          el('div.profile__stat-label', 'В избранном')
        ),
        el('div.profile__stat',
          el('div.profile__stat-value', stats?.listeningTime || '0ч'),
          el('div.profile__stat-label', 'Прослушано')
        )
      ),
      
      el('div.profile__account',
        el('h2.profile__section-title', 'Аккаунт'),
        el('div.profile__account-item',
          el('span.profile__account-label', 'Имя пользователя'),
          el('span.profile__account-value', username)
        ),
        el('div.profile__account-item',
          el('span.profile__account-label', 'Статус'),
          el('span.profile__account-value.profile__status-active', 'Активен')
        ),
        el('div.profile__account-item',
          el('span.profile__account-label', 'Дата регистрации'),
          el('span.profile__account-value', this.getRegistrationDate())
        )
      ),
      
      el('div.profile__actions',
        el('button.profile__btn.profile__btn--primary', 'Редактировать профиль'),
        el('button.profile__btn.profile__btn--danger', { id: 'logoutBtn' }, 'Выйти из аккаунта')
      ),
      
      el('div.profile__footer',
        el('p.profile__copyright', '© 2024 VibeCast Studio. Все права защищены.')
      )
    );
    
    this.setupEventListeners();
  }
  
  /**
   * Извлечение имени пользователя из токена
   */
  private getUsernameFromToken(token: string): string {
    try {
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
   * Получение даты регистрации (заглушка)
   */
  private getRegistrationDate(): string {
    const date = new Date();
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
  
  /**
   * Настройка обработчиков событий
   */
 private setupEventListeners(): void {
  // Кнопка выхода
  const logoutBtn = this.el.querySelector('#logoutBtn');  // ← Ищем внутри this.el!
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      console.log('🚪 Logout button clicked');
      if (confirm('Вы уверены, что хотите выйти?')) {
        ApiService.clearToken();
        this.onNavigate('auth');
      }
    });
  }
    
    // Кнопка редактирования (заглушка)
    const editBtn = this.el.querySelector('.profile__btn--primary');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      alert('Функция редактирования профиля в разработке 🔜');
    });
  }
}
  
  /**
   * Обновление статистики
   */
  updateStats(stats: ProfileStats): void {
    const statValues = this.el.querySelectorAll('.profile__stat-value');
    if (statValues[0]) statValues[0].textContent = String(stats.tracksCount);
    if (statValues[1]) statValues[1].textContent = String(stats.favoritesCount);
    if (statValues[2] && stats.listeningTime) statValues[2].textContent = stats.listeningTime;
  }
}