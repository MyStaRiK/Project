import React from 'react';
import '../styles/HelpPage.css';

const HelpPage = () => {
  return (
    <div className="help-page">
      <h2>Помощь</h2>
      <p>На этой странице вы найдете инструкции о том, как пользоваться нашим сайтом.</p>
      <ul>
        <li>Редактируйте резюме в разделе "Редактирование".</li>
        <li>Выбирайте дизайн резюме в разделе "Дизайн".</li>
        <li>Следуйте подсказкам на каждом шаге для достижения наилучшего результата.</li>
      </ul>
    </div>
  );
};

export default HelpPage;
