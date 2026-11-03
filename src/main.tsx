import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LegalNotice, Privacy } from './pages/Legal';
const CourseApp = lazy(() => import('./course/CourseApp'));
const SimApp = lazy(() => import('./sim/SimApp'));
import './index.css';

const path = window.location.pathname.replace(/\/+$/, '');
// The demo is a client experience: it wears the client's brand (Regal Services).
if (path === '/demo') document.documentElement.classList.add('theme-regal');
const Page = path === '/privacy' ? Privacy : path === '/legal' ? LegalNotice : path === '/demo' ? (/[?&](practice|rep)=1/.test(window.location.search) ? CourseApp : SimApp) : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  </StrictMode>,
);
