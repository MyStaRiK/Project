import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import '../styles/ProjectEditor.css';
import { DesignContext } from '../context/DesignContext';
import LeftPanel from './LeftPanel/LeftPanel';
import RightPanel from './RightPanel';
import { useUnsavedContext } from '../context/UnsavedContext';

const ProjectEditor = ({
  resumeTitle,
  onDataChange,
  loadedProjectDetails = []
}) => {
  const { design } = useContext(DesignContext);
  const { setIsDirty } = useUnsavedContext();
  const [classes, setClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [characteristicsByClass, setCharacteristicsByClass] = useState({});
  const [scales, setScales] = useState({});
  const [currentSelections, setCurrentSelections] = useState({});

  const [classPanelOpen, setClassPanelOpen] = useState(true);
  const [charPanelOpen, setCharPanelOpen] = useState(true);
  const [scalePanelOpen, setScalePanelOpen] = useState(true);
  const [summaryPanelOpen, setSummaryPanelOpen] = useState(true);
  const [resultsPanelOpen, setResultsPanelOpen] = useState(true);

  const [classSearch, setClassSearch] = useState('');
  const [charSearch, setCharSearch] = useState('');

  const [summarySentences, setSummarySentences] = useState([]);

  const removeLanguagePrefix = (str) => {
    if (!str) return str;
    if (str.startsWith('Язык ')) {
      return str.slice(5);
    }
    return str;
  };

  useEffect(() => {
    if (!loadedProjectDetails || loadedProjectDetails.length === 0) return;

    const newSelectedClasses = new Set();
    const newCharByClass = {};
    const newScales = { ...scales };

    for (const row of loadedProjectDetails) {
      newSelectedClasses.add(row.className);

      if (!newCharByClass[row.className]) {
        newCharByClass[row.className] = [];
      }
      const arr = newCharByClass[row.className];
      const existingIdx = arr.findIndex(
        (x) => x.name === row.characteristicName
      );
      if (existingIdx === -1) {
        arr.push({
          id: row.charOfClassId,
          name: row.characteristicName,
          selected: true,
          scale: row.scaleName || null,
          scaleId: row.scaleOfCharId || null
        });

        if (row.scaleName && row.scaleOfCharId) {
          const charName = removeLanguagePrefix(row.characteristicName);
          if (!newScales[charName]) {
            newScales[charName] = [];
          }

          const scaleExists = newScales[charName].some(
            (s) => s.scaleId === row.scaleOfCharId
          );
          if (!scaleExists) {
            newScales[charName].push({
              scaleId: row.scaleOfCharId,
              scaleName: row.scaleName,
              explanations: [] 
            });
          }
        }
      }
    }

    setSelectedClasses([...newSelectedClasses]);
    setCharacteristicsByClass(newCharByClass);
    setScales(newScales);
  }, [loadedProjectDetails]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const resp = await fetch('http://localhost:5000/scenario_ontology/class');
        if (!resp.ok) throw new Error('Ошибка загрузки списка классов');
        const data = await resp.json();
        setClasses(data); // [{ id, name }, ...]
      } catch (err) {
        console.error('Ошибка:', err);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchCharacteristics = async () => {
      const updated = { ...characteristicsByClass };
      const updatedScales = { ...scales };

      const loadedDetailsMap = {};
      for (const row of loadedProjectDetails) {
        if (!loadedDetailsMap[row.className]) {
          loadedDetailsMap[row.className] = {};
        }
        loadedDetailsMap[row.className][row.characteristicName] = row;
      }

      for (const className of selectedClasses) {
        const clsObj = classes.find((c) => c.name === className);
        if (!clsObj) continue;
  
        try {
          const resp = await fetch(
            `http://localhost:5000/scenario_ontology/characteristic_of_class/${clsObj.id}`
          );
          if (!resp.ok) {
            throw new Error(`Ошибка загрузки характеристик для класса "${className}"`);
          }
          const data = await resp.json();
          console.log('Характеристики:',data);

          const existing = updated[className] || [];
          const existingMap = new Map(existing.map((ch) => [ch.name, ch]))
          

          for (const item of data) {
            if (!existingMap.has(item.characteristic_name)) {
              const detail = loadedDetailsMap[className]?.[item.characteristic_name];
              existingMap.set(item.characteristic_name, {
                id: Number(item.char_of_class_id),
                characteristicId: Number(item.characteristic_id),  
                name: item.characteristic_name,
                selected: detail ? true : false,
                scale: detail ? detail.scaleName || null : null,
                scaleId: detail ? detail.scaleOfCharId || null : null
              });

              // Инициализируем шкалы, если они есть
              if (detail && detail.scaleName && detail.scaleOfCharId) {
                const charName = removeLanguagePrefix(item.characteristic_name);
                if (!updatedScales[charName]) {
                  updatedScales[charName] = [];
                }
                const scaleExists = updatedScales[charName].some(
                  (s) => s.scaleId === detail.scaleOfCharId
                );
                if (!scaleExists) {
                  updatedScales[charName].push({
                    scaleId: detail.scaleOfCharId,
                    scaleName: detail.scaleName,
                    explanations: []
                  });
                }
              }
            } else {
              const ch = existingMap.get(item.characteristic_name);
              if (loadedDetailsMap[className]?.[item.characteristic_name]) {
                ch.selected = true;
                ch.scale = loadedDetailsMap[className][item.characteristic_name].scaleName || null;
                ch.scaleId = loadedDetailsMap[className][item.characteristic_name].scaleOfCharId || null;

                if (ch.scale && ch.scaleId) {
                  const charName = removeLanguagePrefix(item.characteristic_name);
                  if (!updatedScales[charName]) {
                    updatedScales[charName] = [];
                  }

                  const scaleExists = updatedScales[charName].some(
                    (s) => s.scaleId === ch.scaleId
                  );
                  if (!scaleExists) {
                    updatedScales[charName].push({
                      scaleId: ch.scaleId,
                      scaleName: ch.scale,
                      explanations: [] 
                    });
                  }
                }
              }
            }
          }

          updated[className] = [...existingMap.values()];
        } catch (error) {
          console.error('Ошибка загрузки характеристик:', error);
        }
    }

      setCharacteristicsByClass(updated);
      setScales(updatedScales);
    };

    if (selectedClasses.length > 0) {
      fetchCharacteristics();
    } else {
      setCharacteristicsByClass({});
      setScales({});
    }
  }, [selectedClasses, classes, loadedProjectDetails]);

  useEffect(() => {
    const fetchScalesWithExplanations = async () => {
      try {
        for (const [className, chars] of Object.entries(characteristicsByClass)) {
          for (const char of chars) {
            if (char.selected && char.scaleId && !scales[removeLanguagePrefix(char.name)].find(s => s.scaleId === char.scaleId && s.explanations.length > 0)) {
              const resp = await fetch(`http://localhost:5000/scenario_ontology/literal_value_of_scale_of_char/${char.scaleId}`, {
                credentials: 'include'
              });
              if (!resp.ok) throw new Error('Ошибка загрузки пояснений шкалы');
              const data = await resp.json();
              console.log('пояснения',data);
              const explanations = data.map(item => item.literal_values_name);
              // Обновляем состояние scales
              setScales(prevScales => ({
                ...prevScales,
                [removeLanguagePrefix(char.name)]: prevScales[removeLanguagePrefix(char.name)].map(s => 
                  s.scaleId === char.scaleId ? { ...s, explanations } : s
                )
              }));
            }
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки пояснений шкал:', error);
      }
    };

    fetchScalesWithExplanations();
  }, [characteristicsByClass, scales]);

  const buildProjectData = useCallback(() => {
    const result = [];

    for (const className of selectedClasses) {
      const clsObj = classes.find((c) => c.name === className);
      if (!clsObj) continue;

      const charList = characteristicsByClass[className] || [];
      const selectedChars = charList
        .filter((ch) => ch.selected)
        .map((ch) => ({
          charOfClassId: ch.id,         // = char_of_class_id (CoC.id)
          scaleOfCharacteristicId: ch.scaleId || null, // = scale_of_char_id (SoC.id)
          priority: null,
          description: null
        }));

      result.push({
        classId: clsObj.id,
        description: null,
        characteristics: selectedChars
      });
    }
    return { classes: result };
  }, [classes, selectedClasses, characteristicsByClass]);

  useEffect(() => {
    if (onDataChange) {
      const data = buildProjectData();
      onDataChange(data);
    }
  }, [selectedClasses, characteristicsByClass, buildProjectData, onDataChange]);

  const handleClassCheckboxChange = (className, checked) => {
    setIsDirty(true);
    setSelectedClasses((prev) =>
      checked ? [...prev, className] : prev.filter((x) => x !== className)
    );
  };

  const handleCharacteristicChange = async (className, charName) => {
    setIsDirty(true);
    const classChars = characteristicsByClass[className] || [];
    const idx = classChars.findIndex((c) => c.name === charName);
    if (idx === -1) return;
  
    const updated = [...classChars];
    const charObj = updated[idx];
  
    // Переключаем чекбокс
    charObj.selected = !charObj.selected;
    if (!charObj.selected) {
      charObj.scale = null;
      charObj.scaleId = null;
    } else {
      // Если шкалы для этой характеристики ещё не загружены, загружаем их
      const charNameKey = removeLanguagePrefix(charName);
      if (!scales[charNameKey] || scales[charNameKey].length === 0) {
        try {
          const resp = await fetch(`http://localhost:5000/scenario_ontology/scale_of_characteristic/${charObj.characteristicId}`);
          if (!resp.ok) throw new Error('Ошибка загрузки шкал');
          const data = await resp.json();
          console.log(data, charObj.id);
  
          // Обновляем шкалы с пояснениями
          const updatedScales = { ...scales };
          updatedScales[charNameKey] = data.map((s) => ({
            scaleId: s.scale_of_char_id,  
            scaleName: s.scale_name,      
            explanations: s.explanations
            }));            
  
          setScales(updatedScales);
        } catch (error) {
          console.error('Ошибка:', error);
        }
      }
    }
  
    setCharacteristicsByClass((prev) => ({
      ...prev,
      [className]: updated
    }));
  };
  const handleUpdateSelections = (updatedSelections) => {
    setCurrentSelections(updatedSelections);
  };
  // handleScaleChange => пользователь выбрал другую шкалу из <select>
  const handleScaleChange = (className, charName, scaleName) => {
    setIsDirty(true);
    const newScaleId = scaleName; 
    const classChars = characteristicsByClass[className] || [];
  const updated = classChars.map((ch) => {
    if (ch.name === charName) {
      const charNameKey = removeLanguagePrefix(charName);
      const scaleObj = scales[charNameKey]?.find(
        (el) => String(el.scaleId) === String(newScaleId)
      );

      return {
        ...ch,
        scaleId: scaleObj ? scaleObj.scaleId : null,   // для сохранения
        scale: scaleObj ? scaleObj.scaleName : null    // удобное поле, чтобы показывать текст
      };
    }
    return ch;
  });

  setCharacteristicsByClass((prev) => ({
    ...prev,
    [className]: updated
  }));
};
 
  const selectedCharacteristics = [];
  for (const className of selectedClasses) {
    const arr = characteristicsByClass[className] || [];
    const sel = arr.filter((ch) => ch.selected);
    if (sel.length > 0) {
      selectedCharacteristics.push({ className, chars: sel });
    }
  }

  // Для итогов
  const selectedWithScales = useMemo(() => {
    const result = [];
    for (const className of selectedClasses) {
      const arr = characteristicsByClass[className] || [];
      const sel = arr.filter((ch) => ch.selected && ch.scale);
      if (sel.length > 0) {
        result.push({ className, chars: sel });
      }
    }
    return result;
  }, [selectedClasses, characteristicsByClass]);

  const panelHeaderClass = (isOpen) =>
    `panel-header ${isOpen ? 'panel-header-open' : 'panel-header-closed'}`;

  // Фильтр классов
  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(classSearch.toLowerCase())
  );

  

  return (
    <div className="resume-editor">
      <LeftPanel
        // Панельные состояния
        classPanelOpen={classPanelOpen}
        setClassPanelOpen={setClassPanelOpen}
        charPanelOpen={charPanelOpen}
        setCharPanelOpen={setCharPanelOpen}
        scalePanelOpen={scalePanelOpen}
        setScalePanelOpen={setScalePanelOpen}
        summaryPanelOpen={summaryPanelOpen}
        setSummaryPanelOpen={setSummaryPanelOpen}
        resultsPanelOpen={resultsPanelOpen}
        setResultsPanelOpen={setResultsPanelOpen}

        // Данные
        classes={classes}
        selectedClasses={selectedClasses}
        characteristicsByClass={characteristicsByClass}
        scales={scales}
        onUpdateSelections={handleUpdateSelections}
        selections={currentSelections}

        // Поиск
        classSearch={classSearch}
        setClassSearch={setClassSearch}
        charSearch={charSearch}
        setCharSearch={setCharSearch}
        filteredClasses={filteredClasses}

        // Для блока "Выбор шкалы" и "Итоги"
        selectedCharacteristics={selectedCharacteristics}
        selectedWithScales={selectedWithScales}

        // Обработчики
        handleClassCheckboxChange={handleClassCheckboxChange}
        handleCharacteristicChange={handleCharacteristicChange}
        handleScaleChange={handleScaleChange}

        // Класс для заголовка панели
        panelHeaderClass={panelHeaderClass}

        setSummarySentences={setSummarySentences}
      />

<RightPanel
  design={design}
  resumeTitle={resumeTitle}
  summaryData={selectedWithScales}
  summarySentences={summarySentences}  // Передаем данные из SummaryPanel
/>
    </div>
  );
};

export default ProjectEditor;
