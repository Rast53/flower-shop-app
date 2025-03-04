import { useEffect, useCallback } from 'react';

/**
 * Хук для работы с Telegram Mini App
 * Предоставляет доступ к объекту Telegram WebApp и его методам
 */
export function useTelegram() {
  const tg = window.Telegram?.WebApp;

  const onClose = useCallback(() => {
    tg?.close();
  }, [tg]);

  const onToggleButton = useCallback(() => {
    if (tg?.MainButton.isVisible) {
      tg.MainButton.hide();
    } else {
      tg.MainButton.show();
    }
  }, [tg]);

  const showMainButton = useCallback((text, onClick) => {
    if (!tg) return;
    
    tg.MainButton.text = text;
    tg.MainButton.show();
    tg.MainButton.onClick(onClick);
  }, [tg]);

  const hideMainButton = useCallback(() => {
    tg?.MainButton.hide();
  }, [tg]);

  const hideBackButton = useCallback(() => {
    if (!tg) return;
    
    // В Telegram WebApp нет прямого метода для скрытия кнопки "Назад"
    // Но можно отключить кнопку "Назад" через BackButton API, если она доступна
    if (tg.BackButton && tg.BackButton.isVisible) {
      tg.BackButton.hide();
    }
  }, [tg]);

  const sendData = useCallback((data) => {
    if (!tg) return;
    
    tg.sendData(JSON.stringify(data));
  }, [tg]);

  useEffect(() => {
    if (!tg) return;
    
    tg.ready();
    
    // Включить расширение страницы на всю высоту
    tg.expand();
    
    // Установить цвет темы для WebApp
    tg.setHeaderColor(tg.themeParams.bg_color || '#ffffff');
    tg.setBackgroundColor(tg.themeParams.bg_color || '#ffffff');
    
  }, [tg]);

  return {
    tg,
    user: tg?.initDataUnsafe?.user,
    userId: tg?.initDataUnsafe?.user?.id,
    queryId: tg?.initDataUnsafe?.query_id,
    onClose,
    onToggleButton,
    showMainButton,
    hideMainButton,
    hideBackButton,
    sendData,
    initData: tg?.initData,
    initDataUnsafe: tg?.initDataUnsafe
  };
} 