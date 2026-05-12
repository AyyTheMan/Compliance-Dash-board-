
import React, { useState } from 'react';
import { Task, ChecklistItem, TaskStatus, AuditLogEntry } from '../types';
import { BackIcon, CheckCircleIcon, PendingCircleIcon, LockedIcon, ImageGenerationIcon } from './icons';
import { generateImage } from '../services/geminiService';

interface RedZoneTaskViewProps {
  task: Task;
  onBack: () => void;
  onUpdateTask: (task: Task) => void;
}

const getStatusChipStyle = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.Completed: return "bg-green-100 text-green-800";
        case TaskStatus.Overdue: return "bg-red-100 text-red-800";
        case TaskStatus.PendingLegal: return "bg-blue-100 text-blue-800";
        case TaskStatus.PendingCompliance: return "bg-yellow-100 text-yellow-800";
        default: return "bg-gray-100 text-gray-800";
    }
}

export const RedZoneTaskView: React.FC<RedZoneTaskViewProps> = ({ task, onBack, onUpdateTask }) => {
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    
    const handleChecklistToggle = (itemId: string) => {
        const updatedChecklist = task.checklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        const newLog: AuditLogEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date(),
            user: 'System',
            action: `Checklist item "${updatedChecklist.find(i => i.id === itemId)?.text}" marked as ${updatedChecklist.find(i => i.id === itemId)?.completed ? 'complete' : 'incomplete'}.`
        };
        onUpdateTask({ ...task, checklist: updatedChecklist, auditLog: [...task.auditLog, newLog] });
    };

    const handleSignOff = () => {
        const allChecklistCompleted = task.checklist.every(item => item.completed);
        if (!allChecklistCompleted) {
            alert("All checklist items must be completed before signing off.");
            return;
        }
        
        const newLog: AuditLogEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date(),
            user: 'Compliance Manager',
            action: `Signed off task.`
        };

        onUpdateTask({ 
            ...task,
            signatures: { ...task.signatures, complianceManager: true },
            status: TaskStatus.PendingLegal,
            auditLog: [...task.auditLog, newLog] 
        });
    };

    const handleGenerateCover = async () => {
        setIsGeneratingImage(true);
        const imageUrl = await generateImage(task.name);
        if (imageUrl) {
             const newLog: AuditLogEntry = {
                id: `log-${Date.now()}`,
                timestamp: new Date(),
                user: 'Compliance Manager',
                action: `Generated a new cover image.`
            };
            onUpdateTask({ ...task, coverImage: imageUrl, auditLog: [...task.auditLog, newLog] });
        } else {
            alert("Failed to generate cover image.");
        }
        setIsGeneratingImage(false);
    };

    const allChecklistCompleted = task.checklist.every(item => item.completed);
    const complianceManagerSigned = task.signatures.complianceManager;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <button onClick={onBack} className="flex items-center gap-2 text-blue-600 font-semibold mb-6 hover:underline">
                <BackIcon />
                Back to Dashboard
            </button>
            
            <header className="mb-8 p-6 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{task.name}</h1>
                        <p className="text-gray-600 mt-1">Due: <span className="font-medium">{task.deadline.toLocaleDateString()}</span></p>
                    </div>
                    <span className={`mt-2 sm:mt-0 px-3 py-1 text-sm font-medium rounded-full ${getStatusChipStyle(task.status)}`}>{task.status}</span>
                </div>
                 {task.coverImage && (
                    <div className="mt-4 aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
                        <img src={task.coverImage} alt="Report Cover" className="w-full h-full object-cover"/>
                    </div>
                )}
                 <button onClick={handleGenerateCover} disabled={isGeneratingImage} className="mt-4 flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-wait">
                    <ImageGenerationIcon />
                    {isGeneratingImage ? 'Generating...' : 'Generate Cover Image'}
                </button>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Living Checklist */}
                    <section className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Living Checklist</h2>
                        <div className="space-y-3">
                            {task.checklist.map(item => (
                                <label key={item.id} className="flex items-center p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100">
                                    <input type="checkbox" checked={item.completed} onChange={() => handleChecklistToggle(item.id)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className={`ml-3 text-gray-700 ${item.completed ? 'line-through text-gray-500' : ''}`}>{item.text}</span>
                                </label>
                            ))}
                        </div>
                    </section>
                    
                    {/* Audit Log */}
                    <section className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Audit Log</h2>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                           {[...task.auditLog].reverse().map(log => (
                                <div key={log.id} className="flex items-start text-sm">
                                    <p className="w-40 text-gray-500 flex-shrink-0">{log.timestamp.toLocaleString()}</p>
                                    <p className="ml-4"><span className="font-semibold text-gray-700">{log.user}:</span> <span className="text-gray-600">{log.action}</span></p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
                
                {/* Dual-Signature Workflow */}
                <aside className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Dual-Signature Workflow</h2>
                    <ol className="relative border-l border-gray-200">
                        <li className="mb-10 ml-8">
                            {complianceManagerSigned ? <CheckCircleIcon className="absolute -left-3.5"/> : <PendingCircleIcon className="absolute -left-3.5"/>}
                            <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">Compliance Manager</h3>
                            <p className="text-sm font-normal text-gray-500">{complianceManagerSigned ? "Signed off." : "Pending sign-off."}</p>
                            {!complianceManagerSigned && (
                                <button onClick={handleSignOff} disabled={!allChecklistCompleted} className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    Sign-Off
                                </button>
                            )}
                             {!complianceManagerSigned && !allChecklistCompleted && (
                                <p className="mt-2 text-xs text-red-600">Complete all checklist items to enable sign-off.</p>
                            )}
                        </li>
                        <li className="ml-8">
                            {!complianceManagerSigned ? <LockedIcon className="absolute -left-3.5"/> : (task.signatures.headOfLegal ? <CheckCircleIcon className="absolute -left-3.5"/> : <PendingCircleIcon className="absolute -left-3.5"/>)}
                            <h3 className="mb-1 text-lg font-semibold text-gray-900">Head of Legal</h3>
                            <p className="text-sm font-normal text-gray-500">
                                {task.signatures.headOfLegal ? "Signed off." : (complianceManagerSigned ? "Awaiting review." : "Locked")}
                            </p>
                        </li>
                    </ol>
                </aside>
            </main>
        </div>
    );
};
