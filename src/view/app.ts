import { MainLayout } from './layouts/MainLayout';
import { AuthForm } from './components/AuthForm/AuthForm';
import { PageName } from '../types/app.types';
import { ApiService } from '../services/api';

export class App {
  private mainLayout: MainLayout | null = null;
  private authForm: AuthForm | null = null;
  private onNavigate: (page: PageName) => void;

  constructor(onNavigate: (page: PageName) => void) {
    this.onNavigate = onNavigate;
  }

  init(): void {
    console.log('🚀 App initialized');
  }

  getAuthPage(): HTMLElement {
    if (!this.authForm) {
      this.authForm = new AuthForm(this.onNavigate);
    }
    return this.authForm.el;
  }

  getMainLayout(): HTMLElement {
    if (!this.mainLayout) {
      this.mainLayout = new MainLayout(this.onNavigate);
    }
    return this.mainLayout.el;
  }

  getMainLayoutInstance(): MainLayout | null {
    if (!this.mainLayout) {
      this.mainLayout = new MainLayout(this.onNavigate);
    }
    return this.mainLayout;
  }

  updateProfileStats(): void {
    if (this.mainLayout) {
      this.mainLayout.updateProfileStats();
    }
  }

  isAuthenticated(): boolean {
    return ApiService.isAuthenticated();
  }

  logout(): void {
    ApiService.clearToken();
    this.mainLayout = null;
    this.authForm = null;
  }
}