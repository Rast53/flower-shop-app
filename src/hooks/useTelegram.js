import { useEffect, useState } from 'react';

/**
 * Хук для работы с Telegram Mini App
 * Предоставляет доступ к объекту Telegram WebApp и его методам
 */
export function useTelegram() {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [queryId, setQueryId] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Получаем доступ к объекту Telegram WebApp
    const telegram = window.Telegram?.WebApp;
    
    if (telegram) {
      // Инициализируем Telegram Mini App
      telegram.ready();
      setTg(telegram);
      setUser(telegram.initDataUnsafe?.user);
      setQueryId(telegram.initDataUnsafe?.query_id || '');
      setReady(true);
      
      // Изменяем цвет темы Telegram Mini App
      telegram.setHeaderColor('#e84393');
      telegram.setBackgroundColor('#ffffff');
      
      // Настраиваем основную кнопку
      telegram.MainButton.setParams({
        text: 'Продолжить',
        color: '#e84393',
        textColor: '#ffffff',
      });
    }
  }, []);

  // Функция для отправки данных в Telegram
  const sendData = (data) => {
    if (tg && queryId) {
      tg.sendData(JSON.stringify(data));
    }
  };

  // Функция для закрытия Telegram Mini App
  const close = () => {
    if (tg) {
      tg.close();
    }
  };

  // Функция для показа основной кнопки с настраиваемым текстом
  const showMainButton = (text = 'Продолжить') => {
    if (tg) {
      tg.MainButton.setText(text);
      tg.MainButton.show();
    }
  };

  // Функция для скрытия основной кнопки
  const hideMainButton = () => {
    if (tg) {
      tg.MainButton.hide();
    }
  };

  // Функция для показа кнопки "Назад"
  const showBackButton = () => {
    if (tg) {
      tg.BackButton.show();
    }
  };

  // Функция для скрытия кнопки "Назад"
  const hideBackButton = () => {
    if (tg) {
      tg.BackButton.hide();
    }
  };

  // Функция для настройки основной кнопки
  const setMainButtonParams = (params) => {
    if (tg) {
      tg.MainButton.setParams(params);
    }
  };

  // Функция для установки обработчика на клик по основной кнопке
  const onMainButtonClick = (callback) => {
    if (tg) {
      tg.MainButton.onClick(callback);
      return () => tg.MainButton.offClick(callback);
    }
    return () => {};
  };

  // Функция для установки обработчика на клик по кнопке "Назад"
  const onBackButtonClick = (callback) => {
    if (tg) {
      tg.BackButton.onClick(callback);
      return () => tg.BackButton.offClick(callback);
    }
    return () => {};
  };

  return {
    tg,
    user,
    queryId,
    ready,
    sendData,
    close,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    setMainButtonParams,
    onMainButtonClick,
    onBackButtonClick,
  };
} 