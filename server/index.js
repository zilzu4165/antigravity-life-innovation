const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request Logging Middleware
// Request Logging Middleware
app.use((req, res, next) => {
    const time = new Date().toISOString();
    console.log(`[${time}] ${req.method} ${req.url}`);
    if (Object.keys(req.query).length > 0) {
        console.log('  Query:', JSON.stringify(req.query, null, 2));
    }
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('  Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// --- Auth Routes ---

// Login / Register User
app.post('/api/auth/login', async (req, res) => {
    const { id, nickname, profileImage } = req.body;
    try {
        const user = await prisma.user.upsert({
            where: { id: String(id) },
            update: { nickname, profileImage: profileImage?.replace('http:', 'https:') },
            create: { id: String(id), nickname, profileImage: profileImage?.replace('http:', 'https:') },
        });
        res.json(user);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get Leaderboard (All Users with Today's Progress)
app.get('/api/users/leaderboard/all', async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];

        // Fetch all users with their history for today
        const users = await prisma.user.findMany({
            include: {
                history: true
            }
        });

        const leaderboard = users.map(user => {
            // Find today's history
            const todayHistory = user.history.find(h => h.date === todayStr);
            const progress = todayHistory ? todayHistory.progress : 0;

            // Calculate stats (simple version for now)
            // Weekly: Average of last 7 days
            // Monthly: Average of last 30 days
            // Penalty: Count of 0% days in last month

            // For now, let's just return basic info and progress to get it working
            return {
                id: `user_${user.id}`, // Format to match frontend expectation
                dbId: user.id,
                name: user.nickname,
                avatar: (user.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.nickname).replace('http:', 'https:'),
                progress: progress,
                history: user.history.reduce((acc, curr) => {
                    acc[curr.date] = JSON.parse(curr.goals);
                    return acc;
                }, {}),
                stats: {
                    weekly: 0, // Todo: Implement calculation
                    monthly: 0,
                    yearly: 0,
                    penalty: 0
                }
            };
        });

        res.json(leaderboard);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Get User Info
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: {
                stats: true // Wait, stats are calculated on frontend currently. We might need to move that logic or just store history.
                // Schema has 'history' relation.
            }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        // Force HTTPS for profile image
        if (user.profileImage) {
            user.profileImage = user.profileImage.replace('http:', 'https:');
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// --- Goal Routes ---

// Get Goals for User
app.get('/api/goals', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    try {
        // Get today's goals
        // For now, we just fetch all active goals (not completed or completed today? Logic was: goals are for "today")
        // In the frontend, goals were reset daily.
        // Here, let's just fetch all goals for the user that were created today OR are active.
        // Simplification: Fetch all goals for the user. Frontend filters?
        // Better: Fetch goals created >= today 00:00 OR (active and carried over?)
        // Let's stick to the frontend logic: "Goals" are just a list.
        // We will just return all goals for the user for now.
        const goals = await prisma.goal.findMany({
            where: { userId: String(userId) },
            orderBy: { createdAt: 'asc' }
        });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// Add Goal
app.post('/api/goals', async (req, res) => {
    const { userId, text } = req.body;
    try {
        const goal = await prisma.goal.create({
            data: {
                userId: String(userId),
                text,
                completed: false
            }
        });
        res.json(goal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

// Toggle Goal
app.patch('/api/goals/:id/toggle', async (req, res) => {
    const { id } = req.params;
    try {
        const goal = await prisma.goal.findUnique({ where: { id: Number(id) } });
        const updated = await prisma.goal.update({
            where: { id: Number(id) },
            data: { completed: !goal.completed }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle goal' });
    }
});

// Delete Goal
app.delete('/api/goals/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.goal.delete({ where: { id: Number(id) } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

// --- History Routes ---

// Get History
app.get('/api/history', async (req, res) => {
    const { userId } = req.query;
    try {
        const history = await prisma.goalHistory.findMany({
            where: { userId: String(userId) }
        });
        // Convert array to object map for frontend compatibility
        const historyMap = history.reduce((acc, curr) => {
            acc[curr.date] = JSON.parse(curr.goals);
            return acc;
        }, {});
        res.json(historyMap);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Save History (Daily Summary)
app.post('/api/history', async (req, res) => {
    const { userId, date, goals, progress } = req.body;
    try {
        const history = await prisma.goalHistory.upsert({
            where: {
                userId_date: {
                    userId: String(userId),
                    date: date
                }
            },
            update: {
                goals: JSON.stringify(goals),
                progress
            },
            create: {
                userId: String(userId),
                date,
                goals: JSON.stringify(goals),
                progress
            }
        });
        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save history' });
    }
});

// --- Comment Routes ---

app.get('/api/comments', async (req, res) => {
    try {
        const comments = await prisma.comment.findMany({
            include: { author: true },
            orderBy: { createdAt: 'desc' }
        });
        // Map to frontend format
        const formatted = comments.map(c => ({
            id: c.id,
            authorId: c.authorId,
            authorName: c.author.nickname,
            text: c.text,
            type: c.type,
            timestamp: c.createdAt.toISOString().split('T')[0] // YYYY-MM-DD
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

app.post('/api/comments', async (req, res) => {
    const { authorId, text, type } = req.body;
    try {
        const comment = await prisma.comment.create({
            data: {
                authorId: String(authorId),
                text,
                type
            },
            include: { author: true }
        });
        res.json({
            id: comment.id,
            authorId: comment.authorId,
            authorName: comment.author.nickname,
            text: comment.text,
            type: comment.type,
            timestamp: comment.createdAt.toISOString().split('T')[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
