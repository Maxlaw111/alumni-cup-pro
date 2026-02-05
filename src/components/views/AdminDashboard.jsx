import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MATCH_SCHEDULE } from "../../constants/data";
import { db } from "../../lib/firebase";
import { ref, update, onValue } from "firebase/database";
import { clsx } from "clsx";

export function AdminDashboard() {
    const [searchParams] = useSearchParams();
    const authKey = searchParams.get("auth");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeMatchId, setActiveMatchId] = useState(null);
    const [matchData, setMatchData] = useState({});

    useEffect(() => {
        // Simple client-side auth
        if (authKey === "admin123") {
            setIsAuthenticated(true);
        }
    }, [authKey]);

    useEffect(() => {
        // Listen to all matches to show live status
        const matchesRef = ref(db, "v1_matches");
        return onValue(matchesRef, (snapshot) => {
            setMatchData(snapshot.val() || {});
        });
    }, []);

    const handleScore = (matchId, team, delta) => {
        const currentMatch = matchData[matchId] || { scoreA: 0, scoreB: 0, setA: 0, setB: 0, currentSet: 1 };
        const field = team === "A" ? "scoreA" : "scoreB";
        const newScore = Math.max(0, (currentMatch[field] || 0) + delta);

        update(ref(db, `v1_matches/${matchId}`), {
            ...currentMatch,
            [field]: newScore,
            isLive: true,
        });
    };

    const handleNextSet = (matchId) => {
        if (!window.confirm("確定要結束這一局並開始下一局嗎？")) return;

        const currentMatch = matchData[matchId] || { scoreA: 0, scoreB: 0, setA: 0, setB: 0, currentSet: 1 };
        const winner = currentMatch.scoreA > currentMatch.scoreB ? "A" : "B";

        update(ref(db, `v1_matches/${matchId}`), {
            ...currentMatch,
            scoreA: 0,
            scoreB: 0,
            setA: (currentMatch.setA || 0) + (winner === "A" ? 1 : 0),
            setB: (currentMatch.setB || 0) + (winner === "B" ? 1 : 0),
            currentSet: (currentMatch.currentSet || 1) + 1,
        });
    };

    const handleReset = (matchId) => {
        if (!window.confirm("🔴 警告：這將重置整場比賽比分！確定嗎？")) return;
        update(ref(db, `v1_matches/${matchId}`), {
            scoreA: 0,
            scoreB: 0,
            setA: 0,
            setB: 0,
            currentSet: 1,
            isLive: false
        });
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm text-center">
                    <h1 className="text-xl font-bold text-red-700 mb-4">⛔️ 裁判專用區域</h1>
                    <p className="text-gray-600 mb-4">請使用正確的連結進入管理後台</p>
                    <input
                        type="password"
                        placeholder="輸入管理密碼"
                        className="w-full p-2 border border-gray-300 rounded mb-2"
                        onChange={(e) => {
                            if (e.target.value === "admin123") setIsAuthenticated(true);
                        }}
                    />
                </div>
            </div>
        );
    }

    const activeMatch = activeMatchId ? MATCH_SCHEDULE.find(m => m.id === activeMatchId) : null;
    const activeScores = activeMatchId ? (matchData[activeMatchId] || { scoreA: 0, scoreB: 0 }) : { scoreA: 0, scoreB: 0 };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
            <h1 className="text-xl font-bold mb-4 text-center">🏐 裁判計分台</h1>

            {!activeMatchId ? (
                <div className="space-y-3">
                    <p className="text-gray-400 text-sm mb-2">點擊場次開始計分：</p>
                    {MATCH_SCHEDULE.map(match => (
                        <div
                            key={match.id}
                            onClick={() => setActiveMatchId(match.id)}
                            className={clsx(
                                "p-4 rounded-lg cursor-pointer border",
                                matchData[match.id]?.isLive
                                    ? "bg-red-900/30 border-red-500"
                                    : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                            )}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-mono text-gray-400">{match.time}</span>
                                {matchData[match.id]?.isLive && <span className="text-red-400 text-xs font-bold animate-pulse">● LIVE</span>}
                            </div>
                            <div className="font-bold text-lg">{match.teamA} vs {match.teamB}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-full flex flex-col">
                    <button
                        onClick={() => setActiveMatchId(null)}
                        className="mb-4 text-gray-400 text-sm flex items-center gap-1"
                    >
                        ← 返回賽程列表
                    </button>

                    <div className="bg-gray-800 rounded-xl p-4 mb-4 text-center">
                        <h2 className="text-gray-400 text-sm mb-1">正在執法</h2>
                        <div className="font-bold text-lg">{activeMatch.teamA} vs {activeMatch.teamB}</div>
                        <div className="mt-2 text-yellow-500 font-mono">第 {matchData[activeMatch.id]?.currentSet || 1} 局</div>
                    </div>

                    {/* Main Scoring Area */}
                    <div className="grid grid-cols-2 gap-4 flex-1 mb-6">
                        {/* Team A */}
                        <div className="bg-blue-900/20 rounded-xl p-2 flex flex-col items-center border border-blue-500/30">
                            <div className="text-blue-300 font-bold mb-2 truncate w-full text-center text-sm">{activeMatch.teamA}</div>
                            <div className="text-6xl font-mono font-bold mb-4">{activeScores.scoreA || 0}</div>
                            <button
                                onClick={() => handleScore(activeMatch.id, "A", 1)}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 rounded-lg text-2xl shadow-lg active:scale-95 transition-transform mb-2"
                            >
                                +1
                            </button>
                            <button
                                onClick={() => handleScore(activeMatch.id, "A", -1)}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded text-sm"
                            >
                                -1
                            </button>
                        </div>

                        {/* Team B */}
                        <div className="bg-red-900/20 rounded-xl p-2 flex flex-col items-center border border-red-500/30">
                            <div className="text-red-300 font-bold mb-2 truncate w-full text-center text-sm">{activeMatch.teamB}</div>
                            <div className="text-6xl font-mono font-bold mb-4">{activeScores.scoreB || 0}</div>
                            <button
                                onClick={() => handleScore(activeMatch.id, "B", 1)}
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-6 rounded-lg text-2xl shadow-lg active:scale-95 transition-transform mb-2"
                            >
                                +1
                            </button>
                            <button
                                onClick={() => handleScore(activeMatch.id, "B", -1)}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded text-sm"
                            >
                                -1
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleNextSet(activeMatch.id)}
                            className="col-span-1 bg-yellow-600 hover:bg-yellow-500 text-white py-3 rounded-lg font-bold"
                        >
                            下一局
                        </button>
                        <button
                            onClick={() => handleReset(activeMatch.id)}
                            className="col-span-1 bg-gray-700 hover:bg-gray-600 text-red-400 py-3 rounded-lg font-bold border border-red-500/30"
                        >
                            重置比賽
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
