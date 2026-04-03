import { MATCH_SCHEDULE } from "../../constants/data";
import { MatchCard } from "../MatchCard";
import { Leaderboard } from "../Leaderboard";
import { useLiveMatches } from "../../hooks/useLiveMatches";

export function ScheduleView() {
    const liveData = useLiveMatches();

    const mergedSchedule = MATCH_SCHEDULE.map(match => {
        const live = liveData[match.id];
        if (live) return { ...match, ...live };
        return match;
    });

    return (
        <div className="pb-24 pt-6 px-4">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                🏆 預賽分組積分表
            </h2>
            <Leaderboard />

            <h2 className="text-2xl font-bold mt-8 mb-4 flex items-center gap-2 text-gray-800">
                📅 完整賽程與結果
            </h2>
            <div className="space-y-4">
                {mergedSchedule.map(match => (
                    <MatchCard key={match.id} match={match} />
                ))}
            </div>
        </div>
    );
}
