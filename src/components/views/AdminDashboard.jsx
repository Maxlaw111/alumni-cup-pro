import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MATCH_SCHEDULE } from "../../constants/data";
import { db } from "../../lib/firebase";
import { ref, update, set, onValue, remove } from "firebase/database";
import { formatTeamNameUI, getMatchResult, resolveTeamName } from "../../lib/teamResolver";
import { clsx } from "clsx";

const DEFAULT_MATCH_STATE = {
    isLive: false,
    isFinished: false,
    currentSet: 1,
    sets: [
        { scoreA: 0, scoreB: 0 },
        { scoreA: 0, scoreB: 0 },
        { scoreA: 0, scoreB: 0 }
    ],
    setA: 0,
    setB: 0
};

export function AdminDashboard() {
    const [searchParams] = useSearchParams();
    const authKey = searchParams.get("auth");
    const [userRole, setUserRole] = useState(null); // 'admin' | 'referee' | null
    const [activeMatchId, setActiveMatchId] = useState(null);
    const [matchData, setMatchData] = useState({});
    const [predictions, setPredictions] = useState([]);

    useEffect(() => {
        const predictionsRef = ref(db, 'predictions_v2');
        return onValue(predictionsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                setPredictions(list.filter(p => p.guesses && p.realName));
            } else {
                setPredictions([]);
            }
        });
    }, []);

    let scoredPredictions = predictions.map(p => {
        let score = 0;
        let hits = 0;
        let totalFinished = 0;
        
        for (let i = 1; i <= 15; i++) {
            const mData = matchData[i];
            if (mData && mData.isFinished) {
                totalFinished++;
                const result = getMatchResult(i, matchData);
                const trueWinner = resolveTeamName(result.winner, matchData);
                
                if (p.guesses[i] === trueWinner) {
                    hits++;
                    score += (i >= 12 ? 2 : 1);
                }
            }
        }
        return { ...p, score, hits, totalFinished };
    });

    scoredPredictions.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timestamp - b.timestamp; 
    });

    const handleDeletePrediction = async (id, name) => {
        if (window.confirm(`確定要刪除 ${name} 的這筆預測紀錄嗎？此動作無法復原。`)) {
            try {
                await remove(ref(db, `predictions_v2/${id}`));
            } catch (e) {
                console.error(e);
                window.alert("刪除失敗");
            }
        }
    };

    useEffect(() => {
        // Simple client-side auth
        if (authKey === "admin2026") {
            setUserRole("admin");
        } else if (authKey === "admin123") {
            setUserRole("referee");
        }
    }, [authKey]);

    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        const settingsRef = ref(db, "settings/global/isPredictionsPublic");
        return onValue(settingsRef, (snapshot) => {
            setIsPublic(snapshot.val() === true);
        });
    }, []);

    useEffect(() => {
        // Listen to all matches to show live status
        const matchesRef = ref(db, "v1_matches");
        return onValue(matchesRef, (snapshot) => {
            setMatchData(snapshot.val() || {});
        });
    }, []);

    const handleScore = (matchId, team, delta) => {
        const currentMatch = matchData[matchId]?.sets ? matchData[matchId] : { ...DEFAULT_MATCH_STATE };
        if (currentMatch.isFinished) return; // Prevent scoring after finish

        const setIdx = currentMatch.currentSet - 1;
        const currentSets = [...currentMatch.sets];
        
        // Ensure the current set object exists
        if (!currentSets[setIdx]) {
            currentSets[setIdx] = { scoreA: 0, scoreB: 0 };
        }

        const field = team === "A" ? "scoreA" : "scoreB";
        const newScore = Math.max(0, currentSets[setIdx][field] + delta);
        currentSets[setIdx][field] = newScore;

        update(ref(db, `v1_matches/${matchId}`), {
            ...currentMatch,
            sets: currentSets,
            isLive: true,
        });
    };

    const handleNextSet = (matchId) => {
        const currentMatch = matchData[matchId] || { ...DEFAULT_MATCH_STATE };
        if (currentMatch.isFinished) return;

        const setIdx = currentMatch.currentSet - 1;
        const setScores = currentMatch.sets[setIdx] || { scoreA: 0, scoreB: 0 };
        
        if (setScores.scoreA === 0 && setScores.scoreB === 0) {
            window.alert("目前比分為 0:0，無法結束該局！");
            return;
        }

        if (!window.confirm(`確定要結束第 ${currentMatch.currentSet} 局嗎？`)) return;

        const winner = setScores.scoreA > setScores.scoreB ? "A" : (setScores.scoreB > setScores.scoreA ? "B" : null);
        if (!winner) {
            window.alert("平手無法結束該局！");
            return;
        }

        const newSetA = currentMatch.setA + (winner === "A" ? 1 : 0);
        const newSetB = currentMatch.setB + (winner === "B" ? 1 : 0);

        let isFinished = false;
        let nextSetNum = currentMatch.currentSet;

        // Check Best of 3 finish
        if (newSetA === 2 || newSetB === 2) {
            isFinished = true;
        } else if (currentMatch.currentSet < 3) {
            nextSetNum++;
        } else {
            // Already set 3 but no one reached 2? Shouldn't happen unless tie, but just in case.
            isFinished = true; 
        }

        update(ref(db, `v1_matches/${matchId}`), {
            ...currentMatch,
            setA: newSetA,
            setB: newSetB,
            currentSet: nextSetNum,
            isFinished: isFinished,
            isLive: !isFinished // Mark not live if finished
        });
        
        if (isFinished) {
            window.alert(`比賽結束！獲勝隊伍為: ${winner === 'A' ? MATCH_SCHEDULE.find(m=>m.id === matchId).teamA : MATCH_SCHEDULE.find(m=>m.id === matchId).teamB}`);
        }
    };

    const handleReset = (matchId) => {
        if (!window.confirm("🔴 警告：這將重置整場比賽所有比分為 0！確定嗎？")) return;
        update(ref(db, `v1_matches/${matchId}`), {
            ...DEFAULT_MATCH_STATE
        });
    };

    const handleResetAll = () => {
        if (window.prompt("這將清除「所有」賽事的即時比分與打球狀態 (包含完賽紀錄)！\n若確定要將系統全新歸零，請輸入小寫 'reset' :") === "reset") {
            set(ref(db, "v1_matches"), {});
            window.alert("已清空所有賽事比分資料，恢復預設狀態！");
        }
    };

    if (!userRole) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm text-center">
                    <h1 className="text-xl font-bold text-red-700 mb-4">⛔️ 裁判與管理專用區域</h1>
                    <p className="text-gray-600 mb-4">請使用正確的連結或密碼進入管理後台</p>
                    <input
                        type="password"
                        placeholder="輸入管理密碼"
                        className="w-full p-2 border border-gray-300 rounded mb-2 text-gray-800"
                        onChange={(e) => {
                            if (e.target.value === "admin2026") setUserRole("admin");
                            else if (e.target.value === "admin123") setUserRole("referee");
                            else setUserRole(null);
                        }}
                    />
                </div>
            </div>
        );
    }

    const activeMatch = activeMatchId ? MATCH_SCHEDULE.find(m => m.id === activeMatchId) : null;
    const currentData = activeMatchId ? (matchData[activeMatchId]?.sets ? matchData[activeMatchId] : DEFAULT_MATCH_STATE) : DEFAULT_MATCH_STATE;
    const currentSetIndex = currentData.currentSet - 1;
    const activeScores = currentData.sets[currentSetIndex] || { scoreA: 0, scoreB: 0 };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
            <h1 className="text-xl font-bold mb-8 text-center">🏐 管理後台</h1>

            <h2 className="text-lg font-bold mb-4 text-gray-300">裁判即時計分台</h2>

            {!activeMatchId ? (
                <div className="space-y-3 pb-8 mb-4 border-b border-gray-800">
                    <button 
                        onClick={handleResetAll}
                        className="w-full bg-red-700 hover:bg-red-600 border border-red-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg mb-6 flex justify-center items-center gap-2 transform transition active:scale-95"
                    >
                        🚨 一鍵重置所有比賽數據 (Reset All Matches)
                    </button>
                    <p className="text-gray-400 text-sm mb-2">點擊場次開始計分：</p>
                    {MATCH_SCHEDULE.map(match => {
                        const mData = matchData[match.id];
                        const isFinished = mData?.isFinished;
                        const isLive = mData?.isLive;
                        return (
                            <div
                                key={match.id}
                                onClick={() => setActiveMatchId(match.id)}
                                className={clsx(
                                    "p-4 rounded-lg cursor-pointer border relative overflow-hidden",
                                    isLive && "bg-red-900/30 border-red-500",
                                    isFinished && "bg-green-900/20 border-green-700/50 opacity-80",
                                    !isLive && !isFinished && "bg-gray-800 border-gray-700 hover:bg-gray-700"
                                )}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-mono text-gray-400 text-xs">
                                        {match.time} | {match.court} | {match.type}
                                    </span>
                                    {isLive && <span className="text-red-400 text-xs font-bold animate-pulse">● LIVE</span>}
                                    {isFinished && <span className="text-green-500 text-xs font-bold">✓ 已結束</span>}
                                </div>
                                <div className="font-bold text-lg flex justify-between">
                                    <span>{formatTeamNameUI(match.teamA, matchData)}</span>
                                    <span>vs</span>
                                    <span>{formatTeamNameUI(match.teamB, matchData)}</span>
                                </div>
                                {mData?.sets && (
                                    <div className="mt-2 text-xs text-gray-500 flex justify-center gap-3">
                                        {mData.sets.map((set, idx) => {
                                            if (set.scoreA === 0 && set.scoreB === 0 && idx >= mData.currentSet) return null;
                                            return <span key={idx} className={idx === mData.currentSet - 1 && !isFinished ? "text-yellow-500 font-bold" : ""}>
                                                局{idx+1}: {set.scoreA}-{set.scoreB}
                                            </span>;
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="h-full flex flex-col mb-12">
                    <button
                        onClick={() => setActiveMatchId(null)}
                        className="mb-4 text-gray-400 text-sm flex items-center gap-1 hover:text-white"
                    >
                        ← 返回賽程列表
                    </button>

                    <div className="bg-gray-800 rounded-xl p-4 mb-4 text-center">
                        <div className="flex justify-center gap-2 text-xs mb-2">
                            <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded">{activeMatch.court}</span>
                            <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded">{activeMatch.type}</span>
                        </div>
                        <div className="font-bold text-lg">{formatTeamNameUI(activeMatch.teamA, matchData)} vs {formatTeamNameUI(activeMatch.teamB, matchData)}</div>
                        
                        <div className="mt-3 flex justify-center items-center gap-4">
                            <div className="text-blue-400 font-bold text-xl">{currentData.setA} 勝</div>
                            <div className="text-yellow-500 font-mono text-sm bg-gray-900 px-3 py-1 rounded-full">
                                {currentData.isFinished ? "比賽已結束" : `第 ${currentData.currentSet} 局`}
                            </div>
                            <div className="text-red-400 font-bold text-xl">{currentData.setB} 勝</div>
                        </div>
                    </div>

                    {/* Main Scoring Area */}
                    <div className="grid grid-cols-2 gap-4 flex-1 mb-6">
                        {/* Team A */}
                        <div className={clsx("rounded-xl p-2 flex flex-col items-center border transition-all", 
                            currentData.isFinished ? "bg-gray-800/50 border-gray-700" : "bg-blue-900/20 border-blue-500/30")}>
                            <div className="text-blue-300 font-bold mb-2 truncate w-full text-center text-sm">{formatTeamNameUI(activeMatch.teamA, matchData)}</div>
                            <div className="text-6xl font-mono font-bold mb-4">{activeScores.scoreA}</div>
                            {!currentData.isFinished && (
                                <>
                                    <button
                                        onClick={() => handleScore(activeMatch.id, "A", 1)}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-8 rounded-lg text-3xl shadow-lg active:scale-95 transition-transform mb-2"
                                    >
                                        +1
                                    </button>
                                    <button
                                        onClick={() => handleScore(activeMatch.id, "A", -1)}
                                        className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 rounded text-lg"
                                    >
                                        -1
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Team B */}
                        <div className={clsx("rounded-xl p-2 flex flex-col items-center border transition-all", 
                            currentData.isFinished ? "bg-gray-800/50 border-gray-700" : "bg-red-900/20 border-red-500/30")}>
                            <div className="text-red-300 font-bold mb-2 truncate w-full text-center text-sm">{formatTeamNameUI(activeMatch.teamB, matchData)}</div>
                            <div className="text-6xl font-mono font-bold mb-4">{activeScores.scoreB}</div>
                            {!currentData.isFinished && (
                                <>
                                    <button
                                        onClick={() => handleScore(activeMatch.id, "B", 1)}
                                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-8 rounded-lg text-3xl shadow-lg active:scale-95 transition-transform mb-2"
                                    >
                                        +1
                                    </button>
                                    <button
                                        onClick={() => handleScore(activeMatch.id, "B", -1)}
                                        className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 rounded text-lg"
                                    >
                                        -1
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {!currentData.isFinished && (
                            <button
                                onClick={() => handleNextSet(activeMatch.id)}
                                className="col-span-1 bg-yellow-600 hover:bg-yellow-500 text-white py-4 rounded-lg font-bold text-lg shadow-md"
                            >
                                結束此局 / 確認勝方
                            </button>
                        )}
                        <button
                            onClick={() => handleReset(activeMatch.id)}
                            className={clsx(
                                "col-span-1 text-red-400 py-4 rounded-lg font-bold border border-red-500/30",
                                currentData.isFinished ? "col-span-2 bg-gray-800 hover:bg-gray-700" : "bg-gray-700 hover:bg-gray-600"
                            )}>
                            重置比賽比數
                        </button>
                    </div>
                </div>
            )}

            {userRole === "admin" && (
                <>
                    <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl mb-8 flex flex-col gap-3 shadow-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-200">英雄榜預測明細功能</span>
                            <button 
                                onClick={() => set(ref(db, "settings/global/isPredictionsPublic"), !isPublic)}
                                className={clsx(
                                    "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800",
                                    isPublic ? "bg-indigo-500" : "bg-gray-600"
                                )}
                            >
                                <span className={clsx("inline-block h-5 w-5 transform rounded-full bg-white transition-transform", isPublic ? "translate-x-6" : "translate-x-1")} />
                            </button>
                        </div>
                        <div className={clsx("text-sm px-3 py-2 rounded flex items-center justify-center font-bold", isPublic ? "bg-indigo-900/50 text-indigo-300 border border-indigo-700/50" : "bg-gray-700 text-gray-400")}>
                            目前狀態：{isPublic ? "已解鎖 (公開)" : "已鎖定 (隱藏)"}
                        </div>
                    </div>

                    <h2 className="text-lg font-bold mb-4 text-gray-300">預測紀錄管理 (共 {scoredPredictions.length} 筆)</h2>
                    <div className="space-y-3 mb-8">
                        {scoredPredictions.map((p, index) => (
                            <div key={p.id} className="bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-700 flex items-center justify-between relative group">
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-xl w-6 text-center text-gray-400">{index + 1}</span>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-200 text-lg">
                                            {p.realName}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(p.timestamp).toLocaleString()} 送出
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-sm font-black rounded-lg border border-indigo-700 bg-indigo-900/40 text-indigo-300 px-2 py-1 flex items-center gap-1">
                                            ✨ {p.score} 分
                                        </span>
                                        {p.totalFinished > 0 && (
                                            <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">
                                                命中: {p.hits} / {p.totalFinished} 場 
                                            </span>
                                        )}
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleDeletePrediction(p.id, p.realName)}
                                        className="bg-red-900/50 hover:bg-red-600 text-red-300 hover:text-white border border-red-700/50 px-3 py-2 rounded-lg flex items-center gap-1 transition-all active:scale-95 text-sm"
                                        title="刪除"
                                    >
                                        🗑️ 刪除
                                    </button>
                                </div>
                            </div>
                        ))}
                        {scoredPredictions.length === 0 && <div className="text-gray-500 text-sm">目前沒有預測紀錄</div>}
                    </div>
                </>
            )}
        </div>
    );
}
