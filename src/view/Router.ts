import { App } from './app';
import { PageName } from '../types/app.types';

export class Router {
  private app: App;
  private currentPage: PageName = 'auth';
  private isMainLayoutMounted: boolean = false; 

  constructor(app: App) {
    this.app = app;
  }

  init(): void {
    console.log('🧭 Router initialized');
    
    const token = localStorage.getItem('auth_token');
    this.currentPage = token ? 'tracks' : 'auth';
    
    this.render(this.currentPage);
    
    window.addEventListener('navigate', ((e: Event) => {
      const customEvent = e as CustomEvent<PageName>;
      this.navigate(customEvent.detail);
    }) as EventListener);
  }

  navigate(page: PageName): void {
    console.log('🧭 Navigating to:', page);
    
    const token = localStorage.getItem('auth_token');
    
    if (!token && page !== 'auth') {
      console.warn('⚠️ No token, redirecting to auth');
      page = 'auth';
    }
    
    if (token && page === 'auth') {
      console.warn('⚠️ Already authenticated, redirecting to tracks');
      page = 'tracks';
    }
    
    this.currentPage = page;
    this.render(page);
  }

  render(page: PageName): void {
    console.log('🎨 Rendering page:', page);
    
    const appElement = document.getElementById('app');
    
    if (!appElement) {
      console.error('❌ Element #app not found!');
      return;
    }

    // ✅ СТРАНИЦА АВТОРИЗАЦИИ
    if (page === 'auth') {
      this.isMainLayoutMounted = false;
      const pageElement = this.app.getAuthPage();
      
      if (!pageElement) {
        console.error('❌ Auth page is null!');
        return;
      }
      
      appElement.innerHTML = '';
      appElement.appendChild(pageElement);
      console.log('✅ Auth page rendered');
      return;
    }

    // ✅ СТРАНИЦЫ ПРИЛОЖЕНИЯ (tracks, favorites, profile)
    const mainLayout = this.app.getMainLayoutInstance();
    
    if (!mainLayout) {
      console.error('❌ MainLayout instance is null!');
      return;
    }

    // ✅ Вызываем setActivePage() для переключения контента внутри MainLayout
    mainLayout.setActivePage(page);
    
    // ✅ Добавляем MainLayout в DOM только один раз
    if (!this.isMainLayoutMounted) {
      appElement.innerHTML = '';
      appElement.appendChild(mainLayout.el);
      this.isMainLayoutMounted = true;
      console.log('✅ MainLayout mounted to DOM');
    } else {
      console.log('✅ Page switched inside MainLayout:', page);
    }
  }

  getCurrentPage(): PageName {
    return this.currentPage;
  }
}