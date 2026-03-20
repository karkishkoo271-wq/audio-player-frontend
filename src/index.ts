import { App } from './view/app';      
import { Router } from './view/Router';
import './styles/global.css';          
import './styles/variables.css';       


document.addEventListener('DOMContentLoaded', () => {
  console.log('🎵 VibeCast Studio starting...');
  
  const navigate = (page: string) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: page }));
  };
  
  const app = new App(navigate);
  const router = new Router(app);
  
  app.init();
  router.init();
  
  (window as any).app = app;
  (window as any).router = router;
});