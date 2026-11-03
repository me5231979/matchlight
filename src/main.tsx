import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LegalNotice, Privacy } from './pages/Legal';
import './index.css';

const path = window.location.pathname.replace(/\/+$/, '');
const Page = path === '/privacy' ? Privacy : path === '/legal' ? LegalNotice : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
