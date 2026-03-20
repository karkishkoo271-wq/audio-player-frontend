import { el } from 'redom';
import './Button.css';

export interface ButtonProps {
  text: string;
  onClick?: (e: Event) => void;
  type?: 'button' | 'submit';
  modifiers?: string[];
  disabled?: boolean;
}

export class Button {
  el: HTMLButtonElement;

  constructor({ text, onClick, type = 'button', modifiers = [], disabled = false }: ButtonProps) {
    this.el = el('button', text) as HTMLButtonElement;
    this.el.type = type;
    this.el.className = 'button';
    
    if (modifiers.length) {
      this.el.classList.add(...modifiers.map(m => `button--${m}`));
    }
    
    if (disabled) {
      this.el.disabled = true;
      this.el.classList.add('button--disabled');
    }
    
    if (onClick) {
      this.el.addEventListener('click', onClick);
    }
  }

  setText(text: string): void {
    this.el.textContent = text;
  }

  setDisabled(disabled: boolean): void {
    this.el.disabled = disabled;
    if (disabled) {
      this.el.classList.add('button--disabled');
    } else {
      this.el.classList.remove('button--disabled');
    }
  }
}