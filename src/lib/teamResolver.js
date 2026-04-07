import { GROUPS, MATCH_SCHEDULE } from "../constants/data";

export const getStandings = (groupName, liveData) => {
    const groupTeams = groupName === "A組" ? GROUPS.A : GROUPS.B;
    const stats = {};
    groupTeams.forEach(team => {
        stats[team] = { name: team, matchWins: 0, setsWon: 0, setsLost: 0, pointsWon: 0, pointsLost: 0 };
    });

    const groupMatches = MATCH_SCHEDULE.filter(m => m.type.includes(groupName));
    groupMatches.forEach(match => {
        const mData = liveData[match.id];
        if (!mData) return;
        const tA = match.teamA; const tB = match.teamB;
        if (!stats[tA] || !stats[tB]) return;

        const setA = mData.setA || 0; const setB = mData.setB || 0;
        if (mData.isFinished) {
            if (setA > setB) stats[tA].matchWins++;
            else if (setB > setA) stats[tB].matchWins++;
        }
        stats[tA].setsWon += setA; stats[tA].setsLost += setB;
        stats[tB].setsWon += setB; stats[tB].setsLost += setA;

        if (mData.sets) {
            mData.sets.forEach(s => {
                stats[tA].pointsWon += (s.scoreA || 0); stats[tA].pointsLost += (s.scoreB || 0);
                stats[tB].pointsWon += (s.scoreB || 0); stats[tB].pointsLost += (s.scoreA || 0);
            });
        }
    });

    return Object.values(stats).sort((a, b) => {
        if (b.matchWins !== a.matchWins) return b.matchWins - a.matchWins;
        const aSet = a.setsWon - a.setsLost; const bSet = b.setsWon - b.setsLost;
        if (aSet !== bSet) return bSet - aSet;
        return (b.pointsWon - b.pointsLost) - (a.pointsWon - a.pointsLost);
    });
};

export const getMatchResult = (matchId, liveData) => {
    const data = liveData[matchId];
    const match = MATCH_SCHEDULE.find(m => m.id === matchId);
    if (!data || !match) return { winner: null, loser: null, isFinished: false };
    
    let winner = null; let loser = null;
    if (data.isFinished) {
        if (data.setA > data.setB) { winner = match.teamA; loser = match.teamB; }
        else { winner = match.teamB; loser = match.teamA; }
    }
    return { winner, loser, isFinished: data.isFinished, setA: data.setA || 0, setB: data.setB || 0, isLive: data.isLive || false };
};

export const resolveTeamName = (name, liveData) => {
    if (!name) return name;
    if (name.includes("A組第一")) return getStandings("A組", liveData)[0]?.name || name;
    if (name.includes("A組第二")) return getStandings("A組", liveData)[1]?.name || name;
    if (name.includes("A組第三")) return getStandings("A組", liveData)[2]?.name || name;
    if (name.includes("B組第一")) return getStandings("B組", liveData)[0]?.name || name;
    if (name.includes("B組第二")) return getStandings("B組", liveData)[1]?.name || name;
    if (name.includes("B組第三")) return getStandings("B組", liveData)[2]?.name || name;
    
    let target = name;
    if (name.includes("第10場勝隊")) target = getMatchResult(10, liveData).winner || name;
    else if (name.includes("第11場勝隊")) target = getMatchResult(11, liveData).winner || name;
    else if (name.includes("第12場勝隊")) target = getMatchResult(12, liveData).winner || name;
    else if (name.includes("第13場勝隊")) target = getMatchResult(13, liveData).winner || name;
    else if (name.includes("第10場敗隊")) target = getMatchResult(10, liveData).loser || name;
    else if (name.includes("第11場敗隊")) target = getMatchResult(11, liveData).loser || name;
    else if (name.includes("第12場敗隊")) target = getMatchResult(12, liveData).loser || name;
    else if (name.includes("第13場敗隊")) target = getMatchResult(13, liveData).loser || name;
    
    // Prevent infinite loops and recursively resolve placeholders
    if (target !== name && target) return resolveTeamName(target, liveData); 
    return target;
};

export const formatTeamNameUI = (name, liveData) => {
    if (!name) return "未定";
    const resolved = resolveTeamName(name, liveData);
    if (!resolved || resolved === name) return name;
    
    // If it's resolved and original was a placeholder
    const isPlaceholder = name.includes("隊") || name.includes("組");
    if (isPlaceholder) {
        return `${name} (${resolved})`;
    }
    return resolved;
};
