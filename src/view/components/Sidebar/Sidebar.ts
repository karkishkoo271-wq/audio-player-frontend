import { el } from 'redom';
import { PageName } from '../../../types/app.types';
import './Sidebar.css';

export class Sidebar {
  el: HTMLElement;
  private onNavigate: (page: PageName) => void;
  private activePage: PageName = 'tracks';

  constructor(onNavigate: (page: PageName) => void) {
    this.onNavigate = onNavigate;
    
    this.el = el('aside.sidebar',
      el('div.sidebar__header',
        el('div.sidebar__logo',
          el('span.sidebar__logo-icon', '🎵'),
          el('span.sidebar__logo-text', 'VibeCast')
        )
      ),
      el('nav.sidebar__nav',
        el('button.sidebar__link', { 
          'data-page': 'favorites',
          'class': 'sidebar__link'
        }, 
          el('span.sidebar__link-icon', '♪'),
          el('span.sidebar__link-text', 'Избранное')
        ),
        el('button.sidebar__link.sidebar__link--active', { 
          'data-page': 'tracks'
        }, 
          el('span.sidebar__link-icon', '♪'),
          el('span.sidebar__link-text', 'Аудиокомпозиции')
        )
      ),
    );
    
    this.el.querySelectorAll('.sidebar__link').forEach(link => {
      link.addEventListener('click', (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        const page = target.getAttribute('data-page') as PageName;
        if (page) {
          this.activePage = page;
          this.onNavigate(page);
        }
      });
    });
    
    const logoutBtn = this.el.querySelector('.sidebar__logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('auth_token');
        this.onNavigate('auth');
      });
    }
  }

  setActive(page: PageName): void {
    this.activePage = page;
    this.el.querySelectorAll('.sidebar__link').forEach(link => {
      link.classList.remove('sidebar__link--active');
      if (link.getAttribute('data-page') === page) {
        link.classList.add('sidebar__link--active');
      }
    });
  }
  
  getActivePage(): PageName {
    return this.activePage;
  }
}