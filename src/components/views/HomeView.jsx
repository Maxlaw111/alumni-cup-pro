import { MATCH_SCHEDULE } from "../../constants/data";
import { MatchCard } from "../MatchCard";
import { useLiveMatches } from "../../hooks/useLiveMatches";

import { CONFIG } from "../../constants/config";

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
            <div className="bg-gradient-to-br from-primary via-indigo-600 to-purple-700 text-white p-6 pt-12 rounded-b-[2rem] shadow-xl mb-6 relative overflow-hidden">
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold mb-2 tracking-tight drop-shadow-sm">{CONFIG.SEASON_NAME}</h1>
                    <p className="opacity-90 text-sm font-medium tracking-wide flex items-center gap-1">
                        🗓 {CONFIG.EVENT_DATE} 
                    </p>
                    <p className="opacity-80 text-xs mt-1">
                        📍 {CONFIG.LOCATION}
                    </p>
                </div>
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
