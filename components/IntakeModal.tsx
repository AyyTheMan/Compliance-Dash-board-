
import React, { useState, useCallback } from 'react';
import { RiskLevel, Task } from '../types';
import { analyzeTextForTriage } from '../services/geminiService';
import { SparklesIcon } from './icons';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriage: (task: Omit<Task, 'id' | 'status' | 'auditLog' | 'signatures' | 'checklist'>) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const IntakeModal: React.FC<IntakeModalProps> = ({ isOpen, onClose, onTriage }) => {
  const [taskName, setTaskName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTriage = (riskLevel: RiskLevel) => {
    if (!taskName || !deadline) {
      alert('Please fill in Task Name and Deadline.');
      return;
    }
    onTriage({ name: taskName, deadline: new Date(deadline), riskLevel, source: sourceFile || pastedText });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTaskName('');
    setDeadline('');
    setSourceFile(null);
    setPastedText('');
  }

  const handleAnalyze = useCallback(async () => {
    let textToAnalyze = pastedText;
    if (!textToAnalyze && sourceFile) {
        try {
            textToAnalyze = await fileToText(sourceFile);
        } catch (error) {
            console.error("Could not read file for analysis", error);
            alert("Could not read the selected file.");
            return;
        }
    }

    if (!textToAnalyze) {
        alert("Please paste text or upload a file to analyze.");
        return;
    }
    
    setIsAnalyzing(true);
    try {
        const suggestions = await analyzeTextForTriage(textToAnalyze);
        if (suggestions) {
            setTaskName(suggestions.name);
            setDeadline(suggestions.deadline);
            // Could also highlight the suggested risk button
        } else {
            alert("Could not analyze the text. Please try again.");
        }
    } finally {
        setIsAnalyzing(false);
    }
  }, [pastedText, sourceFile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Triage New Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        
        <div className="space-y-4">
            <div>
                <label htmlFor="taskName" className="block text-sm font-medium text-gray-700">Task Name</label>
                <input type="text" id="taskName" value={taskName} onChange={(e) => setTaskName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Deadline</label>
                <input type="date" id="deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
             <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source (Upload Email, Document, etc.)</label>
                <input type="file" id="source" onChange={(e) => setSourceFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            </div>
            <div className="relative">
                <textarea 
                    rows={4} 
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="...or paste content here to be analyzed"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing}
                    className="absolute bottom-3 right-3 flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">
                     <SparklesIcon />
                     {isAnalyzing ? 'Analyzing...' : 'Analyze & Suggest'}
                </button>
            </div>
        </div>

        <div className="mt-8">
            <p className="text-sm font-medium text-gray-700 mb-3 text-center">Assign Risk Level</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => handleTriage(RiskLevel.Red)} className="w-full text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-3 text-center transition-transform transform hover:scale-105">Triage as RED</button>
                <button onClick={() => handleTriage(RiskLevel.Yellow)} className="w-full text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-3 text-center transition-transform transform hover:scale-105">Triage as YELLOW</button>
                <button onClick={() => handleTriage(RiskLevel.Green)} className="w-full text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-3 text-center transition-transform transform hover:scale-105">Triage as GREEN</button>
            </div>
        </div>
      </div>
    </div>
  );
};
