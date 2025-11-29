import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListChecks, Plus, Check, Trash2 } from 'lucide-react';

export default function GoalList({ goals, onAdd, onToggle, onDelete }) {
    const [isAdding, setIsAdding] = useState(false);
    const [inputText, setInputText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        onAdd(inputText);
        setInputText('');
        // Keep input open for multiple additions or close it? Let's keep it open for convenience
    };

    return (
        <section className="goal-section glass-panel">
            <div className="section-header">
                <h2><ListChecks size={20} /> 오늘의 목표</h2>
                <button
                    className="neon-btn"
                    onClick={() => setIsAdding(!isAdding)}
                >
                    <Plus size={16} /> 목표 추가
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="input-group"
                        onSubmit={handleSubmit}
                    >
                        <input
                            type="text"
                            placeholder="예: 러닝 3km, 독서 10페이지..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="save-btn">
                            <Check size={18} />
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            <ul className="goal-list">
                <AnimatePresence>
                    {goals.map(goal => (
                        <motion.li
                            key={goal.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`goal-item ${goal.completed ? 'completed' : ''}`}
                            onClick={() => onToggle(goal.id)}
                            layout
                        >
                            <div className="check-circle">
                                {goal.completed && <Check size={14} strokeWidth={3} />}
                            </div>
                            <span className="goal-text">{goal.text}</span>
                            <button
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(goal.id);
                                }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.li>
                    ))}
                </AnimatePresence>
                {goals.length === 0 && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-muted"
                        style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}
                    >
                        아직 목표가 없습니다. 새로운 목표를 추가해보세요!
                    </motion.p>
                )}
            </ul>
        </section>
    );
}
