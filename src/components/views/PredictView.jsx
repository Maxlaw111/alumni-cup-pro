import { useState, useEffect } from "react";
import { Sparkles, Medal, AlertCircle, Loader2, Crown } from "lucide-react";
import { TEAM_LIST } from "../../constants/data";
import { db } from "../../lib/firebase";
import { ref, push, onValue } from "firebase/database";
import clsx from "clsx";

export function PredictView() {
    const teams = TEAM_LIST.map(t => t.name);
    const [nickname, setNickname] = useState("");
    const [first, setFirst] = useState("");
    const [second, setSecond] = useState("");
    const [third, setThird] = useState("");
    
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [predictions, setPredictions] = useState([]);

    useEffect(() => {
        const predictionsRef = ref(db, 'predictions');
        const unsubscribe = onValue(predictionsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                })).sort((a, b) => b.timestamp - a.timestamp);
                setPredictions(list);
            } else {
                setPredictions([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!nickname.trim()) {
            setError("請輸入預測者暱稱！");
            return;
        }
        if (!first || !second || !third) {
            setError("請完整選擇冠、亞、季軍的隊伍！");
            return;
        }
        if (first === second || second === third || first === third) {
            setError("冠、亞、季軍不能選擇同一支隊伍！");
            return;
        }

        setIsSubmitting(true);
        try {
            await push(ref(db, 'predictions'), {
                nickname: nickname.trim(),
                first,
                second,
                third,
                timestamp: Date.now()
            });
            setSuccess(true);
            setNickname("");
            setFirst("");
            setSecond("");
            setThird("");
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            setError("提交失敗，請稍後再試！");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pb-24 pt-4 px-4 min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white text-center shadow-lg mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Sparkles size={64} />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm">
                        <Sparkles size={32} className="text-yellow-300" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">大預言家</h1>
                    <p className="text-purple-100 text-sm">精準預測本次賽事冠亞季軍，成為全場最閃耀的預言家！</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100 mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Crown size={20} className="text-purple-600" />
                    我要預測
                </h2>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2 border border-green-100">
                        <Sparkles size={16} />
                        送出成功！您已成為真正的預言家！
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">您的暱稱</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="請輸入響亮的名號"
                            className="w-full border-gray-300 rounded-lg shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] px-4 py-2.5 border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 focus:bg-white transition-colors outline-none"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <span className="text-yellow-500">🥇</span> 預測冠軍
                        </label>
                        <select 
                            value={first} onChange={(e) => setFirst(e.target.value)}
                            className="w-full border-gray-300 rounded-lg shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] px-4 py-2.5 border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 focus:bg-white outline-none appearance-none"
                        >
                            <option value="">請選擇隊伍</option>
                            {teams.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <span className="text-gray-400">🥈</span> 預測亞軍
                        </label>
                        <select 
                            value={second} onChange={(e) => setSecond(e.target.value)}
                            className="w-full border-gray-300 rounded-lg shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] px-4 py-2.5 border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 focus:bg-white outline-none appearance-none"
                        >
                            <option value="">請選擇隊伍</option>
                            {teams.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <span className="text-amber-600">🥉</span> 預測季軍
                        </label>
                        <select 
                            value={third} onChange={(e) => setThird(e.target.value)}
                            className="w-full border-gray-300 rounded-lg shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] px-4 py-2.5 border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 focus:bg-white outline-none appearance-none"
                        >
                            <option value="">請選擇隊伍</option>
                            {teams.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={clsx(
                            "w-full py-3.5 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all mt-6",
                            isSubmitting ? "bg-purple-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98]"
                        )}
                    >
                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                        {isSubmitting ? "送出預測中..." : "送出神準預測"}
                    </button>
                </form>
            </div>

            <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Medal size={20} className="text-indigo-600" />
                    預言家榜單
                </h2>
                
                {predictions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                        目前還沒有預言家現身，趕快搶得頭香吧！
                    </div>
                ) : (
                    <div className="space-y-3">
                        {predictions.map((p) => (
                            <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-indigo-500"></div>
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-gray-800 flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs">
                                            {p.nickname.charAt(0)}
                                        </div>
                                        {p.nickname}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(p.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-sm mt-1">
                                    <span className="bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded border border-yellow-100">🥇 {p.first}</span>
                                    <span className="bg-gray-50 text-gray-700 px-2 py-0.5 rounded border border-gray-200">🥈 {p.second}</span>
                                    <span className="bg-orange-50 text-amber-800 px-2 py-0.5 rounded border border-orange-100">🥉 {p.third}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
