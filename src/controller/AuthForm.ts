import { el } from 'redom';
import { PageName } from '../../../types/app.types';
import { ApiService } from '../../../services/api';
import './AuthForm.css';

export class AuthForm {
  el: HTMLElement;
  private onNavigate: (page: PageName) => void;
  private usernameInput: HTMLInputElement;
  private passwordInput: HTMLInputElement;
  private errorEl: HTMLElement;
  private isLogin: boolean = true;

  constructor(onNavigate: (page: PageName) => void) {
    this.onNavigate = onNavigate;
    
    this.usernameInput = el('input.auth-form__input', {
      type: 'text',
      placeholder: 'Имя пользователя',
      required: true
    }) as HTMLInputElement;
    
    this.passwordInput = el('input.auth-form__input', {
      type: 'password',
      placeholder: 'Пароль',
      required: true
    }) as HTMLInputElement;
    
    this.errorEl = el('div.auth-form__error');
    
    const titleEl = el('h2.auth-form__title', 'Вход в VibeCast');
    const submitBtn = el('button.auth-form__submit', 'Войти');
    const switchEl = el('p.auth-form__switch', 
      'Нет аккаунта? ',
      el('span.auth-form__link', { 
        textContent: 'Зарегистрироваться',
        onclick: () => this.toggleMode()
      })
    );
    
    const form = el('form.auth-form__form',
      this.usernameInput,
      this.passwordInput,
      this.errorEl,
      submitBtn
    );
    
    form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    this.el = el('div.auth-form',
      el('div.auth-form__header',
        titleEl
      ),
      form,
      switchEl
    );
  }

  private toggleMode(): void {
    this.isLogin = !this.isLogin;
    const titleEl = this.el.querySelector('.auth-form__title') as HTMLElement;
    const submitBtn = this.el.querySelector('.auth-form__submit') as HTMLButtonElement;
    const switchText = this.el.querySelector('.auth-form__link') as HTMLElement;
    
    if (titleEl && submitBtn && switchText) {
      if (this.isLogin) {
        titleEl.textContent = 'Вход в VibeCast';
        submitBtn.textContent = 'Войти';
        switchText.textContent = 'Зарегистрироваться';
      } else {
        titleEl.textContent = 'Регистрация';
        submitBtn.textContent = 'Зарегистрироваться';
        switchText.textContent = 'Войти';
      }
    }
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value.trim();
    
    if (!username || !password) {
      this.showError('Введите имя пользователя и пароль');
      return;
    }
    
    try {
      if (this.isLogin) {
        // ✅ ВХОД — возвращает token
        const response = await ApiService.login({ username, password });
        console.log('✅ Login successful, token:', response.token ? 'received' : 'not received');
      } else {
        // ✅ РЕГИСТРАЦИЯ — не возвращает token, нужно войти отдельно
        await ApiService.register({ username, password });
        console.log('✅ Registration successful');
        
        // Автоматический вход после регистрации
        const loginResponse = await ApiService.login({ username, password });
        console.log('✅ Auto-login after registration, token:', loginResponse.token ? 'received' : 'not received');
      }
      
      // Переход на главную
      this.onNavigate('tracks');
      
    } catch (error) {
      console.error('❌ Auth error:', error);
      this.showError(error instanceof Error ? error.message : 'Ошибка авторизации');
    }
  }

  private showError(message: string): void {
    this.errorEl.textContent = message;
    this.errorEl.style.display = 'block';
    
    setTimeout(() => {
      this.errorEl.style.display = 'none';
    }, 5000);
  }
}