import React, { useState, useEffect } from 'react';
import { Bolt, Users } from 'lucide-react';
import { format } from 'date-fns';
import Dashboard from './components/Dashboard';
import GoalList from './components/GoalList';
import CalendarView from './components/CalendarView';
import StatsSummary from './components/StatsSummary';
import Guestbook from './components/Guestbook';
import GoalHistoryModal from './components/GoalHistoryModal';
import KakaoLogin from './components/KakaoLogin';
import { calculateStats, calculatePenalty } from './utils/dataUtils';
import { getKakaoAuthUrl, getKakaoToken, getKakaoUserInfo, logoutKakao } from './utils/authUtils';
import { api } from './utils/api';

const GUEST_ID = 'guest';

function App() {
  // User State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('kakao_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('kakao_token'));

  const userId = user ? `user_${user.id}` : GUEST_ID;
  const dbUserId = user ? String(user.id) : GUEST_ID; // ID for DB calls

  const loginProcessed = React.useRef(false);

  // Handle Kakao Redirect Callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      if (loginProcessed.current) return;
      loginProcessed.current = true;

      const handleLoginCallback = async () => {
        try {
          // 1. Get Token
          const tokenData = await getKakaoToken(code);
          const token = tokenData.access_token;
          setAccessToken(token);
          localStorage.setItem('kakao_token', token);

          // 2. Get User Info
          const rawUserData = await getKakaoUserInfo(token);
          console.log('Kakao User Data:', JSON.stringify(rawUserData, null, 2));

          // Normalize User Data
          const userData = {
            id: rawUserData.id,
            nickname: rawUserData.kakao_account?.profile?.nickname || rawUserData.properties?.nickname || '카카오 사용자',
            profile_image: rawUserData.kakao_account?.profile?.profile_image_url || rawUserData.properties?.profile_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kakao'
          };

          // 3. Sync with Backend
          await api.login(userData);

          setUser(userData);
          localStorage.setItem('kakao_user', JSON.stringify(userData));

          // 4. Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error('Login failed', err);
          alert('로그인 처리에 실패했습니다.');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      handleLoginCallback();
    }
  }, []);

  // State initialization
  const [goals, setGoals] = useState([]);
  const [goalHistory, setGoalHistory] = useState({});
  const [comments, setComments] = useState([]);

  // Load Data when userId changes
  useEffect(() => {
    const loadData = async () => {
      if (userId === GUEST_ID) {
        // Guest Mode: Use LocalStorage or Mock
        const savedGoals = localStorage.getItem(`goals_${userId}`);
        setGoals(savedGoals ? JSON.parse(savedGoals) : []);

        const savedHistory = localStorage.getItem(`goalHistory_${userId}`);
        setGoalHistory(savedHistory ? JSON.parse(savedHistory) : {});
      } else {
        // User Mode: Fetch from API
        try {
          const [fetchedGoals, fetchedHistory] = await Promise.all([
            api.getGoals(dbUserId),
            api.getHistory(dbUserId)
          ]);
          setGoals(fetchedGoals);
          setGoalHistory(fetchedHistory);
        } catch (error) {
          console.error('Failed to load user data', error);
        }
      }

      // Load Comments (Global)
      try {
        const fetchedComments = await api.getComments();
        setComments(fetchedComments);
      } catch (error) {
        console.error('Failed to load comments', error);
      }
    };
    loadData();
  }, [userId, dbUserId]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedGoals, setSelectedGoals] = useState([]);

  // Group Members (only current user)
  const [groupMembers, setGroupMembers] = useState(() => {
    return [
      {
        id: 'me',
        name: '나의 하루',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liliana',
        progress: 0,
        history: {},
        stats: { weekly: 0, monthly: 0, yearly: 0, penalty: 0 }
      }
    ];
  });

  // Persist goals & history (Guest Only)
  useEffect(() => {
    if (userId === GUEST_ID) {
      if (goals.length > 0) localStorage.setItem(`goals_${userId}`, JSON.stringify(goals));
      if (Object.keys(goalHistory).length > 0) localStorage.setItem(`goalHistory_${userId}`, JSON.stringify(goalHistory));
    }
  }, [goals, goalHistory, userId]);

  // Update "My" progress and stats whenever goals change
  useEffect(() => {
    const myProgress = calculateProgress();
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Update History for Today (Local State)
    setGoalHistory(prev => ({
      ...prev,
      [todayStr]: goals
    }));

    // Sync History to Backend if User
    if (userId !== GUEST_ID && goals.length > 0) {
      // Debounce or just save? For now, save on every change is okay for low traffic
      api.saveHistory(dbUserId, todayStr, goals, myProgress).catch(err => console.error('Failed to save history', err));
    }

    setGroupMembers(prev => prev.map(member => {
      if (member.id === 'me') {
        const newHistory = { ...member.history, [todayStr]: myProgress };
        const newStats = calculateStats(newHistory);
        return {
          ...member,
          name: user ? user.nickname : '나의 하루',
          avatar: user ? user.profile_image : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liliana',
          progress: myProgress,
          history: newHistory,
          stats: { ...newStats, penalty: calculatePenalty(newHistory) }
        };
      }
      return member;
    }));
  }, [goals, user, userId, dbUserId]);

  // Auth Handlers
  const handleLogin = () => {
    window.location.href = getKakaoAuthUrl();
  };

  const handleLogout = async () => {
    await logoutKakao(accessToken);
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('kakao_user');
    localStorage.removeItem('kakao_token');
  };

  // Goal Handlers
  const addGoal = async (text) => {
    if (userId !== GUEST_ID) {
      try {
        const newGoal = await api.addGoal(dbUserId, text);
        setGoals([...goals, newGoal]);
      } catch (error) {
        console.error('Failed to add goal', error);
        alert('목표 추가 실패');
      }
    } else {
      const newGoal = {
        id: Date.now(),
        text,
        completed: false,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setGoals([...goals, newGoal]);
    }
  };

  const toggleGoal = async (id) => {
    if (userId !== GUEST_ID) {
      try {
        const updatedGoal = await api.toggleGoal(id);
        setGoals(goals.map(goal => goal.id === id ? updatedGoal : goal));
      } catch (error) {
        console.error('Failed to toggle goal', error);
      }
    } else {
      setGoals(goals.map(goal =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      ));
    }
  };

  const deleteGoal = async (id) => {
    if (userId !== GUEST_ID) {
      try {
        await api.deleteGoal(id);
        setGoals(goals.filter(goal => goal.id !== id));
      } catch (error) {
        console.error('Failed to delete goal', error);
      }
    } else {
      setGoals(goals.filter(goal => goal.id !== id));
    }
  };

  // Comment Handler
  const addComment = async (text, type) => {
    if (userId !== GUEST_ID) {
      try {
        const newComment = await api.addComment(dbUserId, text, type);
        setComments([newComment, ...comments]);
      } catch (error) {
        console.error('Failed to add comment', error);
        alert('방명록 작성 실패');
      }
    } else {
      // Guest comment (Local only or allow anonymous?)
      // For now, let's say guests can't comment or just local
      const newComment = {
        id: Date.now(),
        authorId: userId,
        authorName: user ? user.nickname : '익명',
        text,
        type,
        timestamp: format(new Date(), 'yyyy-MM-dd')
      };
      setComments([newComment, ...comments]);
      // Note: Guest comments won't be persisted to DB in this implementation
    }
  };

  // Date Click Handler
  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (dateStr === todayStr) {
      setSelectedGoals(goals);
    } else if (goalHistory[dateStr]) {
      setSelectedGoals(goalHistory[dateStr]);
    } else {
      setSelectedGoals(generateMockGoals());
    }
    setIsModalOpen(true);
  };

  // Calculate Progress
  const calculateProgress = () => {
    if (goals.length === 0) return 0;
    const completed = goals.filter(g => g.completed).length;
    return Math.round((completed / goals.length) * 100);
  };

  const currentUser = groupMembers.find(m => m.id === 'me');

  return (
    <div className="app-container">
      <header className="glass-header">
        <div className="logo">
          <Bolt size={24} />
          <h1>인생개조프로젝트</h1>
        </div>
        <div className="header-right" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <KakaoLogin user={user} onLogin={handleLogin} onLogout={handleLogout} />
        </div>
      </header>

      <main>
        <Dashboard
          myProgress={currentUser.progress}
          groupMembers={groupMembers}
          currentUserId={'me'}
          currentUserGoals={goals}
        />

        <StatsSummary stats={currentUser.stats} />
        <CalendarView
          history={currentUser.history}
          onDateClick={handleDateClick}
        />

        <GoalList
          goals={goals}
          onAdd={addGoal}
          onToggle={toggleGoal}
          onDelete={deleteGoal}
          isReadOnly={userId === GUEST_ID}
        />

        <Guestbook
          comments={comments}
          onAddComment={addComment}
          currentUserId={userId}
          isReadOnly={userId === GUEST_ID}
        />
      </main>

      <GoalHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate}
        goals={selectedGoals}
      />
    </div>
  );
}

export default App;
