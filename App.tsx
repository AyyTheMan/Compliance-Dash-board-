
import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { RedZoneTaskView } from './components/RedZoneTaskView';
import { useMockData } from './hooks/useMockData';
import { Task, RiskLevel } from './types';

type View = 'dashboard' | 'redZoneTask';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { tasks, warnings, updateTask, addTask } = useMockData();

  const handleSelectTask = (task: Task) => {
    if (task.riskLevel === RiskLevel.Red) {
      setSelectedTask(task);
      setCurrentView('redZoneTask');
    }
    // Potentially handle clicks on yellow/green tasks differently in the future
  };

  const handleBackToDashboard = () => {
    setSelectedTask(null);
    setCurrentView('dashboard');
  };
  
  const handleUpdateTask = (updatedTask: Task) => {
    // Also update the selected task if it's being viewed
    if(selectedTask && selectedTask.id === updatedTask.id) {
        setSelectedTask(updatedTask);
    }
    updateTask(updatedTask);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {currentView === 'dashboard' && (
        <Dashboard 
          tasks={tasks}
          warnings={warnings}
          onSelectTask={handleSelectTask}
          onAddTask={addTask}
        />
      )}
      {currentView === 'redZoneTask' && selectedTask && (
        <RedZoneTaskView 
          task={selectedTask} 
          onBack={handleBackToDashboard}
          onUpdateTask={handleUpdateTask}
        />
      )}
    </div>
  );
}

export default App;
