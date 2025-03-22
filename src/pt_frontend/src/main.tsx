import { RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import { router } from './router';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

console.log(
  '%c🦦 PERMATRUST 🦦',
  'font-size: 44px; text-decoration: underline;',
);

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
} else {
  throw new ReferenceError('Root element not found!');
}
