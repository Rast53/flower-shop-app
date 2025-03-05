import { useEffect, useCallback, useState } from 'react';

/**
 * Хук для работы с Telegram Mini App
 * Предоставляет доступ к объекту Telegram WebApp и его методам
 */
export function useTelegram() {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [initDataChecked, setInitDataChecked] = useState(false);

  useEffect(() => {
    // Функция для проверки и инициализации Telegram WebApp
    const initTelegramApp = () => {
      try {
        // Проверяем, открыто ли приложение в Telegram
        if (window.Telegram && window.Telegram.WebApp) {
          const webApp = window.Telegram.WebApp;
          console.log('Telegram WebApp обнаружен. Версия:', webApp.version);
          
          setTg(webApp);
          
          // Отладочная информация о данных инициализации
          console.log('initData доступен:', !!webApp.initData);
          console.log('initDataUnsafe доступен:', !!webApp.initDataUnsafe);
          
          // Данные пользователя Telegram
          if (webApp.initDataUnsafe && webApp.initDataUnsafe.user) {
            console.log('Данные пользователя Telegram:', webApp.initDataUnsafe.user);
            setUser(webApp.initDataUnsafe.user);
          } else {
            console.warn('Данные пользователя Telegram не найдены');
          }
          
          // Сообщаем Telegram, что приложение готово
          webApp.ready();
          setIsReady(true);
          setInitDataChecked(true);
        } else {
          console.warn('Telegram WebApp не обнаружен. Приложение запущено вне Telegram.');
          setInitDataChecked(true);
        }
      } catch (error) {
        console.error('Ошибка при инициализации Telegram WebApp:', error);
        setInitDataChecked(true);
      }
    };
    
    // Запускаем инициализацию
    initTelegramApp();
    
    // Делаем повторную попытку через 1 секунду, если не получилось
    const retryTimeout = setTimeout(() => {
      if (!tg && !initDataChecked) {
        console.log('Повторная попытка инициализации Telegram WebApp...');
        initTelegramApp();
      }
    }, 1000);
    
    return () => clearTimeout(retryTimeout);
  }, [tg, initDataChecked]);

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
    user,
    isReady,
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