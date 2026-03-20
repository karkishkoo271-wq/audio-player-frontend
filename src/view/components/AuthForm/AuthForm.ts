import { el } from 'redom';
import { Button } from '../Button/Button';
import './AuthForm.css';
import { PageName } from '../../../types/app.types';
import { ApiService } from '../../../services/api';

export class AuthForm {
  el: HTMLElement;
  private onNavigate: (page: PageName) => void;
  private isRegisterMode: boolean = false;
  private submitBtn: Button;
  private switchText: HTMLElement;

  constructor(onNavigate: (page: PageName) => void) {
    this.onNavigate = onNavigate;
    
    this.submitBtn = new Button({ 
      text: 'Войти', 
      type: 'submit',
      modifiers: ['primary']
    });
    
    this.switchText = el('span');
    this.updateSwitchText();
    
    this.el = el('form.auth-form',
      el('input.auth-form__input', { 
        type: 'text', 
        placeholder: 'Имя пользователя',
        name: 'username'
      }),
      el('input.auth-form__input', { 
        type: 'password', 
        placeholder: 'Пароль',
        name: 'password'
      }),
      this.submitBtn.el,
      el('p.auth-form__switch', this.switchText)
    );
    
    // Обработка отправки формы
    this.el.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
    
    // Переключение между входом и регистрацией
    const switchBtn = this.el.querySelector('.auth-form__switch button') as HTMLButtonElement;
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        this.toggleMode();
      });
    }
  }
  
  private updateSwitchText(): void {
    const link = el('button.auth-form__link', { type: 'button' });
    link.textContent = this.isRegisterMode ? 'Войти' : 'Зарегистрироваться';
    
    this.switchText.innerHTML = this.isRegisterMode 
      ? 'Уже есть аккаунт? ' 
      : 'Нет аккаунта? ';
    this.switchText.appendChild(link);
    
    // Добавляем обработчик на новую кнопку
    link.addEventListener('click', () => {
      this.toggleMode();
    });
  }
  
  private toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.submitBtn.setText(this.isRegisterMode ? 'Зарегистрироваться' : 'Войти');
    this.updateSwitchText();
  }
  
  private async handleSubmit(): Promise<void> {
    const usernameInput = this.el.querySelector('input[name="username"]') as HTMLInputElement;
    const passwordInput = this.el.querySelector('input[name="password"]') as HTMLInputElement;
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
      alert('Введите имя пользователя и пароль');
      return;
    }
    
    try {
      let result;
      if (this.isRegisterMode) {
        result = await ApiService.register({ username, password });
      } else {
        result = await ApiService.login({ username, password });
      }
      
      if (result.token) {
        // Успешная авторизация/регистрация
        this.onNavigate('tracks');
      } else {
        alert(result.message || 'Ошибка авторизации');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Произошла ошибка. Попробуйте позже.');
    }
  }
}