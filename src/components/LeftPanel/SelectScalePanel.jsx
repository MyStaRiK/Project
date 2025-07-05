import React from 'react';
import PropTypes from 'prop-types';
import Panel from './Panel';
import './SelectScalePanel.css'; // Убедитесь, что стили добавлены

const SelectScalePanel = ({
  isOpen, toggleOpen,
  selectedCharacteristics, scales,
  handleScaleChange,
  panelHeaderClass
}) => {
  
  const removeLanguagePrefix = (str) => {
    if (!str) return str;
    if (str.startsWith('Язык ')) {
      return str.slice(5);
    }
    return str;
  };

  return (
    <Panel 
      isOpen={isOpen} 
      toggleOpen={toggleOpen} 
      title="Выбор шкалы оценивания" 
      panelHeaderClass={panelHeaderClass}
    >
      {selectedCharacteristics.length === 0 && (
        <p>Сначала выберите характеристики во втором блоке</p>
      )}

      {selectedCharacteristics.map((group) => (
        <div key={group.className} className="class-characteristics-group">
          <h4 className="class-title">{group.className}</h4>
          <ul className="characteristics-list grid-columns">
            {group.chars.map((char) => {
              const actualName = removeLanguagePrefix(char.name);
              const availableScales = scales[actualName];

              return (
                <li key={`${group.className}-${char.id}`}>
                  <div className={`characteristic-item ${char.scale ? 'scale-chosen' : ''}`}>
                    <p className="checkbox-label-text">
                      <b>{char.name}</b>
                    </p>
                    {availableScales && availableScales.length > 0 ? (
                      <select
                        className="scale-select"
                        value={char.scaleId || ''}
                          onChange={(e) =>
                            handleScaleChange(group.className, char.name, e.target.value)
                          }
                        >
                        <option value="" disabled>Выберите шкалу</option>
                        {availableScales.map((obj) => (
                          <option
                            key={`${obj.scaleId}-${obj.scaleName}`} // уникальный ключ
                            value={obj.scaleId}                     // value = scale_of_char_id
                          >
                            {obj.scaleName} ({obj.explanations.join(', ')})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p>Загрузка шкал или шкалы не найдены</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </Panel>
  );
};

SelectScalePanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  selectedCharacteristics: PropTypes.array.isRequired,
  scales: PropTypes.object.isRequired,
  handleScaleChange: PropTypes.func.isRequired,
  panelHeaderClass: PropTypes.func.isRequired,
};

export default SelectScalePanel;
