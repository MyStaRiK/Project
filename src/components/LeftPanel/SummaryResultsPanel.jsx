// SummaryResultsPanel.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Panel from './Panel';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
// Пока SentencesDisplay не создан, закомментируйте импорт
// import SentencesDisplay from './SentencesDisplay'; 

const SummaryResultsPanel = ({
  isOpen,
  toggleOpen,
  panelHeaderClass,
  selections,
  param, // <-- объект с ID
  setSummarySentences, // Новая пропса
}) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // Для сообщения об ошибке
  const [scaleExplanations, setScaleExplanations] = useState({}); // Состояние для пояснений шкал

  // Универсальная функция для выполнения API-запросов
  const fetchData = async (id, endpoint) => {
    try {
      const response = await fetch(endpoint.replace(':id', id));
      if (!response.ok) throw new Error(`Ошибка загрузки данных с ID ${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Ошибка при загрузке данных с ID ${id}:`, error);
      setErrorMessage(`Ошибка при загрузке данных с ID ${id}: ${error.message}`);
      return null;
    }
  };

  // Функция для получения пояснения к шкале по имени
  const fetchScaleExplanation = async (scaleName) => {
    try {
      const response = await fetch(`http://localhost:5000/scenario_ontology/literal_value_of_scale_by_name/${encodeURIComponent(scaleName)}`);
      if (!response.ok) {
        throw new Error(`Ошибка при загрузке пояснений для шкалы "${scaleName}"`);
      }
      const data = await response.json();
      // Предполагаем, что пояснения — это массив объектов с полем `literal_values_name`
      return data.map(item => item.literal_values_name).join(', ');
    } catch (error) {
      console.error(error);
      return 'Пояснение не найдено';
    }
  };

  // Функция для обработки selections и загрузки данных
  useEffect(() => {
    const processSelections = async () => {
      if (!selections || typeof selections !== 'object') return;

      setLoading(true);
      setErrorMessage('');
      const tempResults = [];
      const tempSentences = [];
      const newScaleExplanations = { ...scaleExplanations }; // Копируем существующие пояснения

      const entries = Object.entries(selections); // Преобразуем объект в массив [ключ, значение]
      for (const [className, classData] of entries) {
        // Обрабатываем каждый класс
        if (!classData || typeof classData !== 'object') continue;

        const { questionType, ...characteristics } = classData;

        // Приводим questionType к числу для корректного сравнения
        const questionTypeNumber = Number(questionType);
        //console.log(`Обрабатывается класс: ${className}, Тип вопроса: ${questionTypeNumber}`);

        const charPromises = Object.entries(characteristics).map(async ([charName, charData]) => {
          if (!charData || typeof charData !== 'object') return null;

          const { questionId, charId, scaleId } = charData;

          // Проверяем, что все ID существуют
          if (!questionId || !charId || !scaleId) {
            setErrorMessage(`Не выбраны все параметры для характеристики "${charName}" в классе "${className}"`);
            return null;
          }

          const [classText, charText, scaleData] = await Promise.all([
            fetchData(questionId, 'http://localhost:5000/scenario_dialog_ontology/questions_of_class/id/:id'),
            fetchData(charId, 'http://localhost:5000/scenario_dialog_ontology/questions_of_characteristic/id/:id'),
            fetchData(scaleId, 'http://localhost:5000/scenario_dialog_ontology/additional_texts_of_scale/id/:id'),
          ]);

          const scaleName = scaleData?.[0]?.scale_name || 'Не найдено';

          // Получаем пояснение для шкалы, если еще не загружено
          if (!newScaleExplanations[scaleName]) {
            const explanation = await fetchScaleExplanation(scaleName);
            newScaleExplanations[scaleName] = explanation;
          }

          return {
            characteristicName: charName,
            classText: classText?.[0]?.question_text || 'Не найдено',
            charText: charText?.[0]?.additional_text || 'Не найдено',
            scaleText: scaleData?.[0]?.additional_text || 'Не найдено',
            scaleName: scaleName,
            scaleExplanation: newScaleExplanations[scaleName],
          };
        });

        const loadedCharacteristics = (await Promise.all(charPromises)).filter(Boolean);
        //console.log(`Загруженные характеристики для класса "${className}":`, loadedCharacteristics);

        // **Добавление проверки через `param`:**
        // Находим соответствующую группу в `param` для текущего класса
        const paramGroup = param.find(group => group.className === className);
        if (!paramGroup) {
          //console.warn(`Не найдено соответствие в param для класса "${className}"`);
          // setErrorMessage(`Не найдено соответствие в param для класса "${className}"`);
          continue; // Пропускаем этот класс
        }

        // Проверяем, содержит ли `paramGroup` хотя бы одну характеристику
        if (!paramGroup.chars || paramGroup.chars.length === 0) {
         // console.warn(`Нет характеристик в param для класса "${className}"`);
          // Можно установить сообщение об ошибке или просто пропустить
          // setErrorMessage(`Нет характеристик в param для класса "${className}"`);
          continue; // Пропускаем этот класс
        }

        // Проверяем, есть ли загруженные характеристики
        if (loadedCharacteristics.length === 0) {
          //console.warn(`Нет загруженных характеристик для класса "${className}"`);
          continue; // Пропускаем этот класс
        }

        // Сохраняем результаты для отображения
        tempResults.push({
          className,
          questionType: questionTypeNumber,
          characteristics: loadedCharacteristics,
        });

        // Формируем предложения в зависимости от типа вопроса
        if (questionTypeNumber === 1) {
          // Для типа вопроса id=1 (все в одном)

          // Объединяем характеристики с использованием переноса строки
          const characteristicsList = paramGroup.chars.map(char => char.name).join('\n- ');

          // Предполагаем, что classText одинаков для всех характеристик
          const classText = loadedCharacteristics[0].classText;
          const charTexts = loadedCharacteristics.map(char => char.charText).join(' ');
          const scaleTexts = loadedCharacteristics.map(char => `${char.scaleText} (${char.scaleExplanation})`).join(' '); // Исправлено

          const sentence = `${classText} ${className} ${scaleTexts} ${charTexts}\n-  ${characteristicsList}`;
          //console.log(`Сформированное предложение для типа 1:`, sentence);
          tempSentences.push(sentence);
        } else if (questionTypeNumber === 2) {
          // Для типа вопроса id=2 (остается как есть)
          loadedCharacteristics.forEach(char => {
            const sentence = `${char.classText} ${className} ${char.scaleText} (${char.scaleExplanation}) ${char.charText} ${char.characteristicName} `;
            //console.log(`Сформированное предложение для типа 2:`, sentence);
            tempSentences.push(sentence);
          });
        }
        // Добавьте дополнительные условия для других типов вопросов, если необходимо
      }
      console.log(tempSentences);
      setResults(tempResults);
      setSummarySentences(tempSentences); // Обновление через пропс
      setScaleExplanations(newScaleExplanations); // Обновляем состояние пояснений
      setLoading(false);
    };

    processSelections();
  }, [selections, param, setSummarySentences]); // Добавлен setSummarySentences в зависимости

  return (
    <Panel
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      title="Итоги выбора"
      panelHeaderClass={panelHeaderClass}
    >
      <div>
        <h4>Обновлённые данные:</h4>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Сообщение об ошибке */}
        {loading ? (
          <p>Загрузка...</p>
        ) : results.length === 0 ? (
          <p>Данные отсутствуют.</p>
        ) : (
          <>
            <ul>
              {results.map((res, index) => (
                <li key={index}>
                  <strong>Класс:</strong> {res.className} (Тип вопроса: {res.questionType})
                  <ul>
                    {res.characteristics.map((char, idx) => (
                      <li key={idx}>
                        {char.classText} {res.className} {char.scaleText} {char.scaleName} ({char.scaleExplanation}) {char.charText} {char.characteristicName}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            {/* Отображение сформированных предложений */}
            {/* Удалите этот блок, так как summarySentences теперь управляется вне компонента */}
            {/* 
            <h4>Сформированные предложения:</h4>
            {summarySentences.length === 0 ? (
              <p>Предложения не сформированы.</p>
            ) : (
              <ul>
                {summarySentences.map((sentence, idx) => (
                  <li key={idx} style={{ whiteSpace: 'pre-line' }}>
                    {sentence}
                  </li>
                ))}
              </ul>
            )}
            */}
            {/* Пока SentencesDisplay не создан, закомментируйте его использование
            <SentencesDisplay sentences={summarySentences} />
            */}
          </>
        )}
        {/* Отображение данных из param */}
        <h4>Данные из param:</h4>
        {param.length === 0 ? (
          <p>Нет данных для отображения</p>
        ) : (
          param.map((group, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <strong>{group.className}</strong>
              <ul style={{ listStyle: 'none', paddingLeft: '20px' }}>
                {group.chars.map((char, charIndex) => (
                  <li key={charIndex}>
                    {char.name} — {char.scale || 'Шкала не выбрана'}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
};

SummaryResultsPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  panelHeaderClass: PropTypes.func.isRequired,
  selections: PropTypes.object.isRequired,
  param: PropTypes.array.isRequired, // Ожидаем массив
  setSummarySentences: PropTypes.func.isRequired, // Новая пропса как функция
};

export default SummaryResultsPanel;
