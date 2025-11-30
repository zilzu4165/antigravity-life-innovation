import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown } from 'lucide-react';
import { getPeriodRank, calculatePenalty } from '../utils/dataUtils';
import UserGoalsModal from './UserGoalsModal';
import { api } from '../utils/api';

export default function Leaderboard({ members, currentUserId, currentUserGoals }) {
    const [period, setPeriod] = useState('daily'); // daily, weekly, monthly, yearly
    const [selectedUser, setSelectedUser] = useState(null);
    const [userGoals, setUserGoals] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Sort members based on selected period
    const sortedMembers = getPeriodRank(members, period);

    const getRankIcon = (index) => {
        if (index === 0) return <Crown size={20} className="rank-icon gold" fill="gold" color="goldenrod" />;
        if (index === 1) return <Medal size={20} className="rank-icon silver" color="silver" />;
        if (index === 2) return <Medal size={20} className="rank-icon bronze" color="#cd7f32" />;
        return <span className="rank-number">{index + 1}</span>;
    };

    const getProgress = (member) => {
        if (period === 'daily') return member.progress;
        if (period === 'penalty') return calculatePenalty(member.history);
        return member.stats[period];
    };

    const handleUserClick = async (member) => {
        // For "me" (current user), use the actual goals from props
        if (member.id === 'me') {
            setUserGoals(currentUserGoals || []);
            setSelectedUser(member);
            setIsModalOpen(true);
            return;
        }

        // For mock users (user1, user2, user3), show empty
        if (member.id.startsWith('user')) {
            setUserGoals([]);
            setSelectedUser(member);
            setIsModalOpen(true);
            return;
        }

        // For real users, fetch from API
        try {
            const goals = await api.getUserGoals(member.dbId);
            setUserGoals(goals);
            setSelectedUser(member);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Failed to fetch user goals:', error);
            setUserGoals([]);
            setSelectedUser(member);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        setUserGoals([]);
    };

    return (
        <div className="leaderboard-container">
            <h3 className="leaderboard-title">
                <Trophy size={18} className="text-accent" />
                실시간 랭킹
            </h3>

            <div className="leaderboard-tabs">
                {['daily', 'weekly', 'monthly', 'yearly', 'penalty'].map(p => (
                    <button
                        key={p}
                        className={`tab-btn ${period === p ? 'active' : ''}`}
                        onClick={() => setPeriod(p)}
                    >
                        {p === 'daily' ? '오늘' :
                            p === 'weekly' ? '주간' :
                                p === 'monthly' ? '월간' :
                                    p === 'yearly' ? '연간' : '벌금'}
                    </button>
                ))}
            </div>

            <ul className="leaderboard-list">
                {sortedMembers.map((member, index) => {
                    const isCurrentUser = member.id === currentUserId;
                    const value = getProgress(member);
                    const isPenalty = period === 'penalty';

                    return (
                        <motion.li
                            key={member.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`leaderboard-item ${isCurrentUser ? 'current-user' : ''} rank-${index + 1}`}
                            layout
                            onClick={() => handleUserClick(member)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="rank-badge">
                                {getRankIcon(index)}
                            </div>

                            <div className="member-info">
                                <div className="member-avatar">
                                    <img src={member.avatar?.replace('http:', 'https:')} alt={member.name} />
                                </div>
                                <span className="member-name">
                                    {member.name}
                                    {isCurrentUser && <span className="me-badge">나</span>}
                                </span>
                            </div>

                            <div className="member-progress">
                                {!isPenalty && (
                                    <div className="progress-bar-bg">
                                        <motion.div
                                            className="progress-bar-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${value}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            style={{
                                                backgroundColor: isCurrentUser ? 'var(--success)' : 'var(--primary)'
                                            }}
                                        />
                                    </div>
                                )}
                                <span className="progress-text">
                                    {isPenalty ? `${value.toLocaleString()}원` : `${Math.round(value)}%`}
                                </span>
                            </div>
                        </motion.li>
                    );
                })}
            </ul>

            <UserGoalsModal
                isOpen={isModalOpen}
                onClose={closeModal}
                user={selectedUser}
                goals={userGoals}
            />
        </div>
    );
}
