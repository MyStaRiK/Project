// src/components/LeftPanel/SelectCharacteristicsPanel.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Panel from './Panel';
import './SelectCharacteristicsPanelToggle.css'; // Импортируем новый CSS

const SelectCharacteristicsPanel = ({
  isOpen, toggleOpen,
  selectedClasses, characteristicsByClass,
  charSearch, setCharSearch,
  handleCharacteristicChange,
  panelHeaderClass
}) => {
  
  const [collapsedClasses, setCollapsedClasses] = useState(new Set());
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  const toggleShowSelectedOnly = () => {
    setShowSelectedOnly((prev) => !prev);
  };

  const handleToggleAllForClass = (className) => {
    if (collapsedClasses.has(className)) {
      // Если класс скрыт, показываем все
      setCollapsedClasses((prev) => {
        const newSet = new Set(prev);
        newSet.delete(className);
        return newSet;
      });
    } else {
      // Если класс открыт, скрываем все
      setCollapsedClasses((prev) => {
        const newSet = new Set(prev);
        newSet.add(className);
        return newSet;
      });
    }
  };

  return (
    <Panel 
      isOpen={isOpen} 
      toggleOpen={toggleOpen} 
      title="Выбор характеристик" 
      panelHeaderClass={panelHeaderClass}
    >
      {selectedClasses.length === 0 && <p>Сначала выберите классы выше</p>}

      {selectedClasses.length > 0 && (
        <>
          <div className="search-and-button-container">
            <div className="search-container">
              <input
                type="text"
                placeholder="Поиск характеристик..."
                value={charSearch}
                onChange={(e) => setCharSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <button
              type="button"
              className="show-selected-btn"
              onClick={toggleShowSelectedOnly}
            >
              {showSelectedOnly ? 'Показать все' : 'Показать выбранные'}
            </button>
          </div>

          {selectedClasses.map((className) => {
            const allChars = characteristicsByClass[className] || [];
            const displayedChars = showSelectedOnly
              ? allChars.filter((c) => c.selected)
              : allChars.filter((c) =>
                  c.name.toLowerCase().includes(charSearch.toLowerCase())
                );

            if (showSelectedOnly && displayedChars.length === 0) {
              return null;
            }

            const isCollapsed = collapsedClasses.has(className);

            return (
              <div key={className} className="class-characteristics-group">
                <div className="select-char-class-title">
                  <h4>{className}</h4>
                  <button 
                    type="button" 
                    className="select-char-toggle-button"
                    onClick={() => handleToggleAllForClass(className)}
                  >
                    {isCollapsed ? 'Показать' : 'Скрыть'}
                  </button>
                </div>

                {!isCollapsed && (
                  <>
                    {allChars.length === 0 && (
                      <p>Загрузка характеристик...</p>
                    )}

                    {allChars.length > 0 && displayedChars.length === 0 && !showSelectedOnly && (
                      <p>Ничего не найдено</p>
                    )}

                    {displayedChars.length > 0 && (
                      <ul className="characteristics-list grid-columns">
                        {displayedChars.map((char) => (
                          <li key={`${className}-${char.id}`}>
                            <div className={`characteristic-item ${char.scale ? 'scale-chosen' : ''}`}>
                              <label className="characteristic-label">
                                <input
                                  type="checkbox"
                                  checked={char.selected}
                                  onChange={() =>
                                    handleCharacteristicChange(className, char.name)
                                  }
                                />
                                <span className="checkbox-label-text">
                                  {char.name}
                                </span>
                              </label>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </>
      )}
    </Panel>
  );
};

SelectCharacteristicsPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  selectedClasses: PropTypes.array.isRequired,
  characteristicsByClass: PropTypes.object.isRequired,
  charSearch: PropTypes.string.isRequired,
  setCharSearch: PropTypes.func.isRequired,
  handleCharacteristicChange: PropTypes.func.isRequired,
  panelHeaderClass: PropTypes.func.isRequired,
};

export default SelectCharacteristicsPanel;
