import { clsx } from 'clsx';
import { cn } from '../lib/utils';

/**
 * @param {Object} props
 * @param {Object} props.match
 * @param {boolean} props.isLive
 */
export function MatchCard({ match, isLive = false }) {
    const scoreA = match.scoreA || 0;
    const scoreB = match.scoreB || 0;

    return (
        <div className={cn(
            "bg-white rounded-xl shadow-sm border overflow-hidden mb-4 transition-all",
            isLive ? "border-red-500 shadow-md ring-1 ring-red-100" : "border-gray-100"
        )}>
            {/* Header */}
            <div className="bg-gray-50 px-4 py-2 flex justify-between items-center text-xs text-gray-500 border-b border-gray-100">
                <span className="font-medium flex items-center gap-1">
                    {isLive && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />}
                    {isLive ? 'LIVE' : match.time}
                </span>
                <span>裁判: {match.referee}</span>
            </div>

            {/* Teams area */}
            <div className="p-4">
                {/* Team A */}
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                            A
                        </div>
                        <span className={cn("font-bold text-lg", scoreA > scoreB ? "text-gray-900" : "text-gray-600")}>
                            {match.teamA}
                        </span>
                        {match.setA > 0 && (
                            <span className="ml-2 bg-yellow-400 text-white text-[10px] px-1.5 rounded font-bold">
                                W{match.setA}
                            </span>
                        )}
                    </div>
                    <span className={cn("text-3xl font-mono font-bold transition-all", scoreA > scoreB ? "text-primary scale-110" : "text-gray-300")}>
                        {scoreA}
                    </span>
                </div>

                {/* Team B */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                            B
                        </div>
                        <span className={cn("font-bold text-lg", scoreB > scoreA ? "text-gray-900" : "text-gray-600")}>
                            {match.teamB}
                        </span>
                        {match.setB > 0 && (
                            <span className="ml-2 bg-yellow-400 text-white text-[10px] px-1.5 rounded font-bold">
                                W{match.setB}
                            </span>
                        )}
                    </div>
                    <span className={cn("text-3xl font-mono font-bold transition-all", scoreB > scoreA ? "text-primary scale-110" : "text-gray-300")}>
                        {scoreB}
                    </span>
                </div>
            </div>

            {/* Footer / Status */}
            {isLive && (
                <div className="px-4 py-2 bg-red-50 text-red-700 text-xs font-bold text-center flex justify-between">
                    <span>進行中 • 第 {match.currentSet || 1} 局</span>
                    <span>總局數: {match.setA || 0} - {match.setB || 0}</span>
                </div>
            )}
        </div>
    );
}
