
import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle, TrendingUp, Info, ArrowRight } from 'lucide-react';
import { AiAnalysis, AiInsight } from '../types/api';
import Button from '../../components/Button';

interface AIInsightsProps {
    data?: AiAnalysis;
}

const AIInsights: React.FC<AIInsightsProps> = ({ data }) => {
    if (!data || !data.insights || data.insights.length === 0) return null;

    const getIcon = (type: AiInsight['type']) => {
        switch (type) {
            case 'risk': return <AlertTriangle size={20} className="text-red-400" />;
            case 'positive': return <CheckCircle size={20} className="text-fiber-green" />;
            default: return <Info size={20} className="text-fiber-blue" />;
        }
    };

    const getStyles = (type: AiInsight['type']) => {
        switch (type) {
            case 'risk': return 'bg-red-500/10 border-red-500/20 text-red-100';
            case 'positive': return 'bg-green-500/10 border-green-500/20 text-green-100';
            default: return 'bg-blue-500/10 border-blue-500/20 text-blue-100';
        }
    };

    return (
        <div className="bg-gradient-to-br from-neutral-900 to-fiber-card border border-white/10 rounded-xl p-6 relative overflow-hidden mb-8 shadow-2xl">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-fiber-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-fiber-orange/10 rounded-lg">
                        <Sparkles size={24} className="text-fiber-orange animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Análise Inteligente Fiber.AI</h3>
                        <p className="text-xs text-gray-400">Insights baseados no seu perfil de uso e financeiro.</p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-fiber-orange pl-4 italic">
                        "{data.summary}"
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.insights.map((insight, idx) => (
                        <div 
                            key={idx} 
                            className={`p-4 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] ${getStyles(insight.type)}`}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-sm">{insight.title}</h4>
                                    {getIcon(insight.type)}
                                </div>
                                <p className="text-xs opacity-80 mb-4 leading-relaxed">
                                    {insight.message}
                                </p>
                            </div>
                            
                            {insight.action && (
                                <button 
                                    className={`text-xs font-bold flex items-center gap-1 uppercase tracking-wider hover:underline focus:outline-none ${
                                        insight.type === 'risk' ? 'text-red-400' : 
                                        insight.type === 'positive' ? 'text-fiber-green' : 'text-fiber-blue'
                                    }`}
                                    onClick={() => insight.actionUrl && window.open(insight.actionUrl, '_blank')}
                                >
                                    {insight.action} <ArrowRight size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AIInsights;
