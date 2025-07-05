// Sidebar.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';
import { FaHome, FaList, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { useUnsavedContext } from '../context/UnsavedContext';

const ConfirmLeaveModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <h3>Несохранённые изменения</h3>
        <p>У вас есть несохранённые изменения. Уйти без сохранения?</p>
        <div className="confirm-buttons">
          <button className="cancel-button" onClick={onCancel}>
            Нет
          </button>
          <button className="delete-button" onClick={onConfirm}>
            Да
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDirty, setIsDirty } = useUnsavedContext();

  // Отслеживаем, открыто ли меню:
  const [isOpen, setIsOpen] = useState(false);

  // Модалка «Уйти без сохранения?»
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);

  // Клик по пункту меню
  const handleLinkClick = (path) => {
    if (isDirty) {
      setPendingPath(path);
      setShowConfirmLeave(true);
    } else {
      navigate(path);
      setIsOpen(false); // сворачиваем меню после перехода
    }
  };

  // Пользователь подтвердил «Уйти без сохранения»
  const confirmLeave = () => {
    setShowConfirmLeave(false);
    if (pendingPath) {
      setIsDirty(false);
      navigate(pendingPath);
      setPendingPath(null);
      setIsOpen(false); // сворачиваем меню
    }
  };

  // Отмена выхода
  const cancelLeave = () => {
    setShowConfirmLeave(false);
    setPendingPath(null);
  };

  // Определяем «активность» пункта (подсветка)
  const isMainActive = location.pathname === '/';
  const isProjectsActive =
    location.pathname.startsWith('/projects') ||
    location.pathname.startsWith('/edit-project');

  return (
    <>
      <div
        className={`sidebar ${isOpen ? 'open' : 'closed'}`}
        // При выходе курсора с контейнера — сворачиваем
        onMouseLeave={() => {
          if (isOpen) setIsOpen(false);
        }}
      >
        {/* Кнопка-стрелочка */}
        <button className="toggle-button" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaArrowLeft /> : <FaArrowRight />}
        </button>

        {/* Блок с пунктами меню */}
        <div className="menu-items">
          {/* Главная */}
          <div
            className={`menu-item ${isMainActive ? 'active' : ''}`}
            onClick={() => handleLinkClick('/')}
          >
            <div className="icon-container">
              <FaHome className="icon" />
            </div>
            {/* Показываем текст только если isOpen=true */}
            {isOpen && <span className="text">Главная</span>}
          </div>

          {/* Проекты */}
          <div
            className={`menu-item ${isProjectsActive ? 'active' : ''}`}
            onClick={() => handleLinkClick('/projects')}
          >
            <div className="icon-container">
              <FaList className="icon" />
            </div>
            {isOpen && <span className="text">Проекты</span>}
          </div>
        </div>
      </div>

      {/* Модалка «Уйти без сохранения?» */}
      {showConfirmLeave && (
        <ConfirmLeaveModal onConfirm={confirmLeave} onCancel={cancelLeave} />
      )}
    </>
  );
};

export default Sidebar;
