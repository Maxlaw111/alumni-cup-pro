import { useState, useEffect } from "react";
import { Sparkles, Medal, AlertCircle, Loader2, Crown, Trophy, Target, Crosshair } from "lucide-react";
import { TEAM_LIST, MATCH_SCHEDULE } from "../../constants/data";
import { CONFIG } from "../../constants/config";
import { db } from "../../lib/firebase";
import { ref, push, onValue, get, query, orderByChild, equalTo } from "firebase/database";
import { useLiveMatches } from "../../hooks/useLiveMatches";
import { getMatchResult, resolveTeamName } from "../../lib/teamResolver";
import clsx from "clsx";

export function PredictView() {
    const teams = TEAM_LIST.map(t => t.name);
    const liveData = useLiveMatches();

    const [realName, setRealName] = useState("");
    const [guesses, setGuesses] = useState({});
    
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [predictions, setPredictions] = useState([]);
    const [selectedPrediction, setSelectedPrediction] = useState(null);

    useEffect(() => {
        // Switch to new root for isolated schema
        const predictionsRef = ref(db, 'predictions_v2');
        const unsubscribe = onValue(predictionsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                // Filter out broken schemas safely
                setPredictions(list.filter(p => p.guesses && p.realName));
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
    const hasAnyMatchStarted = Object.keys(liveData).length > 0;
    
    let scoredPredictions = predictions.map(p => {
        let score = 0;
        let hits = 0;
        let totalFinished = 0;
        
        for (let i = 1; i <= 15; i++) {
            const matchData = liveData[i];
            if (matchData && matchData.isFinished) {
                totalFinished++;
                const result = getMatchResult(i, liveData);
                const trueWinner = resolveTeamName(result.winner, liveData);
                
                if (p.guesses[i] === trueWinner) {
                    hits++;
                    score += (i >= 12 ? 2 : 1);
                }
            }
        }
        
        return { ...p, score, hits, totalFinished };
    });

    // Dynamic sorting: score descending, then earliest timestamp
    scoredPredictions.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timestamp - b.timestamp; 
    });

    const maxScore = scoredPredictions.length > 0 ? scoredPredictions[0].score : -1;
    // ----------------------------

    const handleGuessChange = (matchId, value) => {
        setGuesses(prev => ({ ...prev, [matchId]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!realName.trim()) {
            setError("請輸入真實姓名！");
            return;
        }
        
        for (let i = 1; i <= 15; i++) {
            if (!guesses[i]) {
                const type = i <= 9 ? "預賽" : "淘汰賽";
                setError(`您還有賽事尚未預測！(未填寫: M${i} ${type})`);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const trimmedName = realName.trim();
            
            // 資料庫前置查詢 (Pre-check)
            const nameQuery = query(ref(db, 'predictions_v2'), orderByChild('realName'), equalTo(trimmedName));
            const snapshot = await get(nameQuery);
            if (snapshot.exists()) {
                setError(`🚨 哎呀！『${trimmedName}』已經送出過預測囉！每人限參加一次，買定離手！`);
                setIsSubmitting(false);
                return;
            }

            await push(ref(db, 'predictions_v2'), {
                realName: trimmedName,
                guesses,
                timestamp: Date.now()
            });
            setSuccess(true);
            setRealName("");
            setGuesses({});
            setTimeout(() => setSuccess(false), 4000);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            console.error(err);
            setError("提交失敗，請稍後再試！");
        } finally {
            setIsSubmitting(false);
        }
    };

    const groupMatches = MATCH_SCHEDULE.filter(m => m.id >= 1 && m.id <= 9);
    const playoffMatches = MATCH_SCHEDULE.filter(m => m.id >= 10 && m.id <= 15);

    return (
        <div className="pb-24 pt-4 px-4 min-h-screen bg-gray-50">
            {isTournamentFinished && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-5 mb-6 shadow-[0_0_20px_rgba(250,204,21,0.3)] relative overflow-hidden transition-all duration-700">
                    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300/10 via-yellow-200/50 to-yellow-300/10 animate-pulse"></div>
                    <h2 className="text-xl font-black text-amber-600 flex items-center justify-center gap-2 relative z-10">
                        <Trophy size={28} className="text-yellow-500 animate-bounce" />
                        比賽已全數完結！
                    </h2>
                </div>
            )}

            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white text-center shadow-lg mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Target size={80} />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm">
                        <Sparkles size={32} className="text-yellow-300" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2 tracking-wide">大預言家</h1>
                    <p className="text-purple-100 text-sm leading-relaxed max-w-xs mx-auto">挑戰全場 15 場賽事勝負盲狙預測！預賽猜中得 1 分，四強與決賽命中得 2 分！</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 mb-8 relative">
                {hasAnyMatchStarted && (
                    <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center">
                         <div className="bg-gray-900/90 text-white px-6 py-4 rounded-xl shadow-2xl font-bold backdrop-blur-md flex flex-col items-center gap-2">
                            <AlertCircle size={32} className="text-amber-400 mb-1" />
                            首場賽事已鳴哨開打
                            <span className="text-sm font-normal text-gray-300 border-t border-gray-700 pt-2 mt-1">本預測系統已關閉填寫</span>
                         </div>
                    </div>
                )}
                
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                    <Crown size={20} className="text-purple-600" />
                    <h2 className="text-lg font-bold text-gray-800">競猜表單</h2>
                </div>
                
                {error && (
                    <div className="m-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="m-4 p-4 bg-green-50 text-green-700 text-sm font-bold rounded-lg flex flex-col items-center gap-2 border border-green-200">
                        <Trophy size={32} className="text-green-500 mb-1" />
                        太準了！您已成功繳交終極預測名單！
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-4 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">真實姓名 <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={realName}
                            onChange={(e) => setRealName(e.target.value)}
                            placeholder="請填寫您的全名以利賽後對獎"
                            className="w-full border-gray-300 rounded-lg shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] px-4 py-3 border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 focus:bg-white transition-colors outline-none font-medium"
                        />
                    </div>

                    <div className="border border-green-100 bg-green-50/30 rounded-xl overflow-hidden">
                        <div className="bg-green-100/50 px-4 py-2 border-b border-green-100">
                            <h3 className="font-bold text-green-800 text-sm flex items-center gap-2">
                                🏐 小組預賽區 (M1~M9)
                                <span className="bg-green-200 text-green-700 text-[10px] px-2 py-0.5 rounded-full">每場 1 分</span>
                            </h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {groupMatches.map(match => (
                                <div key={match.id} className="bg-white p-3 rounded-lg border border-green-50 shadow-sm flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span className="font-bold text-indigo-500 bg-indigo-50 px-2 rounded">M{match.id}</span>
                                        <span>{match.type}</span>
                                    </div>
                                    <select 
                                        value={guesses[match.id] || ""} 
                                        onChange={(e) => handleGuessChange(match.id, e.target.value)}
                                        className="w-full border-gray-200 rounded-md px-3 py-2 border focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-gray-50 focus:bg-white outline-none appearance-none text-sm font-medium text-gray-800"
                                    >
                                        <option value="">-- 請預測勝隊 --</option>
                                        <option value={match.teamA}>{match.teamA}</option>
                                        <option value={match.teamB}>{match.teamB}</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border border-amber-100 bg-amber-50/30 rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-100/80 to-orange-100/80 px-4 py-2 border-b border-amber-200">
                            <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                                🎯 盲狙淘汰區 (M10~M15)
                                <span className="bg-amber-200 text-amber-800 text-[10px] px-2 py-0.5 rounded-full shadow-sm">高賠率區</span>
                            </h3>
                            <p className="text-[10px] text-amber-800 mt-1 opacity-80">請從全部隊伍中，盲狙誰會活著進入這場賽事並拿下勝利！(其中 M12~M15 猜中得 2 分)</p>
                        </div>
                        <div className="p-4 space-y-3">
                            {playoffMatches.map(match => (
                                <div key={match.id} className="bg-white p-3 rounded-lg border border-red-50 shadow-sm flex flex-col gap-2 relative overflow-hidden">
                                    {match.id >= 12 && <div className="absolute top-0 right-0 w-8 h-8 bg-amber-100 rotate-45 transform translate-x-4 -translate-y-4"></div>}
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span className="font-bold text-orange-600 bg-orange-50 px-2 border border-orange-100 rounded">M{match.id}</span>
                                        <span className="font-bold">{match.type} {match.id >= 12 && <span className="text-red-500 ml-1">x2分</span>}</span>
                                    </div>
                                    <select 
                                        value={guesses[match.id] || ""} 
                                        onChange={(e) => handleGuessChange(match.id, e.target.value)}
                                        className="w-full border-gray-200 rounded-md px-3 py-2 border focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-gray-50 focus:bg-white outline-none appearance-none text-sm font-medium text-amber-900"
                                    >
                                        <option value="">-- 請盲狙這場勝利的隊伍 --</option>
                                        {teams.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={clsx(
                            "w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all mt-6",
                            isSubmitting ? "bg-purple-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] animate-pulse hover:animate-none"
                        )}
                    >
                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Crosshair size={22} />}
                        {isSubmitting ? "上傳預測卡中..." : "確認並送出終極預測"}
                    </button>
                </form>
            </div>

            <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Medal size={20} className="text-indigo-600" />
                    即時預言家排名
                </h2>
                
                {scoredPredictions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                        目前還沒有預言家現身，趕快搶得頭香吧！
                    </div>
                ) : (
                    <div className="space-y-4 pt-2">
                        {scoredPredictions.map((p, index) => {
                            const isFirstPlace = p.score === maxScore && maxScore > 0;
                            const rankNum = index + 1;

                            return (
                                <div key={p.id} 
                                    onClick={() => {
                                        if (CONFIG.isPredictionsPublic) {
                                            setSelectedPrediction(p);
                                        } else {
                                            alert("賽事管理員尚未開放查看他人預測明細喔！🤫");
                                        }
                                    }}
                                    className={clsx(
                                    "bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between relative group transition-all duration-500 overflow-hidden",
                                    CONFIG.isPredictionsPublic ? "cursor-pointer hover:shadow-md" : "",
                                    isFirstPlace ? "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)] scale-[1.02] bg-gradient-to-br from-[#FFFBDF] to-white z-10" : "border-gray-100",
                                    (!isFirstPlace && maxScore > 0) ? "opacity-90" : ""
                                )}>
                                    <div className={clsx(
                                        "absolute top-0 left-0 w-1.5 h-full transition-all duration-300",
                                        isFirstPlace ? "bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-600" : "bg-gradient-to-b from-purple-400 to-indigo-500"
                                    )}></div>
                                    
                                    <div className="flex items-center gap-3 pl-2">
                                        <span className={clsx(
                                            "font-black text-2xl w-6 text-center select-none",
                                            isFirstPlace ? "text-yellow-500 drop-shadow-sm" : rankNum <= 3 ? "text-gray-400" : "text-gray-200 text-xl"
                                        )}>
                                            {rankNum}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className={clsx("font-bold flex items-center gap-1.5 text-lg", isFirstPlace ? "text-amber-900" : "text-gray-800")}>
                                                {p.realName}
                                                {isFirstPlace && <Crown size={18} className="text-yellow-500 animate-bounce ml-1 flex-shrink-0" />}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(p.timestamp).toLocaleDateString()} {new Date(p.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 送出
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1.5 pr-1">
                                        <span className={clsx("text-lg font-black rounded-lg border px-3 py-1 flex items-center gap-1", 
                                            isFirstPlace ? "bg-yellow-100 text-yellow-800 border-yellow-300 shadow-[0_0_5px_rgba(250,204,21,0.5)]" : 
                                            p.score > 0 ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-gray-50 text-gray-400 border-gray-100"
                                        )}>
                                            {isFirstPlace ? "🔥" : "✨"} {p.score} 分
                                        </span>
                                        {p.totalFinished > 0 && (
                                            <span className="text-[11px] text-gray-500 font-bold whitespace-nowrap">
                                                命中: {p.hits} / {p.totalFinished} 場 (進度: {Math.round((p.totalFinished / 15) * 100)}%)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="mt-8 text-center text-gray-400 text-sm font-medium pb-4">
                    大會自動結算系統 v2.0
                </div>
            </div>

            {selectedPrediction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPrediction(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Sparkles size={18} />
                                {selectedPrediction.realName} 的預測明細
                            </h3>
                            <button onClick={() => setSelectedPrediction(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors leading-none pb-1.5 focus:outline-none">
                                ✕
                            </button>
                        </div>
                        <div className="p-4 max-h-[70vh] overflow-y-auto space-y-3">
                            {MATCH_SCHEDULE.map(match => {
                                const predictedTeam = selectedPrediction.guesses[match.id];
                                const matchData = liveData[match.id];
                                const isFinished = matchData?.isFinished;
                                let resultIcon = null;
                                
                                if (isFinished) {
                                    const result = getMatchResult(match.id, liveData);
                                    const trueWinner = resolveTeamName(result.winner, liveData);
                                    if (predictedTeam === trueWinner) {
                                        resultIcon = <span className="text-green-600 font-bold ml-2">✓ 命中</span>;
                                    } else {
                                        resultIcon = <span className="text-red-500 font-bold ml-2">✗ 失敗 (勝:{trueWinner || "未宣判"})</span>;
                                    }
                                }

                                return (
                                    <div key={match.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-gray-50 flex-col sm:flex-row gap-2">
                                        <div className="flex flex-col w-full sm:w-auto">
                                            <span className="text-xs text-gray-500 font-bold">M{match.id} {match.type}</span>
                                            <span className="text-sm font-medium text-gray-800 break-words">{match.teamA} <span className="text-gray-400 font-normal px-1">vs</span> {match.teamB}</span>
                                        </div>
                                        <div className="flex flex-col items-start sm:items-end w-full sm:w-auto bg-white sm:bg-transparent p-2 sm:p-0 rounded border sm:border-0 border-gray-200">
                                            <span className="text-sm font-bold text-purple-700">{predictedTeam || "未預測"}</span>
                                            {resultIcon && <span className="text-xs mt-1">{resultIcon}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
