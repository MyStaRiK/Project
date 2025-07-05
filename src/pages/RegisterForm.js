import React, { useState } from 'react';
import '../styles/AuthForms.css';

const RegisterForm = ({ onClose, onRegisterSuccess, isClosing }) => {
  const [email, setEmail] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Ошибки по каждому полю
  const [emailError, setEmailError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassError, setConfirmPassError] = useState('');
  // Общая ошибка (например, от сервера)
  const [commonError, setCommonError] = useState('');

  // Признак успеха
  const [isSuccess, setIsSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false); // Состояние загрузки

  // Обработчики ввода, чтобы при каждом изменении поля очищать прежние ошибки
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError('');
    setCommonError('');
  };
  const handleLoginChange = (e) => {
    setLogin(e.target.value);
    setLoginError('');
    setCommonError('');
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError('');
    setCommonError('');
  };
  const handleConfirmPassChange = (e) => {
    setConfirmPass(e.target.value);
    setConfirmPassError('');
    setCommonError('');
  };

  const validate = () => {
    let valid = true;
    setEmailError('');
    setLoginError('');
    setPasswordError('');
    setConfirmPassError('');
    setCommonError('');

    if (!email || !email.includes('@')) {
      setEmailError('Некорректный email');
      valid = false;
    }
    if (!login) {
      setLoginError('Введите логин');
      valid = false;
    }
    if (!password) {
      setPasswordError('Введите пароль');
      valid = false;
    }
    if (password !== confirmPass) {
      setPasswordError('Пароли не совпадают');
      setConfirmPassError('Пароли не совпадают');
      valid = false;
    }
    return valid;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true); // Начало загрузки
    try {
      const res = await fetch('http://localhost:5000/scenario_authorization/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, login, password })
      });
      const data = await res.json();
      if (!res.ok) {
        // Сервер вернул ошибку
        setCommonError(data.error || 'Ошибка при регистрации');
        if (data.error) {
          if (data.error.includes('Email')) {
            setEmailError(data.error);
          }
          if (data.error.includes('логин')) {
            setLoginError(data.error);
          }
        }
        return;
      }
      // Успех
      setIsSuccess(true);
      // через секунду вызываем onRegisterSuccess
      setTimeout(() => {
        onRegisterSuccess && onRegisterSuccess();
      }, 1000);
    } catch (err) {
      console.error(err);
      setCommonError('Сетевая ошибка');
    } finally {
      setIsLoading(false); // Завершение загрузки
    }
  };

  // Если уже успешно зарегистрировались, показываем только окошко успеха
  if (isSuccess) {
    return (
      <div className="success-modal-container">
        <div className="success-modal">
          Вы успешно зарегистрировались!
        </div>
      </div>
    );
  }

  // Иначе рендерим обычную форму
  return (
    <div className={`form-container ${isClosing ? 'closing' : ''}`}>
      <div className="form-content">
        <h2>Регистрация</h2>
        {commonError && <p className="error-message">{commonError}</p>}

        <label>
          Электронная почта:
          <input
            type="text"
            placeholder="Введите вашу почту"
            value={email}
            onChange={handleEmailChange}
            className={emailError ? 'error-field' : ''}
          />
        </label>
        {emailError && <p className="error-message">{emailError}</p>}

        <label>
          Логин:
          <input
            type="text"
            placeholder="Придумайте логин"
            value={login}
            onChange={handleLoginChange}
            className={loginError ? 'error-field' : ''}
          />
        </label>
        {loginError && <p className="error-message">{loginError}</p>}

        <label>
          Пароль:
          <input
            type="password"
            placeholder="Придумайте пароль"
            value={password}
            onChange={handlePasswordChange}
            className={passwordError ? 'error-field' : ''}
          />
        </label>
        {passwordError && <p className="error-message">{passwordError}</p>}

        <label>
          Повторите пароль:
          <input
            type="password"
            placeholder="Повторите пароль"
            value={confirmPass}
            onChange={handleConfirmPassChange}
            className={confirmPassError ? 'error-field' : ''}
          />
        </label>
        {confirmPassError && <p className="error-message">{confirmPassError}</p>}

        <div className="form-buttons">
          <button onClick={onClose} disabled={isLoading}>
            <span className={`button-content ${isLoading ? 'hidden' : ''}`}>Закрыть</span>
            {isLoading && <div className="spinner"></div>}
          </button>
          <button onClick={handleRegister} disabled={isLoading}>
            <span className={`button-content ${isLoading ? 'hidden' : ''}`}>Зарегистрироваться</span>
            {isLoading && <div className="spinner"></div>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
