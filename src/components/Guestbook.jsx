import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Lock } from 'lucide-react';

export default function Guestbook({ comments, onAddComment, currentUserId, isReadOnly }) {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() || isReadOnly) return;
        onAddComment(text, 'general'); // Default type
        setText('');
    };

    return (
        <section className="guestbook-section glass-panel" style={{ marginTop: '24px' }}>
            <h2><MessageSquare size={18} /> 방명록</h2>

            {!isReadOnly ? (
                <form onSubmit={handleSubmit} className="guestbook-form">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="멤버들에게 한마디 남겨주세요!"
                            className="guestbook-input"
                        />
                        <button type="submit" className="send-btn">
                            <Send size={16} />
                        </button>
                    </div>
                </form>
            ) : (
                <div className="read-only-notice">
                    <Lock size={16} />
                    <span>로그인하면 방명록을 작성할 수 있습니다</span>
                </div>
            )}

            <ul className="comment-list">
                <AnimatePresence>
                    {comments.map((comment) => (
                        <motion.li
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`comment-item ${comment.type}`}
                            layout
                        >
                            <div className="comment-header">
                                <span className="comment-author">{comment.authorName}</span>
                                <span className="comment-time">{comment.timestamp}</span>
                            </div>
                            <p className="comment-text">{comment.text}</p>
                        </motion.li>
                    ))}
                </AnimatePresence>
                {comments.length === 0 && (
                    <p className="text-muted text-center py-4">아직 작성된 글이 없습니다. 첫 번째 메시지를 남겨보세요!</p>
                )}
            </ul>
        </section>
    );
}
