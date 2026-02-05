import { MATCH_SCHEDULE } from "../../constants/data";
import { MatchCard } from "../MatchCard";

export function ScheduleView() {
    return (
        <div className="pb-24 pt-6 px-4">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                📅 完整賽程表
            </h2>
            <div className="space-y-4">
                {MATCH_SCHEDULE.map(match => (
                    <MatchCard key={match.id} match={match} />
                ))}
            </div>
        </div>
    );
}
