import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Header from './Header';
import ResumeEditor from './ProjectEditor';
import ResumeDesigns from './ResumeDesigns';
import HelpPage from './HelpPage';
import { ToastContext } from '../context/ToastContext';
import { useUnsavedContext } from '../context/UnsavedContext';

const ConfirmDeleteModal = ({ projectName, onConfirm, onCancel }) => {
  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <h3>Подтверждение удаления</h3>
        <p>Вы уверены, что хотите удалить проект «{projectName}»?</p>
        <div className="confirm-buttons">
          <button className="cancel-button" onClick={onCancel}>
            Отмена
          </button>
          <button className="delete-button" onClick={onConfirm}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

const EditProjectPage = () => {
  const { showToast } = useContext(ToastContext);
  const { isDirty, setIsDirty } = useUnsavedContext();
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [activeTab, setActiveTab] = useState('Редактирование');
  const [resumeTitle, setResumeTitle] = useState('Новый проект');
  const [originalTitle, setOriginalTitle] = useState('Новый проект');
  const [loading, setLoading] = useState(true);

  // Модалка удаления
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Храним «содержимое» (классы/характеристики) из ProjectEditor
  const projectDataRef = useRef({ classes: [] });

  // Здесь временно сохраним «выбранные» данные (из БД)
  const [loadedProjectDetails, setLoadedProjectDetails] = useState([]);

  // Подписка на beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  // 1) Загрузка названия проекта
  // 2) Загрузка детализации (классов/характеристик/шкал)
  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // Загружаем название
        const res = await fetch(
          `http://localhost:5000/scenario_authorization/projects/${projectId}`,
          { credentials: 'include' }
        );
        if (!res.ok) throw new Error(`Ошибка при загрузке проекта (статус ${res.status})`);
        const data = await res.json();
        if (data.name) {
          setResumeTitle(data.name);
          setOriginalTitle(data.name);
          setIsDirty(false);
        }
      } catch (err) {
        console.error(err);
        showToast('Не удалось загрузить проект', 'error');
      }

      try {
        // Загружаем detail
        const detailsRes = await fetch(
          `http://localhost:5000/scenario_data/project_data/${projectId}`,
          { credentials: 'include' }
        );
        if (!detailsRes.ok) {
          throw new Error('Ошибка при загрузке detail-данных проекта');
        }
        const details = await detailsRes.json();
        // details = [
        //   { className, characteristicName, charOfClassId, scaleName, scaleOfCharId, ... }, ...
        //console.log(details);
        setLoadedProjectDetails(details);
      } catch (err) {
        console.error(err);
        showToast('Не удалось загрузить детали проекта', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, showToast, setIsDirty]);

  // Когда пользователь меняет название
  const handleTitleChange = (newValue) => {
    setResumeTitle(newValue);
    if (newValue !== originalTitle) {
      setIsDirty(true);
    }
  };

  // Сохранить
  const handleSaveProject = async () => {
    if (!projectId) {
      showToast('Нет projectId', 'error');
      return;
    }
    try {
      // 1) Обновляем название
      const res = await fetch(
        `http://localhost:5000/scenario_authorization/projects/${projectId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name: resumeTitle }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка сохранения проекта');
      }

      // 2) Сохраняем классы/характеристики
      const payload = {
        projectId: Number(projectId),
        classes: projectDataRef.current.classes || []
      };
      const saveRes = await fetch('http://localhost:5000/scenario_data/project_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!saveRes.ok) {
        const errData = await saveRes.json();
        throw new Error(errData.error || 'Ошибка сохранения project_data');
      }

      setOriginalTitle(resumeTitle);
      setIsDirty(false);
      showToast('Проект сохранён (включая выбранные данные)', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  // Удалить
  const handleDeleteClick = () => {
    if (!projectId) {
      showToast('Нет projectId', 'error');
      return;
    }
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    setShowConfirmDelete(false);
    try {
      const res = await fetch(
        `http://localhost:5000/scenario_authorization/projects/${projectId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка удаления проекта');
      }
      showToast('Проект удалён', 'success');
      navigate('/projects');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Загрузка проекта...</div>;
  }

  let content;
  switch (activeTab) {
    case 'Дизайн':
      content = <ResumeDesigns />;
      break;
    case 'Помощь':
      content = <HelpPage />;
      break;
    case 'Редактирование':
    default:
      content = (
        <ResumeEditor
          resumeTitle={resumeTitle}
          onTitleChange={handleTitleChange}
          onDataChange={(data) => {
            // Callback для получения структуры classes
            projectDataRef.current = data;
          }}
          loadedProjectDetails={loadedProjectDetails}
        />
      );
      break;
  }

  return (
    <>
      <Header
        projectId={projectId}
        resumeTitle={resumeTitle}
        onTitleChange={handleTitleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSave={handleSaveProject}
        onDelete={handleDeleteClick}
      />
      {content}

      {showConfirmDelete && (
        <ConfirmDeleteModal
          projectName={resumeTitle}
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </>
  );
};

export default EditProjectPage;
