import React, { useContext } from 'react';
import '../styles/ResumeDesigns.css';
import { DesignContext } from '../context/DesignContext'; // Импорт контекста

const ResumeDesigns = () => {
  const { design, setDesign } = useContext(DesignContext); // Получаем состояние из контекста

  const handleDesignChange = (key, value) => {
    setDesign((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="resume-designs">
      <div className="design-settings">
        <h2>Настройки дизайна</h2>

        {/* Заголовок проекта */}
        <div className="setting-group bordered">
          <h3 className="setting-title">Заголовок проекта</h3>
          <div className="alignment-options">
            <button
              className={`alignment-button left ${design.headerAlignment === 'left' ? 'active' : ''}`}
              onClick={() => handleDesignChange('headerAlignment', 'left')}
            >
              Влево
            </button>
            <button
              className={`alignment-button center ${design.headerAlignment === 'center' ? 'active' : ''}`}
              onClick={() => handleDesignChange('headerAlignment', 'center')}
            >
              По центру
            </button>
            <button
              className={`alignment-button right ${design.headerAlignment === 'right' ? 'active' : ''}`}
              onClick={() => handleDesignChange('headerAlignment', 'right')}
            >
              Вправо
            </button>
          </div>
          <div className="font-settings">
            <div className="color-options">
              <span className="label">Цвет текста:</span>
              {['#FF0000', '#00FF00', '#0000FF'].map((color, index) => (
                <div
                  key={index}
                  className="color-circle"
                  style={{ backgroundColor: color }}
                  onClick={() => handleDesignChange('headerColor', color)}
                ></div>
              ))}
              <div
                className="color-circle"
                style={{ backgroundColor: design.headerColor }}
                onClick={() => document.getElementById('header-color-picker').click()}
              >
                <input
                  type="color"
                  id="header-color-picker"
                  className="color-picker"
                  value={design.headerColor}
                  onChange={(e) => handleDesignChange('headerColor', e.target.value)}
                />
              </div>
            </div>
            <div className="font-row">
              <div className="font-size-controls">
                <span className="label">Размер шрифта:</span>
                <button
                  onClick={() =>
                    handleDesignChange('headerFontSize', Math.max(10, design.headerFontSize - 1))
                  }
                >
                  -
                </button>
                <span>{design.headerFontSize}px</span>
                <button
                  onClick={() =>
                    handleDesignChange('headerFontSize', Math.min(36, design.headerFontSize + 1))
                  }
                >
                  +
                </button>
              </div>
              <div className="font-select">
                <span className="label">Шрифт:</span>
                <select
                  value={design.headerFont}
                  onChange={(e) => handleDesignChange('headerFont', e.target.value)}
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Основной текст */}
        <div className="setting-group bordered">
          <h3 className="setting-title">Основной текст</h3>
          <div className="alignment-options">
            <button
              className={`alignment-button left ${design.textAlignment === 'left' ? 'active' : ''}`}
              onClick={() => handleDesignChange('textAlignment', 'left')}
            >
              Влево
            </button>
            <button
              className={`alignment-button center ${design.textAlignment === 'center' ? 'active' : ''}`}
              onClick={() => handleDesignChange('textAlignment', 'center')}
            >
              По центру
            </button>
            <button
              className={`alignment-button right ${design.textAlignment === 'right' ? 'active' : ''}`}
              onClick={() => handleDesignChange('textAlignment', 'right')}
            >
              Вправо
            </button>
          </div>
          <div className="font-settings">
            <div className="color-options">
              <span className="label">Цвет текста:</span>
              {['#FF0000', '#00FF00', '#0000FF'].map((color, index) => (
                <div
                  key={index}
                  className="color-circle"
                  style={{ backgroundColor: color }}
                  onClick={() => handleDesignChange('textColor', color)}
                ></div>
              ))}
              <div
                className="color-circle"
                style={{ backgroundColor: design.textColor }}
                onClick={() => document.getElementById('text-color-picker').click()}
              >
                <input
                  type="color"
                  id="text-color-picker"
                  className="color-picker"
                  value={design.textColor}
                  onChange={(e) => handleDesignChange('textColor', e.target.value)}
                />
              </div>
            </div>
            <div className="font-row">
              <div className="font-size-controls">
                <span className="label">Размер шрифта:</span>
                <button
                  onClick={() =>
                    handleDesignChange('textFontSize', Math.max(10, design.textFontSize - 1))
                  }
                >
                  -
                </button>
                <span>{design.textFontSize}px</span>
                <button
                  onClick={() =>
                    handleDesignChange('textFontSize', Math.min(36, design.textFontSize + 1))
                  }
                >
                  +
                </button>
              </div>
              <div className="font-select">
                <span className="label">Шрифт:</span>
                <select
                  value={design.textFont}
                  onChange={(e) => handleDesignChange('textFont', e.target.value)}
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Дата */}
        <div className="setting-group bordered">
          <h3 className="setting-title">Дата и время</h3>
          <div className="alignment-options">
            <button
              className={`alignment-button left ${design.dateAlignment === 'left' ? 'active' : ''}`}
              onClick={() => handleDesignChange('dateAlignment', 'left')}
            >
              Влево
            </button>
            <button
              className={`alignment-button center ${design.dateAlignment === 'center' ? 'active' : ''}`}
              onClick={() => handleDesignChange('dateAlignment', 'center')}
            >
              По центру
            </button>
            <button
              className={`alignment-button right ${design.dateAlignment === 'right' ? 'active' : ''}`}
              onClick={() => handleDesignChange('dateAlignment', 'right')}
            >
              Вправо
            </button>
          </div>
        </div>

        {/* Контактные данные */}
        <div className="setting-group bordered">
          <h3 className="setting-title">Контактные данные</h3>
          <div className="alignment-options">
            <button
              className={`alignment-button left ${design.contactAlignment === 'left' ? 'active' : ''}`}
              onClick={() => handleDesignChange('contactAlignment', 'left')}
            >
              Влево
            </button>
            <button
              className={`alignment-button center ${design.contactAlignment === 'center' ? 'active' : ''}`}
              onClick={() => handleDesignChange('contactAlignment', 'center')}
            >
              По центру
            </button>
            <button
              className={`alignment-button right ${design.contactAlignment === 'right' ? 'active' : ''}`}
              onClick={() => handleDesignChange('contactAlignment', 'right')}
            >
              Вправо
            </button>
          </div>
        </div>
      </div>

      {/* Превью резюме */}
      <div className="resume-preview">
        <div className="page">
          <h2
            style={{
              textAlign: design.headerAlignment,
              color: design.headerColor,
              fontSize: `${design.headerFontSize}px`,
              fontFamily: design.headerFont,
            }}
          >
            Заголовок проекта
          </h2>
          <p
            style={{
              textAlign: design.textAlignment,
              color: design.textColor,
              fontSize: `${design.textFontSize}px`,
              fontFamily: design.textFont,
            }}
          >
            Пример основного текста. Здесь вы увидите изменения.
          </p>
          <p style={{ textAlign: design.dateAlignment }}>01.01.2023</p>
          <p style={{ textAlign: design.contactAlignment }}>example@mail.com</p>
        </div>
      </div>
    </div>
  );
};

export default ResumeDesigns;
