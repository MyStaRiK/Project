// AppContent.jsx
import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import MainPage from './pages/MainPage';
import ProjectsPage from './pages/ProjectsPage';
import ResumeEditor from './components/ProjectEditor';
import ResumeDesigns from './components/ResumeDesigns';
import HelpPage from './components/HelpPage';
import { DesignProvider } from './context/DesignContext';
import EditProjectPage from './components/EditProjectPage';

const AppContent = () => {
  const location = useLocation();

  // Это для /create-project, если всё ещё нужно
  const [activeTab, setActiveTab] = useState('Редактирование');
  const [resumeTitle, setResumeTitle] = useState('Новый проект');

  // Логика «скрыть какую-то шапку», если надо
  const showHeader = !['/', '/projects', '/edit-project'].some((p) =>
    location.pathname.startsWith(p)
  );

  // Рендер для /create-project (по старому)
  const renderCreateContent = () => {
    switch (activeTab) {
      case 'Дизайн':
        return <ResumeDesigns />;
      case 'Помощь':
        return <HelpPage />;
      case 'Редактирование':
      default:
        return <ResumeEditor resumeTitle={resumeTitle} onTitleChange={setResumeTitle} />;
    }
  };

  return (
    <DesignProvider>
      <div style={{ flex: 1, marginLeft: "60px"}}>
        {showHeader && (
          <div style={{ background: '#eee', padding: 10 }}>
            Тут может быть другая шапка / логотип
          </div>
        )}

        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/create-project" element={renderCreateContent()} />
          {/* /edit-project/:projectId -> EditProjectPage */}
          <Route path="/edit-project/:projectId" element={<EditProjectPage />} />
        </Routes>
      </div>
    </DesignProvider>
  );
};

export default AppContent;
