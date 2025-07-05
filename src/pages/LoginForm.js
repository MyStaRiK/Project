import React, { useState } from 'react';
import '../styles/AuthForms.css';

const LoginForm = ({ onRegisterClick, onClose, onLoginSuccess, isClosing }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [commonError, setCommonError] = useState('');

  const [isLoading, setIsLoading] = useState(false); 

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setCommonError('');

    if (!email || !email.includes('@')) {
      setEmailError('Некорректный email');
      valid = false;
    }
    if (!password) {
      setPasswordError('Введите пароль');
      valid = false;
    }
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true); 
    try {
      const res = await fetch('http://51.250.4.123:5000//scenario_authorization/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error.includes('пароль')) {
          setPasswordError(data.error);
        } else if (data.error.includes('почтой')) {
          setEmailError(data.error);
        } else {
          setCommonError(data.error);
        }
        return;
      }
      onLoginSuccess && onLoginSuccess(); 
    } catch (err) {
      console.error(err);
      setCommonError('Сетевая ошибка');
    } finally {
      setIsLoading(false); 
    }
  };  

  return (
    <div className={`form-container ${isClosing ? 'closing' : ''}`}>
      <div className="form-content">
        <h2>Вход</h2>
        {commonError && <p className="error-message">{commonError}</p>}

        <label>
          Электронная почта:
          <input
            type="text"
            placeholder="Введите почту"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={emailError ? 'error-field' : ''}
          />
        </label>
        {emailError && <p className="error-message">{emailError}</p>}

        <label>
          Пароль:
          <input
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={passwordError ? 'error-field' : ''}
          />
        </label>
        {passwordError && <p className="error-message">{passwordError}</p>}

        <div className="form-buttons">
          <button onClick={onClose} disabled={isLoading}>
            <span className={`button-content ${isLoading ? 'hidden' : ''}`}>Закрыть</span>
            {isLoading && <div className="spinner"></div>}
          </button>
          <button onClick={handleLogin} disabled={isLoading}>
            <span className={`button-content ${isLoading ? 'hidden' : ''}`}>Войти</span>
            {isLoading && <div className="spinner"></div>}
          </button>
        </div>
        <p className="register-link" onClick={onRegisterClick}>
          Регистрация
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
