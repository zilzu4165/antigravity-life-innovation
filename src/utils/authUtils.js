const REST_API_KEY = '013a25d7f086459d98a90ad9cc6d4c00';
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/';

export const getKakaoAuthUrl = () => {
    return `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=profile_nickname,profile_image`;
};

export const getKakaoToken = async (code) => {
    const data = new URLSearchParams();
    data.append('grant_type', 'authorization_code');
    data.append('client_id', REST_API_KEY);
    data.append('redirect_uri', REDIRECT_URI);
    data.append('code', code);

    const response = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        body: data,
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error('Token exchange failed:', errorData);
        throw new Error('Failed to get token');
    }

    return await response.json();
};

export const getKakaoUserInfo = async (accessToken) => {
    const response = await fetch('https://kapi.kakao.com/v2/user/me', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error('User info fetch failed:', errorData);
        throw new Error('Failed to get user info');
    }

    return await response.json();
};

export const logoutKakao = async (accessToken) => {
    // For REST API, we can just clear local state, 
    // or call the logout endpoint if we want to invalidate the token.
    // For simplicity in this client-side only app, we'll just return true.
    // If we wanted to really logout from Kakao:
    /*
    await fetch('https://kapi.kakao.com/v1/user/logout', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    */
    return true;
};
