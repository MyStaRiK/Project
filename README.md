## Описание

**Resume Editor** — веб-приложение для создания и управления профессиональными резюме.  
Название проекта указано как `"resume-editor"` в `package.json`  
Приложение было сгенерировано с помощью Create React App 

## Возможности

- Интерактивный редактор резюме с превью в реальном времени на базе React 18.2.0
- Компоненты Material UI (MUI) для гибкой и адаптивной вёрстки (`@mui/material` ^6.4.0) 
- Валидация форм через Formik (`formik` ^2.4.6) и Yup (`yup` ^1.5.0) 
- Управление датами и форматирование с помощью date-fns (`date-fns` ^4.1.0)
- Хранение и отправка данных на сервер через Express 4.21.2 (`express` ^4.21.2)
- Сохранение данных в PostgreSQL с помощью драйвера `pg` (^8.13.1) 
- Отправка готовых резюме на email через Nodemailer (`nodemailer` ^6.9.16)   
- Обработка CORS запросов (`cors` ^2.8.5) и парсинг cookies (`cookie-parser` ^1.4.7)  
- HTTP-прокси для разработки (`http-proxy-middleware` ^3.0.3) и клиентские cookies (`js-cookie` ^3.0.5) 
- Метрики производительности в браузере через `web-vitals` ^4.2.4

## Технологический стек

- **Фронтенд:**  
  - React 18.2.0, React DOM 18.2.0  
  - React Router Dom 7.0.2
  - Create React App (react-scripts 5.0.1) 
  - @emotion/react 11.14.0, @emotion/styled 11.14.0 
  - Material UI (@mui/material 6.4.0) 

- **Бэкенд:**  
  - Node.js + Express 4.21.2 
  - PostgreSQL (pg 8.13.1) 
  - Nodemailer 6.9.16 
  - cookie-parser 1.4.7, cors 2.8.5  
  - http-proxy-middleware 3.0.3 

- **Утилиты и валидация:**  
  - Formik 2.4.6, Yup 1.5.0
  - date-fns 4.1.0 
  - js-cookie 3.0.5  
  - web-vitals 4.2.4   

## Установка и запуск

1. Клонировать репозиторий и перейти в каталог:  
   git clone https://github.com/MyStaRiK/Project.git
   cd Project


2 Установить зависимости и запустить в режиме разработки:
    npm install
    npm start       
    
3 Сборка для продакшена:
    npm run build    
    
4 Тестирование:
    npm test        

    
Скрипты (из package.json)
"scripts": {
  "start": "react-scripts start",   
  "build": "react-scripts build",    
  "test":  "react-scripts test",     
  "eject": "react-scripts eject"     
}

Основные зависимости из `package.json`:
    "dependencies": {
      "@emotion/react": "^11.14.0",
      "@emotion/styled": "^11.14.0",
      "@mui/material": "^6.4.0",
      "cookie-parser": "^1.4.7",
      "cors": "^2.8.5",
      "date-fns": "^4.1.0",
      "express": "^4.21.2",
      "formik": "^2.4.6",
      "http-proxy-middleware": "^3.0.3",
      "js-cookie": "^3.0.5",
      "nodemailer": "^6.9.16",
      "pg": "^8.13.1",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "react-router-dom": "^7.0.2",
      "react-scripts": "5.0.1",
      "web-vitals": "^4.2.4",
      "yup": "^1.5.0"
    }

 
 Основные метаданные:
{
  "name": "resume-editor",    
  "version": "0.1.0",         
  "private": true
}
