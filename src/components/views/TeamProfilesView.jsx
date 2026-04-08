import React from 'react';
import { TEAM_LIST, TEAM_PROFILES } from '../../constants/data';
import { Shield, Target, Award, Zap } from 'lucide-react';
import clsx from 'clsx';

export function TeamProfilesView() {
    return (
        <div className="pb-24 pt-6 px-4 bg-slate-50 min-h-screen relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[20%] right-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>

            <div className="relative mb-8 text-center pt-2">
                <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4 border border-slate-100">
                    <Zap className="text-primary drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.5)]" size={32} />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    戰力分析報告
                </h1>
                <p className="text-sm text-slate-500 mt-2 font-medium">各隊戰力總評與特別關注名單</p>
            </div>

            <div className="relative flex flex-col gap-5">
                {TEAM_LIST.map((team, idx) => {
                    const profile = TEAM_PROFILES[team.name] || {
                        description: "球探報告收集中...",
                        tags: []
                    };

                    const hasData = !!TEAM_PROFILES[team.name];

                    return (
                        <div 
                            key={team.name}
                            className={clsx(
                                "group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 transition-all duration-300",
                                "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]",
                                "hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] hover:-translate-y-1"
                            )}
                        >
                            {/* Glow effect on hover */}
                            {hasData && (
                                <div className="absolute inset-[-1px] bg-gradient-to-br from-primary/40 to-blue-400/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
                            )}

                            <div className="flex justify-between items-start mb-3">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                    <Shield className={hasData ? "text-primary fill-primary/10" : "text-slate-400"} size={20} />
                                    {team.name}
                                </h2>
                            </div>

                            {profile.tags && profile.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {profile.tags.map(tag => (
                                        <span 
                                            key={tag} 
                                            className="px-2.5 py-1 bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-[11px] font-bold rounded-md flex items-center gap-1 border border-primary/10"
                                        >
                                            <Award size={12} className="text-primary" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className={clsx(
                                "text-sm leading-relaxed rounded-xl p-3",
                                hasData ? "bg-slate-50 text-slate-700" : "bg-slate-50/50 text-slate-400 italic"
                            )}>
                                {profile.description}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
