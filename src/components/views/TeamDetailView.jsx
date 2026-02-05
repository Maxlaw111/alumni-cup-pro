import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TEAM_LIST } from "../../constants/data";
import { db } from "../../lib/firebase";
import { ref, onValue, set, push } from "firebase/database";
import { ArrowLeft, User, MessageSquare, Edit3, Send } from "lucide-react";

export function TeamDetailView() {
    const { teamName } = useParams();
    const navigate = useNavigate();
    const decodedName = decodeURIComponent(teamName || "");
    const team = TEAM_LIST.find((t) => t.name === decodedName);

    const [intro, setIntro] = useState("");
    const [isEditingIntro, setIsEditingIntro] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        if (!team) return;

        // Load Intro
        const introRef = ref(db, `v1_intro/${team.name}`);
        const unsubscribeIntro = onValue(introRef, (snapshot) => {
            setIntro(snapshot.val() || "目前尚無歷史介紹...");
        });

        // Load Comments
        const commentsRef = ref(db, `v1_comments/${team.name}`);
        const unsubscribeComments = onValue(commentsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.values(data).reverse(); // Newest first
                setComments(list);
            } else {
                setComments([]);
            }
        });

        return () => {
            unsubscribeIntro();
            unsubscribeComments();
        };
    }, [team]);

    const handleSaveIntro = () => {
        if (!team) return;
        set(ref(db, `v1_intro/${team.name}`), intro).then(() => {
            setIsEditingIntro(false);
        });
    };

    const handlePostComment = () => {
        if (!team || !newComment.trim()) return;
        push(ref(db, `v1_comments/${team.name}`), {
            text: newComment,
            time: new Date().toLocaleString(),
        }).then(() => {
            setNewComment("");
        });
    };

    if (!team) {
        return <div className="p-8 text-center">找不到球隊資料</div>;
    }

    return (
        <div className="pb-24 pt-6 px-4">
            {/* Header */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 mb-4 hover:text-gray-900"
            >
                <ArrowLeft size={20} className="mr-1" /> 返回
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h1 className="text-2xl font-bold text-primary mb-2">{team.name}</h1>
                <p className="text-sm text-gray-500 mb-4">
                    <span className="font-bold">教練：</span> {team.coach || "無"}
                </p>

                <div className="mb-6">
                    <h3 className="font-bold mb-2 flex items-center gap-2">
                        <User size={18} /> 球員名單
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {team.members.length > 0 ? (
                            team.members.map(m => (
                                <span key={m} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                                    {m}
                                </span>
                            ))
                        ) : (
                            <span className="text-red-500 bg-red-50 px-2 py-1 rounded text-sm">資料缺失，待校友補充</span>
                        )}
                    </div>
                </div>

                <hr className="my-6 border-gray-100" />

                {/* Intro Section */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-800">當年隊伍介紹</h3>
                        <button
                            onClick={() => setIsEditingIntro(!isEditingIntro)}
                            className="text-gray-400 hover:text-primary"
                        >
                            <Edit3 size={16} />
                        </button>
                    </div>

                    {isEditingIntro ? (
                        <div className="space-y-2">
                            <textarea
                                value={intro}
                                onChange={(e) => setIntro(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm h-32 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                                onClick={handleSaveIntro}
                                className="w-full bg-primary text-white py-2 rounded-lg font-bold"
                            >
                                更新介紹
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-600 italic whitespace-pre-wrap text-sm leading-relaxed">
                            {intro}
                        </p>
                    )}
                </div>
            </div>

            {/* Comments Section */}
            <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-700">
                    <MessageSquare size={18} /> 校友留言回憶
                </h3>

                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="寫下當年的回憶..."
                        className="flex-1 p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary"
                    />
                    <button
                        onClick={handlePostComment}
                        disabled={!newComment.trim()}
                        className="bg-gray-800 text-white p-3 rounded-lg disabled:opacity-50"
                    >
                        <Send size={20} />
                    </button>
                </div>

                <div className="space-y-3">
                    {comments.map((c, i) => (
                        <div key={i} className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-primary">
                            <div className="text-xs text-gray-400 mb-1">{c.time}</div>
                            <div className="text-gray-800">{c.text}</div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <div className="text-center text-gray-400 py-4">尚無留言</div>
                    )}
                </div>
            </div>
        </div>
    );
}
