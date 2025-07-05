// ProfileMenu.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaCog, FaSignOutAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ProfileMenu = ({ onLogout, onOpenSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  // Хранит, навели ли мы мышь на кнопку
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  // Хранит, на какой пункт меню навели мышь
  const [hoveredMenuItem, setHoveredMenuItem] = useState(null);

  // Создаём реф, чтобы отслеживать клики снаружи
  const menuRef = useRef(null);

  useEffect(() => {
    // Загрузка профиля
    fetch('http://localhost:5000/scenario_authorization/profile', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProfile(data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // При каждом изменении isOpen, вешаем/снимаем listener на клик за пределами
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    // Очистка listener при размонтировании
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClickOutside = (e) => {
    // Если клик был вне зоны меню (menuRef), скрываем меню
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    fetch('http://localhost:5000/scenario_authorization/logout', {
      method: 'POST',
      credentials: 'include'
    })
      .then(() => {
        onLogout();
      })
      .catch(err => console.error(err));
  };

  if (!profile) {
    // Пока профиль не загружен
    return null;
  }

  // Аватарка — первая буква
  const firstLetter = profile.email
    ? profile.email.charAt(0).toUpperCase()
    : profile.login.charAt(0).toUpperCase();

  // Стили кнопки профиля (аватарка + стрелочка)
  const profileButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: '#fff',
    color: '#000',
    border: '1px solid #000',
    padding: '5px 10px',
    borderRadius: '20px',
    transition: 'background-color 0.2s',
    ...(isButtonHovered ? { backgroundColor: '#f0f0f0' } : {})
  };

  // Аватарка
  const avatarStyle = {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: '#004d40',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  };

  // Общее меню
  const dropdownStyle = {
    position: 'absolute',
    right: 0,
    top: 60, // Добавили чуть больше отступа сверху
    backgroundColor: '#fff',
    color: '#000',
    border: '1px solid #ddd',
    borderRadius: 4,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    width: 220,
    zIndex: 9999,
    padding: '10px'
  };

  // Общие стили пункта меню
  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '5px 0',
    transition: 'background-color 0.2s'
  };

  // Возвращает стиль для пункта меню с учётом hover
  const getMenuItemStyle = (itemName) => {
    const isHovered = hoveredMenuItem === itemName;
    return {
      ...menuItemStyle,
      ...(isHovered ? { backgroundColor: '#f0f0f0' } : {})
    };
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
      {/* Кнопка профиля */}
      <div
        style={profileButtonStyle}
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
        onClick={toggleMenu}
      >
        {/* Аватарка */}
        <div style={avatarStyle}>{firstLetter}</div>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </div>

      {/* Выпадающее меню */}
      {isOpen && (
        <div style={dropdownStyle}>
          {/* login + email */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              {profile.login || 'Профиль'}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {profile.email || ''}
            </div>
            <hr style={{ margin: '10px 0' }} />
          </div>

          {/* Настройка профиля */}
          <div
            style={getMenuItemStyle('settings')}
            onMouseEnter={() => setHoveredMenuItem('settings')}
            onMouseLeave={() => setHoveredMenuItem(null)}
            onClick={() => {
              setIsOpen(false);
              onOpenSettings && onOpenSettings();
            }}
          >
            <FaCog style={{ marginRight: 8 }} />
            <span>Настройка профиля</span>
          </div>

          {/* Выход */}
          <div
            style={getMenuItemStyle('logout')}
            onMouseEnter={() => setHoveredMenuItem('logout')}
            onMouseLeave={() => setHoveredMenuItem(null)}
            onClick={handleLogout}
          >
            <FaSignOutAlt style={{ marginRight: 8 }} />
            <span>Выход</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
