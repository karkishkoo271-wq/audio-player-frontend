import { el } from 'redom';
import './Pagination.css';

export interface PaginationOptions {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export class Pagination {
  el: HTMLElement;
  private currentPage: number;
  private totalPages: number;
  private onPageChange: (page: number) => void;

  constructor({ currentPage, totalPages, onPageChange }: PaginationOptions) {
    this.currentPage = currentPage;
    this.totalPages = totalPages;
    this.onPageChange = onPageChange;
    
    this.el = el('div.pagination', this.render());
  }

  private render(): HTMLElement[] {
    const pages: HTMLElement[] = [];
    
    // Кнопка "Назад"
    if (this.currentPage > 1) {
      pages.push(
        el('button.pagination__btn', { 
          'data-page': String(this.currentPage - 1) 
        }, '←')
      );
    }
    
    // Номера страниц
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    // Первая страница
    if (startPage > 1) {
      pages.push(
        el('button.pagination__btn', { 'data-page': '1' }, '1')
      );
      if (startPage > 2) {
        pages.push(el('span.pagination__dots', '...'));
      }
    }
    
    // Страницы в диапазоне
    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === this.currentPage;
      pages.push(
        el('button.pagination__btn' + (isActive ? ' pagination__btn--active' : ''), {
          'data-page': String(i)
        }, String(i))
      );
    }
    
    // Последняя страница
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        pages.push(el('span.pagination__dots', '...'));
      }
      pages.push(
        el('button.pagination__btn', { 'data-page': String(this.totalPages) }, String(this.totalPages))
      );
    }
    
    // Кнопка "Вперёд"
    if (this.currentPage < this.totalPages) {
      pages.push(
        el('button.pagination__btn', { 
          'data-page': String(this.currentPage + 1) 
        }, '→')
      );
    }
    
    // Добавляем обработчики
    pages.forEach(el => {
      if (el instanceof HTMLElement && el.classList.contains('pagination__btn')) {
        el.addEventListener('click', () => {
          const page = parseInt(el.getAttribute('data-page') || '1');
          this.onPageChange(page);
        });
      }
    });
    
    return pages;
  }

  /**
   * Обновление пагинации
   */
  update(currentPage: number, totalPages: number): void {
    this.currentPage = currentPage;
    this.totalPages = totalPages;
    this.el.innerHTML = '';
    this.el.append(...this.render());
  }

  /**
   * ✅ ПУБЛИЧНЫЙ ГЕТТЕР для общего количества страниц
   */
  getTotalPages(): number {
    return this.totalPages;
  }

  /**
   * ✅ ПУБЛИЧНЫЙ ГЕТТЕР для текущей страницы
   */
  getCurrentPage(): number {
    return this.currentPage;
  }
}