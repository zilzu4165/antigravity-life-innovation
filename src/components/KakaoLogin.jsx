import React from 'react';
import { MessageCircle, LogOut } from 'lucide-react';

export default function KakaoLogin({ user, onLogin, onLogout }) {
    return (
        <div className="kakao-login-wrapper">
            {user ? (
                <div className="user-profile-badge">
                    <img src={user.profile_image?.replace('http:', 'https:')} alt={user.nickname} className="profile-avatar" />
                    <span className="profile-name">{user.nickname}</span>
                    <button onClick={onLogout} className="logout-btn" title="로그아웃">
                        <LogOut size={16} />
                    </button>
                </div>
            ) : (
                <button onClick={onLogin} className="kakao-login-btn">
                    <MessageCircle size={18} fill="currentColor" />
                    <span>카카오 로그인</span>
                </button>
            )}
        </div>
    );
}
