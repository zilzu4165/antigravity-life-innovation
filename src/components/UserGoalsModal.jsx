import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, CheckCircle, Circle } from 'lucide-react';

export default function UserGoalsModal({ isOpen, onClose, user, goals }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay" onClick={onClose}>
                <motion.div
                    className="modal-content"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <h3>
                            <Target size={18} />
                            {user?.name}님의 오늘 목표
                        </h3>
                        <button onClick={onClose} className="close-btn">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="user-goals-content">
                        {user && (
                            <div className="user-info-header">
                                <img src={user.avatar} alt={user.name} className="user-avatar-large" />
                                <div>
                                    <h4>{user.name}</h4>
                                    <p className="progress-text">진행률: {user.progress}%</p>
                                </div>
                            </div>
                        )}

                        {goals && goals.length > 0 ? (
                            <ul className="history-goal-list">
                                {goals.map((goal, index) => (
                                    <li key={index} className={`history-goal-item ${goal.completed ? 'completed' : ''}`}>
                                        <div className="check-circle">
                                            {goal.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                                        </div>
                                        <span className="goal-text">{goal.text}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="empty-state">
                                <Target size={48} style={{ opacity: 0.3 }} />
                                <p>아직 목표가 없습니다</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
