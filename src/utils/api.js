const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = {
    // Auth
    login: async (userData) => {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    },

    getUser: async (id) => {
        const response = await fetch(`${API_BASE}/users/${id}`);
        if (!response.ok) throw new Error('Get user failed');
        return response.json();
    },

    // Goals
    getGoals: async (userId) => {
        const response = await fetch(`${API_BASE}/goals?userId=${userId}`);
        if (!response.ok) throw new Error('Get goals failed');
        return response.json();
    },

    addGoal: async (userId, text) => {
        const response = await fetch(`${API_BASE}/goals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, text }),
        });
        if (!response.ok) throw new Error('Add goal failed');
        return response.json();
    },

    toggleGoal: async (id) => {
        const response = await fetch(`${API_BASE}/goals/${id}/toggle`, {
            method: 'PATCH',
        });
        if (!response.ok) throw new Error('Toggle goal failed');
        return response.json();
    },

    deleteGoal: async (id) => {
        const response = await fetch(`${API_BASE}/goals/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Delete goal failed');
        return response.json();
    },

    // History
    getHistory: async (userId) => {
        const response = await fetch(`${API_BASE}/history?userId=${userId}`);
        if (!response.ok) throw new Error('Get history failed');
        return response.json();
    },

    saveHistory: async (userId, date, goals, progress) => {
        const response = await fetch(`${API_BASE}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, date, goals, progress }),
        });
        if (!response.ok) throw new Error('Save history failed');
        return response.json();
    },

    // Comments
    getComments: async () => {
        const response = await fetch(`${API_BASE}/comments`);
        if (!response.ok) throw new Error('Get comments failed');
        return response.json();
    },

    addComment: async (authorId, text, type) => {
        const response = await fetch(`${API_BASE}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authorId, text, type }),
        });
        if (!response.ok) throw new Error('Add comment failed');
        return response.json();
    },
};
