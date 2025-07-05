// RightPanel.jsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie'; // Для получения данных из cookie
import '../styles/global.css';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const RightPanel = ({
  design,
  resumeTitle,
  summaryData, // Existing prop
  summarySentences, // Новый пропс
}) => {
  const [editDate, setEditDate] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    // Установка текущей даты
    const currentDate = new Date().toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    setEditDate(currentDate);
  }, []);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const userId = Cookies.get('userid'); // Предполагаем, что userId хранится в cookie под ключом 'userId'
      console.log('Все cookie:', document.cookie);

      if (!userId) {
        setEmailError('Email из cookie');
        setUserEmail('Email не найден');
        return;
      }

      // Проверка, что userId числовой
      if (!/^\d+$/.test(userId)) {
        setEmailError('Неверный формат userId.');
        setUserEmail('Email не найден');
        return;
      }

      setLoadingEmail(true);
      setEmailError('');

      try {
        const response = await fetch(`/scenario_authorization/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Пользователь не найден.');
          } else if (response.status === 400) {
            throw new Error('Неверный формат userId.');
          } else {
            throw new Error('Ошибка сервера при получении email.');
          }
        }

        const data = await response.json();
        setUserEmail(data.email || 'Email не найден');
      } catch (error) {
        console.error('Ошибка при получении email пользователя:', error);
        setEmailError(error.message);
        setUserEmail('Email не найден');
      } finally {
        setLoadingEmail(false);
      }
    };

    fetchUserEmail();
  }, []); // Пустой массив зависимостей означает, что эффект выполнится один раз при монтировании компонента

  return (
    <div className="resume-preview">
      <div className="a4-page">
        <div className="project-title-container">
          <h2
            className="project-title"
            style={{
              textAlign: design.headerAlignment,
              color: design.headerColor,
              fontSize: `${design.headerFontSize}px`,
              fontFamily: design.headerFont,
              opacity: resumeTitle === 'Новый проект' ? 0.5 : 1,
            }}
          >
            {resumeTitle}
          </h2>
        </div>

        {/* Новая секция для summarySentences */}
        <div
          className="sentences-display"
          style={{
            textAlign: design.textAlignment,
            color: design.textColor,
            fontSize: `${design.textFontSize}px`,
            fontFamily: design.textFont,
          }}
        >
          <h3>Сформированный текст</h3>
          {summarySentences.length === 0 ? (
            <p>Нет предложений для отображения.</p>
          ) : (
            <ol className="numbered-list">
              {summarySentences.map((sentence, idx) => (
                <li
                  key={idx}
                  className="indented-sentence"
                  style={{
                    whiteSpace: 'pre-line',
                    color: design.textColor,
                    fontSize: `${design.textFontSize}px`,
                    fontFamily: design.textFont,
                    marginBottom: '20px', // Добавляем отступ между предложениями
                  }}
                >
                  {sentence}
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Дата редактирования */}
        <p style={{ textAlign: design.dateAlignment }}>{editDate}</p>

        {/* Email пользователя */}
        <div style={{ textAlign: design.contactAlignment }}>
          <p><strong>Email пользователя:</strong></p>
          {loadingEmail ? (
            <p>Загрузка...</p>
          ) : emailError ? (
            <p style={{ color: 'red' }}>{emailError}</p>
          ) : (
            <p>{userEmail}</p>
          )}
        </div>
      </div>
    </div>
  );
};

RightPanel.propTypes = {
  design: PropTypes.object.isRequired,
  resumeTitle: PropTypes.string.isRequired,
  summaryData: PropTypes.array.isRequired,
  summarySentences: PropTypes.array.isRequired, // Новый пропс
};

export default RightPanel;
