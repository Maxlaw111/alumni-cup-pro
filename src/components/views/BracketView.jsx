import { MATCH_SCHEDULE } from "../../constants/data";
import { useLiveMatches } from "../../hooks/useLiveMatches";
import { clsx } from "clsx";

export function BracketView() {
    const liveData = useLiveMatches();

    const getMatchResult = (matchId) => {
        const data = liveData[matchId];
        const match = MATCH_SCHEDULE.find(m => m.id === matchId);
        if (!data || !match) return { winner: null, loser: null, isFinished: false, isLive: false, setA: 0, setB: 0 };
        
        let winner = null;
        let loser = null;
        if (data.isFinished) {
            if (data.setA > data.setB) {
                winner = match.teamA;
                loser = match.teamB;
            } else {
                winner = match.teamB;
                loser = match.teamA;
            }
        }
        return { winner, loser, isFinished: data.isFinished, isLive: data.isLive, setA: data.setA || 0, setB: data.setB || 0 };
    };

    const resolveTeamName = (originalName) => {
        if (originalName.includes("第10場勝隊")) return getMatchResult(10).winner || originalName;
        if (originalName.includes("第11場勝隊")) return getMatchResult(11).winner || originalName;
        if (originalName.includes("第10場敗隊")) return getMatchResult(10).loser || originalName;
        if (originalName.includes("第11場敗隊")) return getMatchResult(11).loser || originalName;
        if (originalName.includes("第12場勝隊")) return getMatchResult(12).winner || originalName;
        if (originalName.includes("第13場勝隊")) return getMatchResult(13).winner || originalName;
        if (originalName.includes("第12場敗隊")) return getMatchResult(12).loser || originalName;
        if (originalName.includes("第13場敗隊")) return getMatchResult(13).loser || originalName;
        return originalName;
    };

    const BracketCard = ({ matchId, title, highlight = "default" }) => {
        const match = MATCH_SCHEDULE.find(m => m.id === matchId);
        if (!match) return null;

        const result = getMatchResult(matchId);
        const resolvedTeamA = resolveTeamName(match.teamA);
        const resolvedTeamB = resolveTeamName(match.teamB);

        const isTeamAWinner = result.winner === match.teamA;
        const isTeamBWinner = result.winner === match.teamB;

        return (
            <div className={clsx(
                "relative flex flex-col bg-white border-2 rounded-xl shadow-lg w-44 md:w-56 overflow-hidden transition-all duration-300 transform hover:-translate-y-1 z-10",
                highlight === "gold" ? "border-amber-400 ring-2 ring-amber-200 shadow-amber-200/50" : 
                highlight === "bronze" ? "border-amber-700 ring-1 ring-amber-600 shadow-amber-900/20" : 
                result.isLive ? "border-red-400 shadow-red-200" :
                result.isFinished ? "border-indigo-200 opacity-90" : "border-gray-100"
            )}>
                {/* Header elements like ID and Title */}
                <div className={clsx(
                    "text-center text-xs font-bold py-1.5",
                    highlight === "gold" ? "bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 text-amber-900" :
                    highlight === "bronze" ? "bg-gradient-to-r from-amber-700 via-yellow-700 to-amber-800 text-amber-50" :
                    "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                )}>
                    {title || `Match ${match.id}`} {result.isLive && "🔴 LIVE"}
                </div>
                
                {/* Team A */}
                <div className={clsx(
                    "flex justify-between items-center px-3 py-2 border-b border-gray-100",
                    isTeamAWinner && "bg-indigo-50 font-bold",
                    result.isFinished && !isTeamAWinner && "opacity-50 line-through text-gray-400"
                )}>
                    <span className="truncate text-sm mr-2">{resolvedTeamA}</span>
                    <span className={clsx("font-mono font-bold text-lg", isTeamAWinner ? "text-indigo-600" : "text-gray-400")}>{result.setA}</span>
                </div>

                {/* Team B */}
                <div className={clsx(
                    "flex justify-between items-center px-3 py-2",
                    isTeamBWinner && "bg-indigo-50 font-bold",
                    result.isFinished && !isTeamBWinner && "opacity-50 line-through text-gray-400"
                )}>
                    <span className="truncate text-sm mr-2">{resolvedTeamB}</span>
                    <span className={clsx("font-mono font-bold text-lg", isTeamBWinner ? "text-indigo-600" : "text-gray-400")}>{result.setB}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="pb-24 pt-6 px-4 overflow-x-auto bg-gray-50/50 min-h-screen">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 sticky left-0 text-gray-800">
                🏆 六強晉級圖
            </h2>

            <div className="min-w-[900px] flex justify-center py-8 relative px-12">
                
                {/* Connecting Lines (Absolute behind everything) */}
                <div className="absolute inset-0 pointer-events-none opacity-30 hidden md:block">
                    {/* Left side connectors */}
                    <div className="absolute top-[80px] left-[200px] w-[60px] h-[170px] border-b-2 border-r-2 border-indigo-400 rounded-br-lg"></div>
                    <div className="absolute top-[250px] left-[260px] w-[50px] h-[30px] border-b-2 border-indigo-400"></div>
                    
                    {/* Right side connectors */}
                    <div className="absolute top-[80px] right-[200px] w-[60px] h-[170px] border-b-2 border-l-2 border-purple-400 rounded-bl-lg"></div>
                    <div className="absolute top-[250px] right-[260px] w-[50px] h-[30px] border-b-2 border-purple-400"></div>
                </div>

                {/* --- Bracket Layout Columns --- */}
                
                {/* 1. Left Quarterfinal */}
                <div className="flex flex-col justify-end space-y-8 pr-8 pb-32">
                    <BracketCard matchId={10} title="M10 (首輪)" />
                </div>

                {/* 2. Left Semifinal */}
                <div className="flex flex-col justify-around space-y-32 pr-8 relative">
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-indigo-400 mb-2">A組 第一名 種子保留</span>
                        <div className="h-16 w-32 border-2 border-dashed border-indigo-200 rounded-lg flex items-center justify-center text-sm font-bold text-indigo-300 bg-white shadow-sm mb-4">
                            等待四強賽
                        </div>
                    </div>
                    <BracketCard matchId={12} title="M12 (四強準決賽)" />
                </div>

                {/* 3. Center Finals (14 & 15) */}
                <div className="flex flex-col justify-center space-y-12 px-4 shadow-2xl bg-white/60 p-8 rounded-3xl border border-white backdrop-blur-sm z-20">
                    <BracketCard matchId={14} title="👑 冠亞軍 👑" highlight="gold" />
                    <BracketCard matchId={15} title="🏅 季殿軍 🏅" highlight="bronze" />
                </div>

                {/* 4. Right Semifinal */}
                <div className="flex flex-col justify-around space-y-32 pl-8 relative">
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-purple-400 mb-2">B組 第一名 種子保留</span>
                        <div className="h-16 w-32 border-2 border-dashed border-purple-200 rounded-lg flex items-center justify-center text-sm font-bold text-purple-300 bg-white shadow-sm mb-4">
                            等待四強賽
                        </div>
                    </div>
                    <BracketCard matchId={13} title="M13 (四強準決賽)" />
                </div>

                {/* 5. Right Quarterfinal */}
                <div className="flex flex-col justify-end space-y-8 pl-8 pb-32">
                    <BracketCard matchId={11} title="M11 (首輪)" />
                </div>

            </div>

            <div className="mt-8 text-center text-gray-400 text-sm italic font-medium">
                * 當後台裁判輸入比分並結束比賽後，晉級圖的隊伍名稱將自動刷新
            </div>
        </div>
    );
}
