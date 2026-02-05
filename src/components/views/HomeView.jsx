import { MATCH_SCHEDULE } from "../../constants/data";
import { MatchCard } from "../MatchCard";
import { useLiveMatches } from "../../hooks/useLiveMatches";

export function HomeView() {
    const liveData = useLiveMatches();

    // Merge static schedule with live data
    const mergedSchedule = MATCH_SCHEDULE.map(match => {
        const live = liveData[match.id];
        if (live) {
            return { ...match, ...live };
        }
        return match;
    });

    const liveMatches = mergedSchedule.filter(m => m.isLive);
    const upcomingMatches = mergedSchedule.filter(m => !m.isLive);

    return (
        <div className="pb-24">
            {/* Hero Section */}
            <div className="bg-primary text-white p-6 pt-12 rounded-b-[2rem] shadow-lg mb-6">
                <h1 className="text-3xl font-bold mb-2">第一屆校友盃</h1>
                <p className="opacity-90 text-sm">2025/5/17 @ 嚮網休閒運動旗艦館</p>
            </div>

            <div className="px-4">
                {liveMatches.length > 0 && (
                    <>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 animate-pulse text-red-600">
                            🔴 即時賽況
                        </h2>
                        {liveMatches.map(match => (
                            <MatchCard key={match.id} match={match} isLive={true} />
                        ))}
                    </>
                )}

                <h2 className="text-xl font-bold mb-4 mt-8 text-gray-800">
                    賽程列表
                </h2>
                {upcomingMatches.length > 0 ? (
                    upcomingMatches.map(match => (
                        <MatchCard key={match.id} match={match} />
                    ))
                ) : (
                    <p className="text-gray-500 text-center py-8">所有賽事皆已進行中</p>
                )}
            </div>
        </div>
    );
}
