# Лабораторная работа №3 — React SPA «Зелёный Берег»

Одностраничное приложение на React (Vite) с переносом вёрстки из ЛР1.

## Стек

- React 19 + Vite
- React Router DOM (клиентская маршрутизация)
- CSS3 (адаптив, Flexbox/Grid)

## Структура

```
lab3/
├── public/images/     # статика (логотип, фото, видео)
├── src/
│   ├── components/    # Header, Footer, Layout, ContactForm…
│   ├── pages/         # Home, About, Services, Contacts
│   ├── data/          # общие данные для props
│   ├── styles/        # style.css, responsive.css
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

## Запуск

```bash
cd lab3
npm install
npm run dev
```

Сборка: `npm run build` → папка `dist/`.
