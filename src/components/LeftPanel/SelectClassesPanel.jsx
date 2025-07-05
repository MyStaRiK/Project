import React from 'react';
import PropTypes from 'prop-types';
import Panel from './Panel';

const SelectClassesPanel = ({
  isOpen, toggleOpen,
  classes, selectedClasses, filteredClasses,
  classSearch, setClassSearch,
  handleClassCheckboxChange,
  panelHeaderClass
}) => {
  
  const onClassCheckboxChange = (value, checked) => {
    handleClassCheckboxChange(value, checked);
  };

  return (
    <Panel 
      isOpen={isOpen} 
      toggleOpen={toggleOpen} 
      title="Выберите классы" 
      panelHeaderClass={panelHeaderClass}
    >
      <div className="search-container">
        <input
          type="text"
          placeholder="Поиск классов..."
          value={classSearch}
          onChange={(e) => setClassSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredClasses.length > 0 ? (
        <div className="multi-column">
          {filteredClasses.map((cls) => (
            <label key={cls.id} className="checkbox-item">
              <input
                type="checkbox"
                value={cls.name}
                checked={selectedClasses.includes(cls.name)}
                onChange={(e) =>
                  onClassCheckboxChange(e.target.value, e.target.checked)
                }
              />
              <span className="checkbox-label-text">{cls.name}</span>
            </label>
          ))}
        </div>
      ) : (
        <p>
          {classes.length === 0
            ? 'Загрузка классов...'
            : classSearch
            ? 'Ничего не найдено'
            : 'Нет доступных классов'}
        </p>
      )}
    </Panel>
  );
};

SelectClassesPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  classes: PropTypes.array.isRequired,
  selectedClasses: PropTypes.array.isRequired,
  filteredClasses: PropTypes.array.isRequired,
  classSearch: PropTypes.string.isRequired,
  setClassSearch: PropTypes.func.isRequired,
  handleClassCheckboxChange: PropTypes.func.isRequired,
  panelHeaderClass: PropTypes.func.isRequired,
};

export default SelectClassesPanel;
