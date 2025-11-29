import { subDays, format, startOfWeek, startOfMonth, startOfYear, isSameWeek, isSameMonth, isSameYear, eachDayOfInterval } from 'date-fns';

// Generate mock history for the past 365 days
export const generateMockHistory = (baseProgress = 50) => {
    const history = {};
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');

        // Random progress with some consistency based on baseProgress
        // Add some randomness (-20% to +20%)
        const randomFactor = (Math.random() * 40) - 20;
        let progress = baseProgress + randomFactor;

        // Clamp between 0 and 100
        progress = Math.max(0, Math.min(100, progress));

        // 20% chance of 0% (missed day)
        if (Math.random() < 0.2) progress = 0;

        // 10% chance of 100% (perfect day)
        if (Math.random() < 0.1) progress = 100;

        history[dateStr] = Math.round(progress);
    }
    return history;
};

export const calculateStats = (history) => {
    const today = new Date();
    const dates = Object.keys(history);

    const getAverage = (filterFn) => {
        const filteredDates = dates.filter(dateStr => filterFn(new Date(dateStr), today));
        if (filteredDates.length === 0) return 0;

        const sum = filteredDates.reduce((acc, dateStr) => acc + history[dateStr], 0);
        return Math.round(sum / filteredDates.length);
    };

    return {
        weekly: getAverage((date, today) => isSameWeek(date, today, { weekStartsOn: 1 })), // Monday start
        monthly: getAverage((date, today) => isSameMonth(date, today)),
        yearly: getAverage((date, today) => isSameYear(date, today)),
    };
};

export const calculatePenalty = (history) => {
    const dates = Object.keys(history);
    // Count days with 0% progress
    const zeroDays = dates.filter(dateStr => history[dateStr] === 0).length;
    return zeroDays * 1000;
};

export const getPeriodRank = (members, period) => {
    // period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'penalty'
    return [...members].sort((a, b) => {
        if (period === 'penalty') {
            // For penalty, higher is "better" for ranking (who paid most?) 
            // OR usually leaderboard shows who is doing best. 
            // Let's assume the user wants to see who paid the MOST fines (Penalty Ranking).
            const penaltyA = calculatePenalty(a.history);
            const penaltyB = calculatePenalty(b.history);
            return penaltyB - penaltyA;
        }
        const statA = period === 'daily' ? a.progress : a.stats[period];
        const statB = period === 'daily' ? b.progress : b.stats[period];
        return statB - statA;
    });
};
export const generateMockGoals = () => {
    const commonGoals = [
        "아침 7시 기상", "물 2L 마시기", "독서 30분", "러닝 3km",
        "영양제 챙겨먹기", "일기 쓰기", "스트레칭 10분", "뉴스 읽기"
    ];

    // Pick 3-5 random goals
    const count = Math.floor(Math.random() * 3) + 3;
    const shuffled = [...commonGoals].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    return selected.map((text, index) => ({
        id: `mock-${index}`,
        text,
        completed: Math.random() > 0.3 // 70% chance of completion
    }));
};
