// src/view/layouts/AuthLayout.ts
import { el } from 'redom';
import { AuthForm } from '../components/AuthForm/AuthForm';
import { PageName } from '../../types/app.types';

export class AuthLayout {
  el: HTMLElement;
  private form: AuthForm;
  private onNavigate: (page: PageName) => void;

  constructor(onNavigate: (page: PageName) => void) {
    this.onNavigate = onNavigate;
    this.form = new AuthForm(this.onNavigate);
    
    this.el = el('div.auth-layout',
      el('div.auth-layout__container',
        el('h1.auth-layout__title', 'VibeCast Studio'),
        this.form.el
      )
    );
  }
}