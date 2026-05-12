
import React, { useState } from 'react';
import { Task, RiskLevel, EarlyWarning, TaskStatus } from '../types';
import { RedIcon, YellowIcon, GreenIcon, PlusIcon, SparklesIcon } from './icons';
import { IntakeModal } from './IntakeModal';
import { summarizeText } from '../services/geminiService';

interface DashboardProps {
  tasks: Task[];
  warnings: EarlyWarning[];
  onSelectTask: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id' | 'status' | 'auditLog' | 'signatures' | 'checklist'>) => void;
}

const RiskIcon: React.FC<{ level: RiskLevel }> = ({ level }) => {
    switch (level) {
        case RiskLevel.Red: return <RedIcon />;
        case RiskLevel.Yellow: return <YellowIcon />;
        case RiskLevel.Green: return <GreenIcon />;
        default: return null;
    }
};

const getStatusChipStyle = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.Completed: return "bg-green-100 text-green-800";
        case TaskStatus.Overdue: return "bg-red-100 text-red-800";
        case TaskStatus.PendingLegal: return "bg-blue-100 text-blue-800";
        case TaskStatus.PendingCompliance: return "bg-yellow-100 text-yellow-800";
        default: return "bg-gray-100 text-gray-800";
    }
}

const EarlyWarningCard: React.FC<{ warning: EarlyWarning }> = ({ warning }) => {
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summary, setSummary] = useState(warning.summary);

    const handleSummarize = async () => {
        setIsSummarizing(true);
        const newSummary = await summarizeText(warning.fullText);
        setSummary(newSummary);
        setIsSummarizing(false);
    }
    
    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-gray-800">{warning.title}</p>
                    <p className="text-xs text-gray-500">{warning.source} - {warning.date.toLocaleDateString()}</p>
                </div>
                <button onClick={handleSummarize} disabled={isSummarizing} className="flex items-center gap-1.5 text-xs bg-white border border-gray-300 rounded-full px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50">
                    <SparklesIcon className="text-blue-500" />
                    {isSummarizing ? '...' : 'AI Summary'}
                </button>
            </div>
            <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{summary}</p>
        </div>
    );
};


export const Dashboard: React.FC<DashboardProps> = ({ tasks, warnings, onSelectTask, onAddTask }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const redZoneTasks = tasks.filter(t => t.riskLevel === RiskLevel.Red);
    const priorityTasks = tasks.filter(t => t.status !== TaskStatus.Completed);
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Compliance Governance Hub</h1>
                    <p className="text-gray-600 mt-1">Your single pane of glass for managing compliance tasks.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="mt-4 sm:mt-0 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                    <PlusIcon />
                    Triage New Task
                </button>
            </header>
            
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Red Zone Status */}
                    <section className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
                           <RedIcon className="h-4 w-4" /> Red Zone: Status
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">Critical risk reports requiring immediate attention.</p>
                        <div className="space-y-3">
                            {redZoneTasks.map(task => (
                                <div key={task.id} onClick={() => onSelectTask(task)} className="p-3 bg-red-50 rounded-lg flex justify-between items-center cursor-pointer hover:bg-red-100 transition duration-200">
                                    <div>
                                        <p className="font-semibold text-gray-800">{task.name}</p>
                                        <p className="text-sm text-gray-600">Due: {task.deadline.toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusChipStyle(task.status)}`}>{task.status}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* My Priority Tasks */}
                    <section className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">My Priority Tasks</h2>
                         <div className="divide-y divide-gray-200">
                            {priorityTasks.map(task => (
                                <div key={task.id} onClick={() => task.riskLevel === RiskLevel.Red && onSelectTask(task)} className={`py-3 flex items-center justify-between ${task.riskLevel === RiskLevel.Red ? 'cursor-pointer hover:bg-gray-50' : ''}`}>
                                    <div className="flex items-center">
                                        <RiskIcon level={task.riskLevel} />
                                        <div className="ml-3">
                                            <p className="font-medium text-gray-900">{task.name}</p>
                                            <p className="text-sm text-gray-500">Due: {task.deadline.toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusChipStyle(task.status)}`}>{task.status}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
                
                {/* Proactive Monitoring */}
                <aside className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Proactive Monitoring</h2>
                    <p className="text-sm text-gray-500 mb-4">Early warnings on new and changing policies.</p>
                    <div className="space-y-4">
                        {warnings.map(warning => (
                           <EarlyWarningCard key={warning.id} warning={warning} />
                        ))}
                    </div>
                </aside>
            </main>

            <IntakeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTriage={onAddTask} />
        </div>
    );
};
