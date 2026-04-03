import { GROUPS, MATCH_SCHEDULE } from "../constants/data";
import { useLiveMatches } from "../hooks/useLiveMatches";
import { clsx } from "clsx";

export function Leaderboard() {
    const liveData = useLiveMatches();

    const calculateStandings = (groupTeams, groupName) => {
        // Initialize stats maps
        const stats = {};
        groupTeams.forEach(team => {
            stats[team] = {
                name: team,
                matchWins: 0,
                matchLosses: 0,
                setsWon: 0,
                setsLost: 0,
                pointsWon: 0,
                pointsLost: 0,
                matchesPlayed: 0
            };
        });

        // Filter group matches
        const groupMatches = MATCH_SCHEDULE.filter(m => m.type.includes(groupName));

        groupMatches.forEach(match => {
            const mData = liveData[match.id];
            if (!mData) return; // Match hasn't started or no data

            const tA = match.teamA;
            const tB = match.teamB;

            // Only process teams that belong to this group (safety check)
            if (!stats[tA] || !stats[tB]) return;

            // Compute sets and matches
            const setA = mData.setA || 0;
            const setB = mData.setB || 0;

            if (mData.isFinished) {
                stats[tA].matchesPlayed += 1;
                stats[tB].matchesPlayed += 1;
                
                if (setA > setB) {
                    stats[tA].matchWins += 1;
                    stats[tB].matchLosses += 1;
                } else if (setB > setA) {
                    stats[tB].matchWins += 1;
                    stats[tA].matchLosses += 1;
                }
            } else if (setA > 0 || setB > 0 || (mData.sets && mData.sets.some(s => s.scoreA > 0 || s.scoreB > 0))) {
                 // Match is in progress
                 stats[tA].matchesPlayed += 1;
                 stats[tB].matchesPlayed += 1;
            }

            stats[tA].setsWon += setA;
            stats[tA].setsLost += setB;
            stats[tB].setsWon += setB;
            stats[tB].setsLost += setA;

            // Compute points if sets array exists
            if (mData.sets) {
                mData.sets.forEach(set => {
                    stats[tA].pointsWon += (set.scoreA || 0);
                    stats[tA].pointsLost += (set.scoreB || 0);
                    stats[tB].pointsWon += (set.scoreB || 0);
                    stats[tB].pointsLost += (set.scoreA || 0);
                });
            }
        });

        // Convert dict to array and Sort based on rules:
        // 1. matchWins (descending)
        // 2. sets difference (setsWon - setsLost)
        // 3. points difference (pointsWon - pointsLost)
        const standings = Object.values(stats);
        standings.sort((a, b) => {
            if (b.matchWins !== a.matchWins) return b.matchWins - a.matchWins;
            
            const aSetDiff = a.setsWon - a.setsLost;
            const bSetDiff = b.setsWon - b.setsLost;
            if (aSetDiff !== bSetDiff) return bSetDiff - aSetDiff;

            const aPointDiff = a.pointsWon - a.pointsLost;
            const bPointDiff = b.pointsWon - b.pointsLost;
            return bPointDiff - aPointDiff;
        });

        return standings;
    };

    const groupAStandings = calculateStandings(GROUPS.A, "A組");
    const groupBStandings = calculateStandings(GROUPS.B, "B組");

    const renderTable = (groupTitle, standings) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 font-bold text-gray-700">
                📊 {groupTitle} 積分排行榜
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                    <thead className="bg-gray-50/50 text-gray-500 text-xs border-b border-gray-100">
                        <tr>
                            <th className="py-2 pl-4 text-left w-6">#</th>
                            <th className="py-2 text-left">隊伍</th>
                            <th className="py-2 w-12" title="勝場數">勝</th>
                            <th className="py-2 w-12" title="敗場數">敗</th>
                            <th className="py-2 w-16" title="得失局差">局差</th>
                            <th className="py-2 pr-4 w-16" title="得失分差">分差</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {standings.map((team, idx) => (
                            <tr key={team.name} className={clsx("hover:bg-gray-50 transition-colors", idx < 3 ? "bg-indigo-50/30" : "")}>
                                <td className="py-3 pl-4 text-left font-mono font-bold text-gray-400">
                                    {idx + 1}
                                </td>
                                <td className="py-3 text-left font-bold text-gray-800">
                                    {team.name}
                                    {idx < 3 && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium">晉級區</span>}
                                </td>
                                <td className="py-3 font-bold text-indigo-600">{team.matchWins}</td>
                                <td className="py-3 text-gray-500">{team.matchLosses}</td>
                                <td className="py-3">
                                    <span className={clsx((team.setsWon - team.setsLost) > 0 ? "text-green-600" : (team.setsWon - team.setsLost) < 0 ? "text-red-500" : "text-gray-500")}>
                                        {(team.setsWon - team.setsLost) > 0 ? '+' : ''}{team.setsWon - team.setsLost}
                                    </span>
                                </td>
                                <td className="py-3 pr-4 font-mono text-xs text-gray-500">
                                    <span className={clsx((team.pointsWon - team.pointsLost) > 0 ? "text-green-600" : (team.pointsWon - team.pointsLost) < 0 ? "text-red-500" : "text-gray-500")}>
                                        {(team.pointsWon - team.pointsLost) > 0 ? '+' : ''}{team.pointsWon - team.pointsLost}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="bg-gray-50 px-4 py-2 text-[10px] text-gray-400 border-t border-gray-100 flex justify-between">
                <span>排序：勝場 &gt; 得失局差 &gt; 得失分差</span>
                <span>兩組皆取前 3 名晉級</span>
            </div>
        </div>
    );

    return (
        <div>
            {renderTable("A組 (預賽循環)", groupAStandings)}
            {renderTable("B組 (預賽循環)", groupBStandings)}
        </div>
    );
}
