import { MATCH_SCHEDULE } from "../../constants/data";

function BracketMatch({ matchId, title }) {
    const match = MATCH_SCHEDULE.find(m => m.id === matchId) || { teamA: 'TBD', teamB: 'TBD' };

    return (
        <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm p-2 w-32 md:w-40 text-xs">
            <div className="text-gray-400 mb-1 text-[10px] text-center">{title}</div>
            <div className="border-b border-gray-100 py-1 font-bold truncate">{match.teamA}</div>
            <div className="py-1 font-bold truncate">{match.teamB}</div>
        </div>
    );
}

function Connector({ type }) {
    if (type === "vertical") {
        return <div className="w-px h-8 bg-gray-300 mx-auto"></div>
    }
    if (type === "horizontal") {
        return <div className="h-px w-4 bg-gray-300"></div>
    }
    return null;
}

export function BracketView() {
    return (
        <div className="pb-24 pt-6 px-4 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 sticky left-0">
                🏆 晉級圖
            </h2>

            <div className="min-w-[600px] flex justify-center py-8">
                {/* Quarter Finals / Play-ins */}
                <div className="flex flex-col justify-around space-y-8">
                    <BracketMatch matchId={7} title="M7: B2 vs A3" />
                    <BracketMatch matchId={8} title="M8: A2 vs B3" />
                </div>

                {/* Connectors */}
                <div className="flex flex-col justify-around px-2">
                    <div className="h-px w-8 bg-gray-300 mt-8"></div>
                    <div className="h-px w-8 bg-gray-300 mb-8"></div>
                </div>

                {/* Semi Finals (Mock logic for now as data structure is flat) */}
                <div className="flex flex-col justify-around space-y-4">
                    <BracketMatch matchId={9} title="M9: A1 vs M7勝" />
                    <BracketMatch matchId={10} title="M10: B1 vs M8勝" />
                </div>

                {/* Finals */}
                <div className="flex flex-col justify-center px-2">
                    <div className="border-l border-r border-gray-300 h-24 w-4"></div>
                </div>

                <div className="flex flex-col justify-center">
                    <BracketMatch matchId={12} title="冠軍戰" />
                </div>
            </div>

            <div className="mt-8 text-center text-gray-500 text-sm">
                * 晉級圖表基於預定賽程結構繪製
            </div>
        </div>
    );
}
