import React from 'react';
import { FaFileAlt, FaPen, FaQuestionCircle, FaDownload, FaBars } from 'react-icons/fa';
import '../styles/Header.css';

const Header = ({
  projectId,
  resumeTitle,
  onTitleChange,
  activeTab,
  onTabChange,
  onSave,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleTitleChange = (e) => {
    onTitleChange && onTitleChange(e.target.value);
  };
  const handleTabClick = (tab) => {
    onTabChange && onTabChange(tab);
  };

  return (
    <header className="header">
      <div className="header-top-row">
        <input
          type="text"
          className="resume-title-input"
          value={resumeTitle}
          onChange={handleTitleChange}
          style={{ opacity: resumeTitle === 'Новый проект' ? 0.5 : 1 }}
        />

        <div className="header-top-right">
          <button className="export-button">
            <FaDownload className="icon-right" /> Экспорт PDF
          </button>
          <div className="menu-container">
            <button
              className={`menu-button ${isMenuOpen ? 'active-menu' : ''}`}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <FaBars className="icon-right" /> Меню
            </button>
            {isMenuOpen && (
              <ul className="dropdown-menu">
                <li>Пункт 1</li>
                <li>Пункт 2</li>
                <li>Пункт 3</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Вторая строка */}
      <div className="header-nav-row">
        <div className="header-nav-left">
          <button
            className={`nav-button ${activeTab === 'Редактирование' ? 'active' : ''}`}
            onClick={() => handleTabClick('Редактирование')}
          >
            <FaFileAlt className="icon" /> Редактирование
          </button>
          <button
            className={`nav-button ${activeTab === 'Дизайн' ? 'active' : ''}`}
            onClick={() => handleTabClick('Дизайн')}
          >
            <FaPen className="icon" /> Дизайн
          </button>
          <button
            className={`nav-button ${activeTab === 'Помощь' ? 'active' : ''}`}
            onClick={() => handleTabClick('Помощь')}
          >
            <FaQuestionCircle className="icon" /> Помощь
          </button>
        </div>
        <div className="header-nav-right">
          <button
            className="save-button-project"
            onClick={onSave}
            disabled={!projectId}
          >
            Сохранить
          </button>
          <button
            className="delete-button-project"
            onClick={onDelete}
            disabled={!projectId}
          >
            Удалить
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
