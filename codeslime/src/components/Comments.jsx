import React, { useState } from 'react';
import '../styles/Comments.css';

const Comment = ({ comment, onReplySubmit, depth = 0, addReplyToParent }) => {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [replies, setReplies] = useState(comment.replies || []);

    const handleReplyToggle = () => {
        setShowReplyBox(!showReplyBox);
    };

    const submitReply = async () => {
        const newReply = await onReplySubmit(comment.id, replyContent);
        setReplies([...replies, newReply]);
        setReplyContent('');
        addReplyToParent(comment.id, newReply);
        //setShowReplyBox(false);
    };

    return (
        <div className={`comment ${depth > 0 ? 'reply' : ''}`} style={{ marginLeft: `${depth * 20}px` }}>
            <p>{comment.content}</p>
            <button onClick={handleReplyToggle}>{showReplyBox ? 'Cancel' : 'Reply'}</button>
            {showReplyBox && (
                <div className="reply-box">
                    <textarea 
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                    />
                    <button onClick={submitReply}>Submit Reply</button>
                </div>
            )}
            {replies.map((reply) => (
                <Comment key={reply.id} comment={reply} onReplySubmit={onReplySubmit} depth={depth + 1} addReplyToParent={addReplyToParent}/>
            ))}
        </div>
    );
};

const Comments = ({ comments, onReplySubmit }) => {
    const addReplyToParent = (parentId, reply) => {
        // Update the comments state to include the new reply
        const updatedComments = comments.map(comment => {
            if (comment.id === parentId) {
                return { ...comment, replies: [...comment.replies, reply] };
            }
            return comment;
        });
    };

    return (
        <div className="comments-list">
            {comments.map((comment) => (
                <Comment key={comment.id} comment={comment} onReplySubmit={onReplySubmit} addReplyToParent={addReplyToParent} />
            ))}
        </div>
    );
};

export default Comments;
