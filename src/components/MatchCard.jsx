import { clsx } from 'clsx';
import { cn } from '../lib/utils';

/**
 * @param {Object} props
 * @param {Object} props.match
 * @param {boolean} props.isLive // Deprecated flag, using dynamic state from live data
 */
export function MatchCard({ match }) {
    // Determine the state from match if injected via useLiveMatches
    const isLive = match.isLive || false;
    const isFinished = match.isFinished || false;
    
    // Support legacy flat scoreA/scoreB or the new `sets` array
    let currentScoreA = match.scoreA || 0;
    let currentScoreB = match.scoreB || 0;
    
    const hasSets = match.sets && Array.isArray(match.sets);
    
    if (hasSets && match.currentSet) {
        const setIdx = Math.min(match.currentSet - 1, match.sets.length - 1);
        currentScoreA = match.sets[setIdx]?.scoreA || 0;
        currentScoreB = match.sets[setIdx]?.scoreB || 0;
    }

    const setA = match.setA || 0;
    const setB = match.setB || 0;

    return (
        <div className={cn(
            "bg-white rounded-xl shadow-sm border overflow-hidden mb-4 transition-all",
            isLive ? "border-red-500 shadow-md ring-1 ring-red-100" : "border-gray-100",
            isFinished && "opacity-75 bg-slate-50 border-gray-200"
        )}>
            {/* Header */}
            <div className="bg-gray-50 px-4 py-2 flex justify-between items-center text-xs text-gray-500 border-b border-gray-100">
                <span className="font-medium flex items-center gap-2">
                    {isLive && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />}
                    {isFinished && <span className="w-2 h-2 rounded-full bg-green-500" />}
                    {match.time}
                    <span className="bg-white border rounded px-1.5 py-0.5 text-[10px]">{match.court}</span>
                    <span className="bg-purple-100 text-purple-700 border border-purple-200 rounded px-1.5 py-0.5 text-[10px]">{match.type}</span>
                </span>
                <span className="truncate max-w-[100px] text-right">裁判: {match.referee}</span>
            </div>

            {/* Teams area */}
            <div className="p-4 relative">
                {/* Team A */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold",
                            setA >= 2 ? "bg-amber-100 text-amber-600 ring-2 ring-amber-400" : "bg-gray-100 text-gray-400"
                        )}>
                            A
                        </div>
                        <div className="flex flex-col">
                            <span className={cn("font-bold text-lg leading-tight", currentScoreA > currentScoreB ? "text-gray-900" : "text-gray-600")}>
                                {match.teamA || '未定'}
                            </span>
                            {setA > 0 && <span className="text-amber-500 text-[10px] font-bold">★ 取得 {setA} 勝</span>}
                        </div>
                    </div>
                    <span className={cn("text-3xl font-mono font-bold transition-all", 
                        currentScoreA > currentScoreB ? "text-primary scale-110" : "text-gray-300",
                        isFinished && "text-gray-400"
                    )}>
                        {currentScoreA}
                    </span>
                </div>

                {/* Team B */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold",
                            setB >= 2 ? "bg-amber-100 text-amber-600 ring-2 ring-amber-400" : "bg-gray-100 text-gray-400"
                        )}>
                            B
                        </div>
                        <div className="flex flex-col">
                            <span className={cn("font-bold text-lg leading-tight", currentScoreB > currentScoreA ? "text-gray-900" : "text-gray-600")}>
                                {match.teamB || '未定'}
                            </span>
                            {setB > 0 && <span className="text-amber-500 text-[10px] font-bold">★ 取得 {setB} 勝</span>}
                        </div>
                    </div>
                    <span className={cn("text-3xl font-mono font-bold transition-all", 
                        currentScoreB > currentScoreA ? "text-primary scale-110" : "text-gray-300",
                        isFinished && "text-gray-400"
                    )}>
                        {currentScoreB}
                    </span>
                </div>
            </div>

            {/* Set Scores History Footer */}
            {hasSets && (isLive || isFinished) && (
                <div className="bg-gray-50 border-t border-gray-100 p-2 flex justify-center gap-4 text-xs text-gray-500 font-mono">
                    {match.sets.map((set, idx) => {
                        if (set.scoreA === 0 && set.scoreB === 0 && idx >= match.currentSet) return null;
                        const isCurrentSet = idx === (match.currentSet - 1) && !isFinished;
                        return (
                            <div key={idx} className={cn(
                                "px-2 py-1 rounded bg-white border", 
                                isCurrentSet ? "border-red-200 text-red-600 font-bold" : "border-gray-200"
                            )}>
                                局{idx+1}: {set.scoreA}-{set.scoreB}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Footer / Status Status Line */}
            {isLive && (
                <div className="px-4 py-1.5 bg-red-50 text-red-700 text-xs font-bold text-center">
                    比賽進行中 • 第 {match.currentSet || 1} 局
                </div>
            )}
            {isFinished && (
                <div className="px-4 py-1.5 bg-green-50 text-green-700 text-xs font-bold text-center">
                    比賽已結束
                </div>
            )}
        </div>
    );
}
