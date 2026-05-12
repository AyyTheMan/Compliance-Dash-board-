
import { useState } from 'react';
import { Task, RiskLevel, TaskStatus, EarlyWarning } from '../types';

const today = new Date();
const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const initialTasks: Task[] = [
    {
        id: 'RED-001',
        name: 'Annual AML Program Review Submission',
        deadline: addDays(today, 15),
        riskLevel: RiskLevel.Red,
        status: TaskStatus.PendingCompliance,
        checklist: [
            { id: 'c1', text: 'Confirm Section 3 uses new 2024 formatting as per regulator feedback', completed: true },
            { id: 'c2', text: 'Verify all transaction data is up-to-date as of EOD yesterday', completed: true },
            { id: 'c3', text: 'Cross-reference with Q4 internal audit findings', completed: false },
            { id: 'c4', text: 'Finalize executive summary', completed: false },
        ],
        signatures: { complianceManager: false, headOfLegal: false },
        auditLog: [
            { id: 'a1', timestamp: addDays(today, -5), user: 'Compliance Manager', action: 'Task created from regulator email.' },
            { id: 'a2', timestamp: addDays(today, -2), user: 'System', action: 'Checklist item 1 marked as complete.' },
            { id: 'a3', timestamp: addDays(today, -1), user: 'System', action: 'Checklist item 2 marked as complete.' },
        ],
        coverImage: 'https://picsum.photos/1600/900?grayscale&blur=2'
    },
    {
        id: 'RED-002',
        name: 'Regulatory Filing for FINRA Rule 3110',
        deadline: addDays(today, 35),
        riskLevel: RiskLevel.Red,
        status: TaskStatus.Drafting,
        checklist: [
            { id: 'd1', text: 'Gather all required documentation', completed: false },
            { id: 'd2', text: 'Draft initial response', completed: false },
        ],
        signatures: { complianceManager: false, headOfLegal: false },
        auditLog: [{ id: 'b1', timestamp: addDays(today, -1), user: 'Compliance Manager', action: 'Task created.' }],
    },
    {
        id: 'YEL-001',
        name: 'Weekly Branch Transaction Monitoring Report',
        deadline: addDays(today, 4),
        riskLevel: RiskLevel.Yellow,
        status: TaskStatus.Drafting,
        checklist: [],
        signatures: { complianceManager: false, headOfLegal: false },
        auditLog: [],
    },
    {
        id: 'YEL-002',
        name: 'Internal Training Completion Audit',
        deadline: addDays(today, 12),
        riskLevel: RiskLevel.Yellow,
        status: TaskStatus.Completed,
        checklist: [],
        signatures: { complianceManager: true, headOfLegal: false },
        auditLog: [],
    },
    {
        id: 'GRE-001',
        name: 'Client Service Request: Account History',
        deadline: addDays(today, 2),
        riskLevel: RiskLevel.Green,
        status: TaskStatus.Drafting,
        checklist: [],
        signatures: { complianceManager: false, headOfLegal: false },
        auditLog: [],
    },
     {
        id: 'RED-003',
        name: 'Respond to SEC Inquiry #2024-582',
        deadline: addDays(today, 7),
        riskLevel: RiskLevel.Red,
        status: TaskStatus.Overdue,
        checklist: [],
        signatures: { complianceManager: false, headOfLegal: false },
        auditLog: [],
    },
];

const initialEarlyWarnings: EarlyWarning[] = [
    {
        id: 'EW-001',
        title: 'New Guidance on Digital Asset Reporting Standards',
        source: 'Federal Reserve',
        date: addDays(today, -1),
        summary: 'The Federal Reserve has issued new guidance requiring enhanced reporting for institutions holding digital assets. Key changes include...',
        fullText: 'The Federal Reserve has issued new guidance requiring enhanced reporting for institutions holding digital assets. Key changes include more frequent reporting cycles and detailed breakdowns of asset types. This is expected to impact our current reporting workflow significantly.'
    },
    {
        id: 'EW-002',
        title: 'Proposed Amendment to Consumer Privacy Act',
        source: 'State Banking Commission',
        date: addDays(today, -3),
        summary: 'A proposed amendment could expand the definition of Personal Identifiable Information (PII), affecting data storage and client communication protocols.',
        fullText: 'A proposed amendment to the Consumer Privacy Act is currently under review. If passed, it will expand the definition of Personal Identifiable Information (PII) to include IP addresses and device identifiers. This would necessitate a comprehensive review of our data storage, client communication protocols, and privacy policies.'
    }
];

export const useMockData = () => {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [warnings, setWarnings] = useState<EarlyWarning[]>(initialEarlyWarnings);

    const updateTask = (updatedTask: Task) => {
        setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    };

    const addTask = (newTask: Omit<Task, 'id' | 'status' | 'auditLog' | 'signatures' | 'checklist'>) => {
        const newId = `${newTask.riskLevel.substring(0,3)}-${Math.floor(Math.random() * 1000).toString().padStart(3,'0')}`;
        const taskToAdd: Task = {
            ...newTask,
            id: newId,
            status: TaskStatus.Drafting,
            auditLog: [{ id: 'log1', timestamp: new Date(), user: 'Compliance Manager', action: 'Task created.' }],
            signatures: { complianceManager: false, headOfLegal: false },
            checklist: newTask.riskLevel === RiskLevel.Red ? [
                {id: 'c1', text: 'Initial draft and review', completed: false},
                {id: 'c2', text: 'Gather supporting documents', completed: false}
            ] : []
        };
        setTasks(prevTasks => [taskToAdd, ...prevTasks]);
    }

    return { tasks, warnings, updateTask, addTask };
};
