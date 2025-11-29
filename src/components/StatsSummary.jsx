import React from 'react';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';

export default function StatsSummary({ stats }) {
    return (
        <section className="stats-summary glass-panel" style={{ marginTop: '24px' }}>
            <div className="stats-grid">
                <div className="stats-card">
                    <div className="stats-icon"><TrendingUp size={20} /></div>
                    <div className="stats-info">
                        <span className="stats-label">주간 평균</span>
                        <span className="stats-value">{stats.weekly}%</span>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="stats-icon"><Calendar size={20} /></div>
                    <div className="stats-info">
                        <span className="stats-label">월간 평균</span>
                        <span className="stats-value">{stats.monthly}%</span>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="stats-icon"><BarChart3 size={20} /></div>
                    <div className="stats-info">
                        <span className="stats-label">연간 평균</span>
                        <span className="stats-value">{stats.yearly}%</span>
                    </div>
                </div>

                <div className="stats-card penalty">
                    <div className="stats-icon penalty-icon">💸</div>
                    <div className="stats-info">
                        <span className="stats-label">누적 벌금</span>
                        <span className="stats-value penalty-value">
                            {stats.penalty ? stats.penalty.toLocaleString() : 0}원
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
