import React from 'react';
import PropTypes from 'prop-types';
import SelectClassesPanel from './SelectClassesPanel';
import SelectCharacteristicsPanel from './SelectCharacteristicsPanel';
import SelectScalePanel from './SelectScalePanel';
import SummaryPanel from './SummaryPanel';
import SummaryResultsPanel from './SummaryResultsPanel';

const LeftPanel = ({
  // Панельные состояния
  classPanelOpen, setClassPanelOpen,
  charPanelOpen, setCharPanelOpen,
  scalePanelOpen, setScalePanelOpen,
  summaryPanelOpen, setSummaryPanelOpen,
  resultsPanelOpen, setResultsPanelOpen,

  // Данные
  classes,
  selectedClasses,
  characteristicsByClass,
  scales, // scales как объект
  onUpdateSelections,
  selections,

  // Поиск
  classSearch, setClassSearch,
  charSearch, setCharSearch,
  filteredClasses,

  // Для блока "Выбор шкалы" и "Итоги"
  selectedCharacteristics,
  selectedWithScales,

  // Обработчики
  handleClassCheckboxChange,
  handleCharacteristicChange,
  handleScaleChange,

  // CSS-класс для панели
  panelHeaderClass,

  setSummarySentences,
}) => {
  return (
    <div className="editor-form">
      <SelectClassesPanel 
        isOpen={classPanelOpen}
        toggleOpen={() => setClassPanelOpen(!classPanelOpen)}
        classes={classes}
        selectedClasses={selectedClasses}
        filteredClasses={filteredClasses}
        classSearch={classSearch}
        setClassSearch={setClassSearch}
        handleClassCheckboxChange={handleClassCheckboxChange}
        panelHeaderClass={panelHeaderClass}
      />

      <SelectCharacteristicsPanel 
        isOpen={charPanelOpen}
        toggleOpen={() => setCharPanelOpen(!charPanelOpen)}
        selectedClasses={selectedClasses}
        characteristicsByClass={characteristicsByClass}
        charSearch={charSearch}
        setCharSearch={setCharSearch}
        handleCharacteristicChange={handleCharacteristicChange}
        panelHeaderClass={panelHeaderClass}
      />

      <SelectScalePanel 
        isOpen={scalePanelOpen}
        toggleOpen={() => setScalePanelOpen(!scalePanelOpen)}
        selectedCharacteristics={selectedCharacteristics}
        scales={scales} // scales как объект
        handleScaleChange={handleScaleChange}
        panelHeaderClass={panelHeaderClass}
      />

      <SummaryPanel 
        isOpen={summaryPanelOpen}
        toggleOpen={() => setSummaryPanelOpen(!summaryPanelOpen)}
        selectedWithScales={selectedWithScales}
        panelHeaderClass={panelHeaderClass}
        onUpdateSelections={onUpdateSelections}
      />
      <SummaryResultsPanel
        isOpen={resultsPanelOpen}
        toggleOpen={() => setResultsPanelOpen(!resultsPanelOpen)}
        selectedWithScales={selectedWithScales}
        panelHeaderClass={panelHeaderClass}
        selections={selections} // <-- Передадим то, что получили из ProjectEditor
        param= {selectedWithScales}
        setSummarySentences={setSummarySentences}
      />
    </div>
  );
};

LeftPanel.propTypes = {
  // Панельные состояния
  classPanelOpen: PropTypes.bool.isRequired,
  setClassPanelOpen: PropTypes.func.isRequired,
  charPanelOpen: PropTypes.bool.isRequired,
  setCharPanelOpen: PropTypes.func.isRequired,
  scalePanelOpen: PropTypes.bool.isRequired,
  setScalePanelOpen: PropTypes.func.isRequired,
  summaryPanelOpen: PropTypes.bool.isRequired,
  setSummaryPanelOpen: PropTypes.func.isRequired,

  // Данные
  classes: PropTypes.array.isRequired,
  selectedClasses: PropTypes.array.isRequired,
  characteristicsByClass: PropTypes.object.isRequired,
  scales: PropTypes.object.isRequired, // Изменено с array на object
  onUpdateSelections: PropTypes.func,
  selections: PropTypes.object.isRequired,
  // Поиск
  classSearch: PropTypes.string.isRequired,
  setClassSearch: PropTypes.func.isRequired,
  charSearch: PropTypes.string.isRequired,
  setCharSearch: PropTypes.func.isRequired,
  filteredClasses: PropTypes.array.isRequired,

  // Для блока "Выбор шкалы" и "Итоги"
  selectedCharacteristics: PropTypes.array.isRequired,
  selectedWithScales: PropTypes.array.isRequired,

  // Обработчики
  handleClassCheckboxChange: PropTypes.func.isRequired,
  handleCharacteristicChange: PropTypes.func.isRequired,
  handleScaleChange: PropTypes.func.isRequired,

  // CSS-класс для панели
  panelHeaderClass: PropTypes.func.isRequired,

  setSummarySentences: PropTypes.func.isRequired,
};

export default LeftPanel;
