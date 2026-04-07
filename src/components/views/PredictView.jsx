import { useState, useEffect } from "react";
import { Sparkles, Medal, AlertCircle, Loader2, Crown, Trophy } from "lucide-react";
import { TEAM_LIST, MATCH_SCHEDULE, GROUPS } from "../../constants/data";
import { db } from "../../lib/firebase";
import { ref, push, onValue } from "firebase/database";
import { useLiveMatches } from "../../hooks/useLiveMatches";
import { getMatchResult, resolveTeamName } from "../../lib/teamResolver";
import clsx from "clsx";

export function PredictView() {
    const teams = TEAM_LIST.map(t => t.name);
    const liveData = useLiveMatches();

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
                }));
                setPredictions(list);
            } else {
                setPredictions([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // ---- Auto-Settlement Logic ----
    const m14Data = liveData[14];
    const m15Data = liveData[15];
    const isTournamentFinished = m14Data?.isFinished && m15Data?.isFinished;
    
    let realFirst = null;
    let realSecond = null;
    let realThird = null;

    if (isTournamentFinished) {
        const m14Result = getMatchResult(14, liveData);
        const m15Result = getMatchResult(15, liveData);
        realFirst = resolveTeamName(m14Result.winner, liveData);
        realSecond = resolveTeamName(m14Result.loser, liveData);
        realThird = resolveTeamName(m15Result.winner, liveData);
    }

    let scoredPredictions = predictions.map(p => {
        let score = null;
        if (isTournamentFinished) {
            score = 0;
            if (p.first === realFirst) score++;
            if (p.second === realSecond) score++;
            if (p.third === realThird) score++;
        }
        return { ...p, score };
    });

    // Sort predictions: if tournament finished, highest score first, then earliest timestamp
    // If not finished, just sort by earliest timestamp
    scoredPredictions.sort((a, b) => {
        if (isTournamentFinished && b.score !== a.score) return b.score - a.score;
        return b.timestamp - a.timestamp; // Latest first when not finished
    });

    const maxScore = isTournamentFinished && scoredPredictions.length > 0 ? scoredPredictions[0].score : -1;
    // ----------------------------

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
            {isTournamentFinished && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-5 mb-6 shadow-[0_0_20px_rgba(250,204,21,0.3)] relative overflow-hidden transition-all duration-700">
                    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300/10 via-yellow-200/50 to-yellow-300/10 animate-pulse"></div>
                    <h2 className="text-xl font-black text-amber-600 flex items-center justify-center gap-2 mb-3 relative z-10">
                        <Trophy size={28} className="text-yellow-500 animate-bounce" />
                        🏆 最終結算：大預言家揭曉！
                    </h2>
                    <div className="bg-white/90 rounded-xl p-4 flex flex-col items-center justify-center text-sm font-bold gap-2 backdrop-blur-md border border-yellow-200 relative z-10">
                        <div className="text-gray-500 mb-1 text-xs">本次賽事最終真實名次</div>
                        <span className="text-yellow-600 font-bold text-lg">🥇 冠軍: {realFirst}</span>
                        <span className="text-gray-600 font-bold text-lg">🥈 亞軍: {realSecond}</span>
                        <span className="text-orange-700 font-bold text-lg">🥉 季軍: {realThird}</span>
                    </div>
                </div>
            )}

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

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100 mb-8 relative">
                {isTournamentFinished && (
                    <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center">
                         <div className="bg-gray-900/80 text-white px-6 py-3 rounded-lg shadow-xl font-bold backdrop-blur-md flex items-center gap-2">
                            比賽已結算，本屆預測已截止
                         </div>
                    </div>
                )}
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
                
                {scoredPredictions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                        目前還沒有預言家現身，趕快搶得頭香吧！
                    </div>
                ) : (
                    <div className="space-y-4 pt-2">
                        {scoredPredictions.map((p) => {
                            const isWinner = isTournamentFinished && p.score === maxScore && maxScore > 0;
                            const isMissed = isTournamentFinished && !isWinner;

                            return (
                                <div key={p.id} className={clsx(
                                    "bg-white p-4 rounded-xl shadow-sm border flex flex-col gap-2 relative group transition-all duration-500",
                                    isWinner ? "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)] scale-[1.02] bg-gradient-to-br from-[#FFFBDF] to-white z-10" : "border-gray-100 overflow-hidden",
                                    isMissed ? "opacity-60 grayscale-[0.2] scale-[0.98]" : ""
                                )}>
                                    <div className={clsx(
                                        "absolute top-0 left-0 w-1.5 h-full transition-all duration-300",
                                        isWinner ? "bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-600" : "bg-gradient-to-b from-purple-400 to-indigo-500"
                                    )}></div>
                                    
                                    <div className="flex justify-between items-start pl-1">
                                        <span className={clsx("font-bold flex items-center gap-1.5", isWinner ? "text-amber-900" : "text-gray-800")}>
                                            <div className={clsx(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm",
                                                isWinner ? "bg-yellow-200 text-yellow-800 border border-yellow-300" : "bg-purple-100 text-purple-700"
                                            )}>
                                                {p.nickname.charAt(0)}
                                            </div>
                                            {p.nickname}
                                            {isWinner && <Crown size={16} className="text-yellow-500 animate-bounce ml-1 flex-shrink-0" />}
                                        </span>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className="text-xs text-gray-400">
                                                {new Date(p.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                            {isTournamentFinished && (
                                                <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-md border", 
                                                    p.score === 3 ? "bg-yellow-100 text-yellow-800 border-yellow-300 shadow-[0_0_5px_rgba(250,204,21,0.5)]" : 
                                                    p.score > 0 ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-500 border-gray-200"
                                                )}>
                                                    得分: {p.score}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-sm mt-1 pl-1">
                                        <span className={clsx("px-2 py-0.5 rounded border flex items-center gap-1", 
                                            isTournamentFinished && p.first === realFirst ? "bg-green-100 border-green-300 text-green-800 font-bold" : "bg-yellow-50 text-yellow-800 border-yellow-100"
                                        )}>
                                            🥇 {p.first} {isTournamentFinished && p.first === realFirst && "✓"}
                                        </span>
                                        <span className={clsx("px-2 py-0.5 rounded border flex items-center gap-1", 
                                            isTournamentFinished && p.second === realSecond ? "bg-green-100 border-green-300 text-green-800 font-bold" : "bg-gray-50 text-gray-700 border-gray-200"
                                        )}>
                                            🥈 {p.second} {isTournamentFinished && p.second === realSecond && "✓"}
                                        </span>
                                        <span className={clsx("px-2 py-0.5 rounded border flex items-center gap-1", 
                                            isTournamentFinished && p.third === realThird ? "bg-green-100 border-green-300 text-green-800 font-bold" : "bg-orange-50 text-amber-800 border-orange-100"
                                        )}>
                                            🥉 {p.third} {isTournamentFinished && p.third === realThird && "✓"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
