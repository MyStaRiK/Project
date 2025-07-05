// ProjectsPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext';
import '../styles/ProjectsPage.css';
import { FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [sortOption, setSortOption] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Переменные для редактирования названия:
  const [editingProject, setEditingProject] = useState(null);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:5000/scenario_authorization/projects', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Ошибка загрузки проектов');
        }

        const data = await response.json();

        if (data.message) {
          setProjects([]);
          setFilteredProjects([]);
        } else {
          setProjects(data);
          setFilteredProjects(data);
        }
      } catch (err) {
        setError(err.message || 'Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Фильтрация + сортировка
  useEffect(() => {
    let filtered = projects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Сортировка
    switch (sortOption) {
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredProjects(filtered);
  }, [searchQuery, projects, sortOption]);

  // Создание проекта
  const handleCreateProject = async () => {
    try {
      const response = await fetch('http://localhost:5000/scenario_authorization/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newProjectName || 'Новый проект' }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании проекта');
      }

      const newProject = await response.json();

      setProjects((prev) => [newProject, ...prev]);
      setFilteredProjects((prev) => [newProject, ...prev]);
      showToast('Проект успешно создан', 'success');
      setShowCreateModal(false);
      setNewProjectName('');
      // После создания — сразу переходим на страницу редактирования:
      navigate(`/edit-project/${newProject.id}`);
    } catch (err) {
      showToast('Ошибка при создании проекта', 'error');
      console.error('Ошибка при создании проекта:', err);
    }
  };

  // Удаление проекта (полное)
  const handleDeleteProject = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/scenario_authorization/projects/${projectToDelete.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка удаления проекта');
      }

      setProjects((prev) => prev.filter((project) => project.id !== projectToDelete.id));
      setFilteredProjects((prev) => prev.filter((project) => project.id !== projectToDelete.id));
      showToast('Проект успешно удалён', 'success');
      setShowDeleteModal(false);
    } catch (err) {
      showToast('Ошибка при удалении проекта', 'error');
      console.error('Ошибка при удалении проекта:', err);
    }
  };

  // Начать редактирование имени в таблице
  const handleStartEditing = (project) => {
    setEditingProject(project.id);
    setEditedName(project.name);
  };

  // Сохранить изменения имени
  const handleSaveEdit = async (projectId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/scenario_authorization/projects/${projectId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name: editedName }),
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка обновления названия проекта');
      }

      setProjects((prev) =>
        prev.map((project) =>
          project.id === editingProject ? { ...project, name: editedName } : project
        )
      );

      setFilteredProjects((prev) =>
        prev.map((project) =>
          project.id === editingProject ? { ...project, name: editedName } : project
        )
      );

      showToast('Название проекта успешно обновлено', 'success');
      setEditingProject(null);
      setEditedName('');
    } catch (err) {
      showToast('Ошибка при обновлении названия проекта', 'error');
      console.error('Ошибка при обновлении названия проекта:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setEditedName('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className={`projects-container ${showCreateModal || showDeleteModal ? 'blur' : ''}`}>
        <div className="projects-header">
          <h1>Список ваших проектов</h1>
          <div className="actions">
            <input
              type="text"
              placeholder="Поиск проектов"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Без сортировки</option>
              <option value="name-asc">Название (А-Я)</option>
              <option value="name-desc">Название (Я-А)</option>
              <option value="date-asc">Сначала старые</option>
              <option value="date-desc">Сначала новые</option>
            </select>

            <button className="new-project-button" onClick={() => setShowCreateModal(true)}>
              <span className="plus-icon">+</span> Создать новый проект
            </button>
          </div>
        </div>

        <table className="projects-table">
          <thead>
            <tr>
              <th>Название проекта</th>
              <th>Дата создания</th>
              <th>Последнее редактирование</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td>
                    {editingProject === project.id ? (
                      <div className="edit-container">
                        <input
                          type="text"
                          className="edit-input"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          autoFocus
                        />
                        <button
                          className="icon-button save-button"
                          onClick={() => handleSaveEdit(project.id)}
                        >
                          <FaCheck />
                        </button>
                        <button className="icon-button cancel-button" onClick={handleCancelEdit}>
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <>
                        <strong>{project.name}</strong>
                        <button
                          className="icon-button edit-icon"
                          onClick={() => handleStartEditing(project)}
                        >
                          <FaEdit />
                        </button>
                      </>
                    )}
                  </td>
                  <td>{formatDate(project.createdAt)}</td>
                  <td>{formatDate(project.updatedAt)}</td>
                  <td>
                    <button
                      className="action-button edit"
                      onClick={() => navigate(`/edit-project/${project.id}`)}
                    >
                      Редактировать
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => {
                        setShowDeleteModal(true);
                        setProjectToDelete(project);
                      }}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                  {projects.length > 0
                    ? 'Проект не найден. Возможно вы ввели неправильное название.'
                    : 'Создайте свой первый проект!'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Создание нового проекта</h2>
            <input
              type="text"
              className="modal-input"
              placeholder="Введите название проекта"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <div className="modal-actions">
              <button className="modal-button cancel" onClick={() => setShowCreateModal(false)}>
                Отмена
              </button>
              <button className="modal-button confirm" onClick={handleCreateProject}>
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Удаление проекта</h2>
            <p>Вы уверены, что хотите удалить проект "{projectToDelete?.name}"?</p>
            <div className="modal-actions">
              <button className="modal-button confirm" onClick={() => setShowDeleteModal(false)}>
                Отмена
              </button>
              <button className="modal-button cancel" onClick={handleDeleteProject}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectsPage;
