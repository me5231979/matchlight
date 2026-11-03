import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LegalNotice, Privacy } from './pages/Legal';
const CourseApp = lazy(() => import('./course/CourseApp'));
import './index.css';

const path = window.location.pathname.replace(/\/+$/, '');
const Page = path === '/privacy' ? Privacy : path === '/legal' ? LegalNotice : path === '/demo' ? CourseApp : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  </StrictMode>,
);
