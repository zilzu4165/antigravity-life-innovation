import React from 'react';
import { motion } from 'framer-motion';
import { PieChart } from 'lucide-react';
import Leaderboard from './Leaderboard';

export default function Dashboard({ myProgress, groupMembers, currentUserId, currentUserGoals }) {
    const getMotivationMessage = (percent) => {
        if (percent === 100) return "완벽해! 오늘 하루를 지배했어! 👑";
        if (percent >= 80) return "거의 다 왔어! 조금만 더 힘내! 🔥";
        if (percent >= 50) return "절반은 넘었어! 멈추지 마! 🏃";
        if (percent > 0) return "시작이 반이야! 계속 가보자! 🌱";
        return "아직 시작도 안 했다고? 움직여! ⚡️";
    };

    return (
        <section className="dashboard glass-panel">
            <h2><PieChart size={18} /> 오늘의 달성률</h2>

            <div className="my-summary">
                <div className="progress-circle" style={{ '--percent': myProgress, margin: '0 auto' }}>
                    <span className="percent-text">{Math.round(myProgress)}%</span>
                </div>
                <motion.p
                    key={myProgress}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="motivation-text"
                    style={{ marginTop: '16px' }}
                >
                    {getMotivationMessage(myProgress)}
                </motion.p>
            </div>

            <Leaderboard
                members={groupMembers}
                currentUserId={currentUserId}
                currentUserGoals={currentUserGoals}
            />
        </section>
    );
}
