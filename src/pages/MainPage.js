import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MainPage.css';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ProfileMenu from './ProfileMenu';
import ProfileSettingsModal from './ProfileSettingsModal';
import { ToastContext } from '../context/ToastContext'; // Импортируем Context

const MainPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [user, setUser] = useState(null); // Состояние для информации о пользователе
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // Состояние для анимации закрытия

  const navigate = useNavigate();

  const { showToast } = useContext(ToastContext); // Получаем функцию showToast

  // Функция инициализации пользователя
  const initializeUser = async () => {
    try {
      const res = await fetch('http://localhost:5000/scenario_authorization/profile', {
        credentials: 'include' // Важно для отправки куки
      });
      const data = await res.json();
      if (res.ok && data.user_id) {
        setUser(data); // Устанавливаем информацию о пользователе
      } else {
        setUser(null); // Пользователь не авторизован
      }
    } catch (err) {
      console.error(err);
      setUser(null);
    } finally {
      setLoading(false); // Завершаем загрузку
    }
  };

  const startLoading = () => {
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    initializeUser(); // Инициализируем пользователя при загрузке страницы
  }, []);

  const openLogin = () => {
    setIsLoginOpen(true);
    setIsRegisterOpen(false);
    setIsSettingsOpen(false);
  };

  const openRegister = () => {
    setIsRegisterOpen(true);
    setIsLoginOpen(false);
    setIsSettingsOpen(false);
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
  };

  const closeForms = () => {
    setIsClosing(true); // Устанавливаем анимацию закрытия
    setTimeout(() => {
      setIsLoginOpen(false);
      setIsRegisterOpen(false);
      setIsSettingsOpen(false);
      setIsClosing(false); // Сбрасываем состояние
    }, 300); // Тайминг синхронизирован с анимацией CSS
  };
  
  const handleRegisterSuccess = () => {
    initializeUser(); // После успешной регистрации и входа обновляем состояние
    setIsRegisterOpen(false);
    setIsLoginOpen(false);
    showToast('Вы успешно зарегистрировались!', 'success');
  };

  const handleLoginSuccess = () => {
    initializeUser(); // После успешного входа обновляем состояние
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
  };

  const handleLogout = () => {
    // Сделать запрос на выход
    fetch('http://localhost:5000/scenario_authorization/logout', {
      method: 'POST',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(null); // Сбрасываем состояние пользователя
          showToast('Вы успешно вышли из системы.', 'success');
        }
      })
      .catch(err => {
        console.error(err);
        showToast('Ошибка при выходе из системы.', 'error');
      });
  };

  const handleProfileUpdated = () => {
    showToast('Профиль обновлён!', 'success');
    setIsSettingsOpen(false);
    initializeUser(); // Обновляем информацию о пользователе
  };

  const handleProfileDeleted = () => {
    showToast('Профиль удалён', 'success');
    setUser(null); // Сбрасываем состояние пользователя
    setIsSettingsOpen(false);
  };

  // Если данные о пользователе загружаются, показываем загрузчик или ничего
  if (loading) {
    return (
      <div className="main-wrapper">
        <div className="main-container">
          <div className="main-header">
            <h1>Добро пожаловать на наш сайт!</h1>
            <div className="auth-buttons">
              <div className="spinner"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      {isLoading && <div className="spinner center-spinner show"></div>}
      <div
        className={`main-container ${
          isLoginOpen || isRegisterOpen || isSettingsOpen ? 'blur' : ''
        }`}
      >
        <div className="main-header">
          <h1>Добро пожаловать на наш сайт!</h1>
          <div className="auth-buttons">
            {!user ? (
              <>
                <button onClick={openLogin}>
                  <span className={`auth-button-content ${isLoginOpen ? 'hidden' : ''}`}>Вход</span>
                  {isLoginOpen && <div className="spinner"></div>}
                </button>
                <button onClick={openRegister}>
                  <span className={`auth-button-content ${isRegisterOpen ? 'hidden' : ''}`}>
                    Регистрация
                  </span>
                  {isRegisterOpen && <div className="spinner"></div>}
                </button>
              </>
            ) : (
              <ProfileMenu user={user} onLogout={handleLogout} onOpenSettings={openSettings} />
            )}
          </div>
        </div>

        <div className="main-content">
        <div className="description-box">
          <h2>Добро пожаловать на наш сайт</h2>
          <p>
            Мы помогаем работодателям и HR-специалистам создавать уникальные сценарии для общения с кандидатами.
            Наши инструменты позволяют выявить ключевые компетенции, навыки и опыт, чтобы найти идеального сотрудника.
          </p>
          <ul>
            <li>Индивидуальные опросники для собеседований</li>
            <li>Генерация сценариев общения</li>
            <li>Автоматизация оценки кандидатов</li>
            <li>Интуитивно понятный интерфейс</li>
          </ul>
          <p>
            Начните использовать наш сайт уже сегодня и получите профессиональный инструмент для эффективного подбора персонала.
          </p>
        </div>
          <div className="start-box">
            <h2>Начало работы</h2>
            <div className="task">
              <span>Создайте своё резюме</span>
              <button >Начать</button>
            </div>
            <div className="task">
              <span>Управляйте проектами</span>
              <button onClick={() => navigate('/projects')}>Открыть</button>
            </div>
            <div className="task">
              <span>Войдите в свой профиль</span>
              <button
                onClick={() => {
                  if (user) {
                    showToast('Вы уже вошли в систему.', 'info');
                  } else {
                    openLogin();
                  }
                }}
              >
                Войти
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-container">
        {isLoginOpen && (
          <LoginForm
            isClosing={isClosing}
            onRegisterClick={openRegister}
            onClose={closeForms}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
        {isRegisterOpen && (
          <RegisterForm
            isClosing={isClosing}
            onClose={closeForms}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}
        {isSettingsOpen && (
          <ProfileSettingsModal
            isClosing={isClosing}
            onClose={closeForms}
            onProfileUpdated={handleProfileUpdated}
            onProfileDeleted={handleProfileDeleted}
          />
        )}
      </div>
    </div>
  );
};

export default MainPage;
