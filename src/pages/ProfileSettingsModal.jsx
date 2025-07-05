import React, { useState } from 'react';
import '../styles/AuthForms.css';
import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext'; 

const ConfirmModal = ({ onConfirm, onCancel}) => {
  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <h3>Подтвердите действие</h3>
        <p>Вы уверены, что хотите удалить профиль?</p>
        <div className="confirm-buttons">
          <button onClick={onCancel}>Отмена</button>
          <button
            style={{
              backgroundColor: 'red',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: 4,
              cursor: 'pointer',
            }}
            onClick={onConfirm}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileSettingsModal = ({ onClose, onProfileUpdated, onProfileDeleted, isClosing  }) => {
  const [newEmail, setNewEmail] = useState('');
  const [newLogin, setNewLogin] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Ошибки по отдельным полям
  const [emailError, setEmailError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [oldPassError, setOldPassError] = useState('');
  // ... можно и для newPassword делать
  const [commonError, setCommonError] = useState('');

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Состояние загрузки

  const { showToast } = useContext(ToastContext); // Получаем функцию showToast

  const validate = () => {
    let valid = true;
    setEmailError('');
    setLoginError('');
    setOldPassError('');
    setCommonError('');

    // Если старый пароль не заполнен, это обязательно:
    if (!oldPassword) {
      setOldPassError('Старый пароль обязателен');
      valid = false;
    }
    // При желании проверять newEmail / newLogin
    // например, если newEmail != '' и без @, то ошибка.

    return valid;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsLoading(true); // Начало загрузки
    try {
      const res = await fetch('http://localhost:5000/scenario_authorization/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newEmail, newLogin, oldPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        // Ошибка от сервера
        setCommonError(data.error || 'Ошибка при обновлении профиля');
        // Можно распарсить data.error и, если там «Email уже зарегистрирован», поставить emailError, и т.п.
        if (data.error && data.error.includes('Email')) {
          setEmailError(data.error);
        }
        if (data.error && data.error.includes('логин')) {
          setLoginError(data.error);
        }
        if (data.error && data.error.includes('Старый пароль')) {
          setOldPassError(data.error);
        }
        return;
      }
      // Успех
      onProfileUpdated && onProfileUpdated();
      showToast('Профиль обновлён!', 'success');
    } catch (err) {
      console.error(err);
      setCommonError('Сетевая ошибка');
    } finally {
      setIsLoading(false); // Завершение загрузки
    }
  };

  const handleDeleteProfile = () => {
    // Вместо window.confirm
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setIsConfirmOpen(false);
    setIsLoading(true); // Начало загрузки
    try {
      const res = await fetch('http://localhost:5000/scenario_authorization/profile', {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        setCommonError(data.error || 'Ошибка при удалении профиля');
        showToast(data.error || 'Ошибка при удалении профиля', 'error');
        return;
      }
      onProfileDeleted && onProfileDeleted();
      showToast('Профиль удалён', 'success');
    } catch (err) {
      console.error(err);
      setCommonError('Сетевая ошибка');
      showToast('Сетевая ошибка при удалении профиля', 'error');
    } finally {
      setIsLoading(false); // Завершение загрузки
    }
  };

  const cancelDelete = () => {
    setIsConfirmOpen(false);
  };

  return (
    <>
      <div className={`form-container ${isClosing ? 'closing' : ''}`}>
        <div className="form-content">
          <h2>Настройка профиля</h2>
          {commonError && <p className="error-message">{commonError}</p>}

          <label>
            Новый Email (опционально):
            <input
              type="text"
              placeholder="Введите новый email"
              value={newEmail}
              onChange={e => {
                setNewEmail(e.target.value);
                setEmailError('');
                setCommonError('');
              }}
              className={emailError ? 'error-field' : ''}
            />
          </label>
          {emailError && <p className="error-message">{emailError}</p>}

          <label>
            Новый логин (опционально):
            <input
              type="text"
              placeholder="Введите новый логин"
              value={newLogin}
              onChange={e => {
                setNewLogin(e.target.value);
                setLoginError('');
                setCommonError('');
              }}
              className={loginError ? 'error-field' : ''}
            />
          </label>
          {loginError && <p className="error-message">{loginError}</p>}

          <label>
            Старый пароль (обязательно):
            <input
              type="password"
              placeholder="Введите старый пароль"
              value={oldPassword}
              onChange={e => {
                setOldPassword(e.target.value);
                setOldPassError('');
                setCommonError('');
              }}
              className={oldPassError ? 'error-field' : ''}
            />
          </label>
          {oldPassError && <p className="error-message">{oldPassError}</p>}

          <label>
            Новый пароль (опционально):
            <input
              type="password"
              placeholder="Введите новый пароль"
              value={newPassword}
              onChange={e => {
                setNewPassword(e.target.value);
                setCommonError('');
              }}
            />
          </label>

          <div className="form-buttons">
            <button onClick={onClose} disabled={isLoading}>
              <span className={`button-content ${isLoading ? 'hidden' : ''}`}>Отмена</span>
              {isLoading && <div className="spinner"></div>}
            </button>
            <button onClick={handleSave} disabled={isLoading}>
              <span className={`button-content ${isLoading ? 'hidden' : ''}`}>Сохранить</span>
              {isLoading && <div className="spinner"></div>}
            </button>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              style={{
                backgroundColor: 'red',
                color: '#fff',
                padding: '8px 16px',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
              onClick={handleDeleteProfile}
              disabled={isLoading}
            >
              {isLoading ? <div className="spinner"></div> : 'Удалить профиль'}
            </button>
          </div>
        </div>
      </div>

      {/* Кастомное подтверждение удаления */}
      {isConfirmOpen && (
        <ConfirmModal onConfirm={confirmDelete} onCancel={cancelDelete} />
      )}
    </>
  );
};

export default ProfileSettingsModal;
