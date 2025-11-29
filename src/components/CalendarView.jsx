import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarView({ history, onDateClick }) {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add empty placeholders for days before the 1st of the month
    const startDay = getDay(monthStart); // 0 (Sun) to 6 (Sat)
    const placeholders = Array.from({ length: startDay });

    const getColor = (progress) => {
        if (progress === undefined) return 'rgba(255, 255, 255, 0.05)'; // No data
        if (progress === 0) return 'rgba(255, 255, 255, 0.1)'; // 0%
        if (progress < 50) return 'rgba(74, 222, 128, 0.3)'; // Low
        if (progress < 80) return 'rgba(74, 222, 128, 0.6)'; // Medium
        return 'rgba(74, 222, 128, 1)'; // High (Neon Green)
    };

    return (
        <section className="calendar-section glass-panel">
            <h2><CalendarIcon size={18} /> 이번 달 기록</h2>

            <div className="calendar-grid">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                    <div key={day} className="calendar-header">{day}</div>
                ))}

                {placeholders.map((_, i) => (
                    <div key={`placeholder-${i}`} className="calendar-day empty" />
                ))}

                {daysInMonth.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const progress = history[dateStr];

                    return (
                        <div
                            key={dateStr}
                            className={`calendar-day ${isToday(day) ? 'today' : ''}`}
                            style={{ backgroundColor: getColor(progress) }}
                            title={`${dateStr}: ${progress !== undefined ? progress + '%' : 'No Data'}`}
                            onClick={() => onDateClick(dateStr)}
                        >
                            <span className="day-number">{format(day, 'd')}</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
