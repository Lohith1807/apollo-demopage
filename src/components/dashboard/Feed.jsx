import React, { useState, useEffect, useCallback } from 'react';
import {
    Heart, MessageCircle, Share2, MoreHorizontal,
    Send, Image as ImageIcon, Calendar, User,
    Plus, X, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPosts, createPost, likePost, commentPost } from '../../services/api';

const PostCard = ({ post, onLike, onComment }) => {
    const { user } = useAuth();
    const [comment, setComment] = useState('');
    const [showComments, setShowComments] = useState(false);
    const isLiked = post.likes.includes(user?.email);

    const handleComment = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        onComment(post._id, comment);
        setComment('');
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 hover:shadow-md transition-all">
            {/* Header */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100">
                        <img src={post.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`} alt="Author" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{post.author}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-xl transition-all">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-4">
                <h3 className="text-lg font-black text-slate-800 mb-3 leading-tight">{post.title}</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Post Image */}
            {post.image && (
                <div className="px-6 pb-6">
                    <div className="rounded-[2rem] overflow-hidden border border-slate-100 aspect-video bg-slate-50">
                        <img
                            src={post.image.startsWith('http') ? post.image : `http://localhost:5000${post.image}`}
                            alt="Post content"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}

            {/* Interaction Bar */}
            <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => onLike(post._id)}
                        className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${isLiked ? 'text-apollo-red' : 'text-slate-400 hover:text-apollo-red'}`}
                    >
                        <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                        <span>{post.likes.length} Likes</span>
                    </button>
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-2 text-slate-400 hover:text-blue-500 text-xs font-black uppercase tracking-widest transition-all"
                    >
                        <MessageCircle size={18} />
                        <span>{post.comments.length} Comments</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-emerald-500 text-xs font-black uppercase tracking-widest transition-all">
                        <Share2 size={18} />
                        <span>Share</span>
                    </button>
                </div>
                <div className="flex -space-x-2">
                    {post.likes.slice(0, 3).map((l, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${l}`} alt="User" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="bg-slate-50 p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="space-y-4">
                        {post.comments.map((c, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-8 h-8 rounded-xl bg-white shrink-0 overflow-hidden shadow-sm">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author}`} alt="Author" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{c.author}</span>
                                        </div>
                                        <p className="text-xs font-medium text-slate-600 leading-relaxed">{c.content}</p>
                                    </div>
                                    <div className="flex gap-4 mt-1 px-2">
                                        <button className="text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-apollo-red">Like</button>
                                        <button className="text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-500">Reply</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* New Comment Input */}
                    <form onSubmit={handleComment} className="flex gap-4 pt-2">
                        <div className="w-8 h-8 rounded-xl bg-white shadow-sm shrink-0 overflow-hidden hidden sm:block">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="Me" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Raise a doubt or question..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full pl-4 pr-12 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-apollo-red outline-none shadow-sm"
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-apollo-red hover:scale-110 transition-transform">
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default function Feed() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', image: '' });

    const fetchPosts = useCallback(async () => {
        try {
            const { data } = await getPosts(user?.school?._id);
            setPosts(data.data || []);
        } catch (err) {
            console.error("Failed to fetch posts:", err);
        } finally {
            setLoading(false);
        }
    }, [user?.school?._id]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', newPost.title);
            formData.append('content', newPost.content);
            formData.append('email', user.email);
            if (newPost.imageFile) {
                formData.append('image', newPost.imageFile);
            }

            await createPost(formData);
            setNewPost({ title: '', content: '', imageFile: null });
            setShowCreate(false);
            fetchPosts();
        } catch (err) {
            console.error("Create post error:", err);
        }
    };

    const handleLike = async (postId) => {
        try {
            await likePost(postId, user.email);
            fetchPosts();
        } catch (err) {
            console.error("Like error:", err);
        }
    };

    const handleComment = async (postId, content) => {
        try {
            await commentPost(postId, { content, email: user.email });
            fetchPosts();
        } catch (err) {
            console.error("Comment error:", err);
        }
    };

    const isStaff = ['admin', 'teacher'].includes(user?.role);

    return (
        <div className="max-w-3xl mx-auto py-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">University Feed</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Live Updates & Discussions</p>
                </div>
                {isStaff && (
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="px-6 py-2.5 bg-apollo-red text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} /> Create Update
                    </button>
                )}
            </div>

            {/* Create Post Form */}
            {showCreate && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl mb-12 animate-in slide-in-from-top-8 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-apollo-red"></div>
                    <form onSubmit={handleCreatePost} className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Post Title</label>
                            <input
                                type="text"
                                placeholder="E.g. Upcoming Faculty Guest Lecture"
                                required
                                value={newPost.title}
                                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-apollo-red outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Content</label>
                            <textarea
                                placeholder="Share the details with the university community..."
                                required
                                rows="4"
                                value={newPost.content}
                                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-apollo-red outline-none transition-all resize-none"
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Upload Image (Optional)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setNewPost({ ...newPost, imageFile: e.target.files[0] })}
                                        className="w-full px-4 py-2 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-apollo-red file:text-white hover:file:bg-red-600 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex items-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] px-4 py-3 bg-apollo-red text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                >
                                    <Send size={16} /> Publish Post
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="space-y-8 opacity-50">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white h-64 rounded-[2.5rem] animate-pulse"></div>
                    ))}
                </div>
            ) : posts.length > 0 ? (
                <div className="space-y-4">
                    {posts.map(post => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onLike={handleLike}
                            onComment={handleComment}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-200 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300 mb-6">
                        <MessageSquare size={40} />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">No updates found</h3>
                    <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-wide">Be the first to share an update with the campus!</p>
                </div>
            )}
        </div>
    );
}
