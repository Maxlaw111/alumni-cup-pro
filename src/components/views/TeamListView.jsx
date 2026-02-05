import { useNavigate } from "react-router-dom";
import { TEAM_LIST } from "../../constants/data";
import { Users, ChevronRight } from "lucide-react";

export function TeamListView() {
    const navigate = useNavigate();

    return (
        <div className="pb-24 pt-6 px-4">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                🏆 參賽球隊
            </h2>
            <div className="grid grid-cols-1 gap-3">
                {TEAM_LIST.map((team) => (
                    <div
                        key={team.name}
                        onClick={() => navigate(`/teams/${encodeURIComponent(team.name)}`)}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                <Users size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{team.name}</h3>
                                <p className="text-xs text-gray-500">{team.members.length} 位隊員</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400" size={20} />
                    </div>
                ))}
            </div>
        </div>
    );
}
