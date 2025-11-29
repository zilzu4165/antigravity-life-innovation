import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Circle, Calendar } from 'lucide-react';

export default function GoalHistoryModal({ isOpen, onClose, date, goals }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="modal-content glass-panel"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <h3><Calendar size={20} /> {date}의 목표</h3>
                        <button className="close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    <ul className="history-goal-list">
                        {goals.length > 0 ? (
                            goals.map((goal) => (
                                <li key={goal.id} className={`history-goal-item ${goal.completed ? 'completed' : ''}`}>
                                    {goal.completed ? (
                                        <CheckCircle2 size={20} className="text-success" />
                                    ) : (
                                        <Circle size={20} className="text-muted" />
                                    )}
                                    <span className="goal-text">{goal.text}</span>
                                </li>
                            ))
                        ) : (
                            <p className="text-muted text-center py-4">기록된 목표가 없습니다.</p>
                        )}
                    </ul>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
