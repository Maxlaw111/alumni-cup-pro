import { Home, Calendar, Trophy, Users, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";

export function Navigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const activeTab = location.pathname;

    const tabs = [
        { id: "/", label: "賽事", icon: Home },
        { id: "/schedule", label: "賽程", icon: Calendar },
        { id: "/bracket", label: "戰績", icon: Trophy },
        { id: "/teams", label: "球隊", icon: Users },
        { id: "/predict", label: "預測", icon: Sparkles },
    ];

    const isActive = (path) => {
        if (path === "/" && activeTab === "/") return true;
        if (path !== "/" && activeTab.startsWith(path)) return true;
        return false;
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
            <div className="flex justify-around items-center max-w-md mx-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => navigate(tab.id)}
                        className={clsx(
                            "flex flex-col items-center gap-1 p-2 rounded-lg transition-all flex-1",
                            isActive(tab.id)
                                ? "text-primary font-bold"
                                : "text-gray-500 hover:bg-gray-50"
                        )}
                    >
                        <tab.icon size={24} strokeWidth={isActive(tab.id) ? 2.5 : 2} />
                        <span className="text-[10px] sm:text-xs">{tab.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
}
