// SummaryPanel.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Panel from './Panel';

const SummaryPanel = ({
  isOpen,
  toggleOpen,
  selectedWithScales,
  panelHeaderClass,
  onUpdateSelections, // Новый пропс для передачи выборов родительскому компоненту
}) => {
  const [questionsByClass, setQuestionsByClass] = useState({});
  const [additionalTextsByChar, setAdditionalTextsByChar] = useState({});
  const [additionalTextsByScale, setAdditionalTextsByScale] = useState({});
  const [questionTypes, setQuestionTypes] = useState([]);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState({});
  const [selections, setSelections] = useState({}); // Сохраняет выборы для вывода
  const [scaleExplanations, setScaleExplanations] = useState({}); // Новое состояние для пояснений шкал

  // Загружаем типы вопросов
  const fetchQuestionTypes = async () => {
    try {
      const response = await fetch('http://localhost:5000/scenario_dialog_ontology/question_types/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setQuestionTypes(data);
    } catch (error) {
      console.error('Ошибка загрузки типов вопросов:', error);
    }
  };

  // Загружаем вопросы для класса с возможной фильтрацией по typeId
  const fetchQuestionsByClass = async (className, typeId) => {
    try {
      let url = `http://localhost:5000/scenario_dialog_ontology/questions_of_class/${encodeURIComponent(className)}`;
      if (typeId) {
        url += `?typeId=${typeId}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setQuestionsByClass((prev) => ({ ...prev, [className]: data }));
    } catch (error) {
      console.error(`Ошибка загрузки вопросов для класса ${className}:`, error);
    }
  };

  // Загружаем тексты для характеристики с возможной фильтрацией по typeId
  const fetchAdditionalTextsByChar = async (charName, typeId) => {
    try {
      let url = `http://localhost:5000/scenario_dialog_ontology/questions_of_characteristic/${encodeURIComponent(charName)}`;
      if (typeId) {
        url += `?typeId=${typeId}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAdditionalTextsByChar((prev) => ({ ...prev, [charName]: data }));
    } catch (error) {
      console.error(`Ошибка загрузки текстов для характеристики ${charName}:`, error);
    }
  };

  // Загружаем тексты для шкалы с возможной фильтрацией по typeId
  const fetchAdditionalTextsByScale = async (scaleName, typeId) => {
    try {
      let url = `http://localhost:5000/scenario_dialog_ontology/additional_texts_of_scale/${encodeURIComponent(scaleName)}`;
      if (typeId) {
        url += `?typeId=${typeId}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAdditionalTextsByScale((prev) => ({ ...prev, [scaleName]: data }));
    } catch (error) {
      console.error(`Ошибка загрузки текстов для шкалы ${scaleName}:`, error);
    }
  };

  // Функция для получения пояснения шкалы по названию
  const fetchScaleExplanation = async (scaleName) => {
    // Проверяем, было ли уже загружено пояснение для данной шкалы
    if (scaleExplanations[scaleName]) return;

    try {
      const response = await fetch(`http://localhost:5000/scenario_ontology/literal_value_of_scale_by_name/${encodeURIComponent(scaleName)}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Пояснение для шкалы не найдено');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      const data = await response.json();
      // Предполагаем, что сервер возвращает массив объектов с полем 'literal_values_name'
      const explanations = data.map(item => item.literal_values_name).join(', ');
      setScaleExplanations((prev) => ({
        ...prev,
        [scaleName]: explanations,
      }));
    } catch (error) {
      console.error('Ошибка загрузки пояснения для шкалы:', error);
      // В случае ошибки можно установить значение по умолчанию или оставить пустым
      setScaleExplanations((prev) => ({
        ...prev,
        [scaleName]: 'Пояснение не найдено',
      }));
    }
  };

  useEffect(() => {
    fetchQuestionTypes();
    selectedWithScales.forEach((group) => {
      const selectedTypeId = selectedQuestionTypes[group.className];
      fetchQuestionsByClass(group.className, selectedTypeId);
      group.chars.forEach((char) => {
        fetchAdditionalTextsByChar(char.name, selectedTypeId);
        if (char.scale) { // Предполагаем, что char.scale содержит название шкалы
          fetchAdditionalTextsByScale(char.scale, selectedTypeId);
          fetchScaleExplanation(char.scale); // Передаём название шкалы
        }
      });
    });
  }, [selectedWithScales, selectedQuestionTypes]); // Добавлен selectedQuestionTypes в зависимости

  useEffect(() => {
    if (selectedWithScales.length === 0) {
      // Очищаем данные
      setSelections({});
      setSelectedQuestionTypes({});
      setScaleExplanations({}); // Очищаем пояснения шкал
      setQuestionsByClass({});
      setAdditionalTextsByChar({});
      setAdditionalTextsByScale({});
      //console.log('Данные очищены, так как ничего не выбрано.');
    }
  }, [selectedWithScales]);

  // Обрабатываем выбор типа вопроса
  const handleQuestionTypeChange = (className, typeId) => {
    // Получаем текст типа вопроса
    const typeText = questionTypes.find((type) => type.id === parseInt(typeId, 10))?.type_text || 'Не выбрано';

    // Обновляем состояние для выбранных типов вопросов
    setSelectedQuestionTypes((prev) => ({ ...prev, [className]: parseInt(typeId, 10) }));

    // Формируем обновленные данные для selections
    setSelections((prev) => ({
      ...prev,
      [className]: {
        ...prev[className],
        questionType: typeId, // Добавляем текст типа вопроса в selections
      },
    }));

    // Логируем для проверки
    //console.log(`Выбран typeId: ${typeId}, для класса: ${className}`);
    //console.log(`Тип вопроса для ${className}: ${typeText}`);
  };

  // Сохраняем выбранные значения
  const handleSelectionChange = (className, charName, key, value) => {
    const updatedSelections = {
      ...selections,
      [className]: {
        ...selections[className],
        [charName]: {
          ...selections[className]?.[charName],
          [key]: value || 'Не выбрано',
        },
      },
    };

    // Логика очистки данных:
    if (!value) {
      delete updatedSelections[className][charName][key]; // Удаляем поле, если значение пустое
      if (Object.keys(updatedSelections[className][charName]).length === 0) {
        delete updatedSelections[className][charName]; // Удаляем характеристику, если она пустая
      }
      if (Object.keys(updatedSelections[className]).length === 0) {
        delete updatedSelections[className]; // Удаляем класс, если нет характеристик
      }
    }

    setSelections(updatedSelections); // Обновляем состояние
    onUpdateSelections?.(updatedSelections); // Передаем изменения в родительский компонент
    console.log(`Выбрано: `, updatedSelections);
  };

  const areScalesConsistent = (chars) => {
    if (!chars || chars.length === 0) return true; // Нет характеристик, значит нет ошибок

    const uniqueScales = new Set(chars.map((char) => char.scale));
    return uniqueScales.size === 1; // Все шкалы одинаковы, если Set содержит только одно значение
  };

  // Функция для отображения шкалы с пояснением
  const renderScaleWithExplanation = (scaleName) => {
    if (!scaleName) return 'Шкала не выбрана';
    const explanation = scaleExplanations[scaleName];
    return explanation ? `${scaleName} (${explanation})` : `${scaleName} (Загрузка пояснения...)`;
  };

  return (
    <Panel
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      title="Определение шаблон вопросов"
      panelHeaderClass={panelHeaderClass}
    >
      {selectedWithScales.length === 0 && <p>Пока ничего не выбрано или не назначены шкалы</p>}
      {selectedWithScales.map((group) => {
        const selectedTypeId = selectedQuestionTypes[group.className];

        return (
          <div key={group.className} className="class-characteristics-group">
            <h4>{group.className}</h4>
            <label>
              Тип вопроса:
              <select
                value={selectedTypeId || ''}
                onChange={(e) => handleQuestionTypeChange(group.className, e.target.value)}
              >
                <option value="">Выбрать</option>
                {questionTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.type_text}
                  </option>
                ))}
              </select>
            </label>

            {selectedTypeId === 1 && (
              <div>
                {!areScalesConsistent(group.chars) ? (
                  <p style={{ color: 'red' }}>
                    Ошибка: Выбранные шкалы характеристик должны быть одинаковыми.
                  </p>
                ) : (
                  <>
                    {/* Отображение выпадающих списков только для первой характеристики */}
                    <label>
                      <select
                        onChange={(e) =>
                          group.chars.forEach((char) =>
                            handleSelectionChange(group.className, char.name, 'questionId', e.target.value)
                          )
                        }
                      >
                        <option value="">Выбрать</option>
                        {questionsByClass[group.className]?.map((question) => (
                          <option key={question.question_text_of_class_id} value={question.question_text_of_class_id}>
                            {question.question_text}
                          </option>
                        ))}
                      </select>
                    </label>
                    <span> {group.className} </span>
                    <label>
                      <select
                        onChange={(e) =>
                          group.chars.forEach((char) =>
                            handleSelectionChange(group.className, char.name, 'scaleId', e.target.value)
                          )
                        }
                      >
                        <option value="">Выбрать</option>
                        {additionalTextsByScale[group.chars[0]?.scale]?.map((text) => (
                          <option key={text.question_text_of_scale_id} value={text.question_text_of_scale_id}>
                            {text.additional_text}
                          </option>
                        ))}
                      </select>
                    </label>
                    <span> {renderScaleWithExplanation(group.chars[0]?.scale)} </span> {/* Отображение шкалы с пояснением */}
                    <label>
                      <select
                        onChange={(e) =>
                          group.chars.forEach((char) =>
                            handleSelectionChange(group.className, char.name, 'charId', e.target.value)
                          )
                        }
                      >
                        <option value="">Выбрать</option>
                        {additionalTextsByChar[group.chars[0]?.name]?.map((text) => (
                          <option key={text.question_text_of_req_id} value={text.question_text_of_req_id}>
                            {text.additional_text}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Отображение названий характеристик */}
                    <div style={{ marginTop: '-10px' }}>
                      <ul>
                        {group.chars.map((char) => (
                          <li key={char.name}>{char.name}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
            {selectedTypeId === 2 &&
              group.chars.map((char) => (
                <div key={char.name}>
                  <label>
                    <select
                      onChange={(e) => handleSelectionChange(group.className, char.name, 'questionId', e.target.value)}
                    >
                      <option value="">Выбрать</option>
                      {questionsByClass[group.className]?.map((question) => (
                        <option key={question.question_text_of_class_id} value={question.question_text_of_class_id}>
                          {question.question_text}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span> {group.className} </span>
                  <label>
                    <select
                      onChange={(e) => handleSelectionChange(group.className, char.name, 'scaleId', e.target.value)}
                    >
                      <option value="">Выбрать</option>
                      {additionalTextsByScale[char.scale]?.map((text) => (
                        <option key={text.question_text_of_scale_id} value={text.question_text_of_scale_id}>
                          {text.additional_text}
                        </option>
                      ))}
                    </select>
                  </label>

                  <span> {renderScaleWithExplanation(char.scale)} </span> {/* Отображение шкалы с пояснением */}
                  <label>
                    <select
                      onChange={(e) => handleSelectionChange(group.className, char.name, 'charId', e.target.value)}
                    >
                      <option value="">Выбрать</option>
                      {additionalTextsByChar[char.name]?.map((text) => (
                        <option key={text.question_text_of_req_id} value={text.question_text_of_req_id}>
                          {text.additional_text}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span> {char.name} </span>
                </div>
              ))}
          </div>
        );
      })}
    </Panel>
  );
};

SummaryPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  selectedWithScales: PropTypes.array.isRequired,
  panelHeaderClass: PropTypes.func.isRequired,
  onUpdateSelections: PropTypes.func.isRequired, // Новый пропс как функция
};

export default SummaryPanel;
