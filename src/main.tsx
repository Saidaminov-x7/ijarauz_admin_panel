// src/main.tsx
// Точка входа приложения — провайдеры TanStack Query

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

// Настройка TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Повторяем запрос 1 раз при ошибке
      retry: 1,
      // Данные считаются свежими 60 секунд
      staleTime: 60_000,
      // Кэш хранится 5 минут
      gcTime: 5 * 60_000,
      // Не рефетчим при фокусе окна (снижает количество запросов)
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
