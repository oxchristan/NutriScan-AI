import React, { useState, useRef } from 'react';
import { AnalysisResult } from '../types';
import { ChevronLeft, Check, Info, Zap, Download, Calendar } from 'lucide-react';
import CircularProgress from './CircularProgress';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';

interface AnalysisResultViewProps {
  data: AnalysisResult;
  imageUri?: string; // Add imageUri prop
  onBack: () => void;
  onSave?: () => void;
  isHistoryMode?: boolean;
}

const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ data, imageUri, onBack, onSave, isHistoryMode = false }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { health_score, short_feedback, total_nutrients, score_breakdown, detailed_advice, alternatives } = data;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#059669'; // Emerald
    if (score >= 60) return '#D97706'; // Amber
    return '#DC2626'; // Red
  };

  const macroData = [
    { name: 'Protein', value: total_nutrients.protein, color: '#0F172A' }, // Primary
    { name: 'Fat', value: total_nutrients.fat, color: '#94A3B8' }, // Slate 400
    { name: 'Carbs', value: total_nutrients.carbs, color: '#2563EB' }, // Blue
  ];

  const handleDownloadImage = async () => {
    if (!contentRef.current) return;
    setIsGeneratingImage(true);
    
    // Temporarily ensure everything is visible for capture if needed
    // But since we are capturing contentRef, it's fine.
    
    try {
        await new Promise(resolve => setTimeout(resolve, 100)); // Slight delay to ensure render
        const canvas = await html2canvas(contentRef.current, {
            useCORS: true,
            scale: 2, // Higher resolution
            backgroundColor: '#ffffff',
            logging: false,
        });

        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `EasyCAL-Analysis-${Date.now()}.png`;
        link.click();
    } catch (error) {
        console.error("Failed to generate image", error);
        alert("Could not generate image.");
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const NutrientRow = ({ label, value, unit, limit, isMain = false }: any) => {
    const isOverLimit = limit && value > limit;
    const displayValue = Number(value).toFixed(1).replace(/\.0$/, ''); // Remove trailing .0
    return (
      <div className={`flex justify-between items-center py-3 border-b border-gray-100 ${isMain ? 'font-semibold' : 'text-sm'}`}>
        <span className="text-gray-600">{label}</span>
        <div className="flex items-center space-x-2">
            <span className={isOverLimit ? 'text-red-600 font-bold' : 'text-gray-900 font-mono'}>
                {displayValue}{unit}
            </span>
            {limit && <span className="text-xs text-gray-400">/ {limit}{unit}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-white flex flex-col relative font-sans text-slate-800">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-40 shadow-sm">
            <button onClick={onBack} className="p-2 hover:bg-gray-50 text-gray-700 rounded-full">
                <ChevronLeft size={24} />
            </button>
            <h1 className="text-base font-bold tracking-wide uppercase text-gray-800">
                {isHistoryMode ? 'Meal Record' : 'Analysis Result'}
            </h1>
            <button onClick={handleDownloadImage} disabled={isGeneratingImage} className="p-2 hover:bg-gray-50 text-primary rounded-full">
                {isGeneratingImage ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> : <Download size={22} />}
            </button>
        </div>

        {/* Content Wrapper for Capture - Needs to contain everything for the image */}
        <div className="flex-1 overflow-y-auto bg-white" ref={contentRef}>
            
            {/* Image Section - Important for Download */}
            {imageUri && (
                <div className="w-full h-64 relative bg-gray-100">
                    <img src={imageUri} alt="Meal" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end">
                        <div className="p-4 w-full text-white">
                            <div className="flex justify-between items-end">
                                <div>
                                     <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">
                                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                     </p>
                                     <h2 className="text-xl font-bold leading-tight">
                                        {data.items[0]?.name || "Meal Scan"}
                                        {data.items.length > 1 && <span className="text-sm font-normal opacity-80 ml-2"> + {data.items.length - 1} more</span>}
                                     </h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="px-5 py-6 space-y-6 pb-20">
                {/* Score & Summary Row */}
                <div className="flex items-center justify-between gap-4">
                     <div className="relative w-24 h-24 flex-shrink-0">
                        <CircularProgress 
                            value={health_score} 
                            color={getScoreColor(health_score)} 
                            trackColor="#F1F5F9"
                            size={96}
                            strokeWidth={8}
                        >
                            <span className="text-2xl font-extrabold text-slate-800">{health_score}</span>
                        </CircularProgress>
                     </div>
                     <div className="flex-1">
                         <div className="flex items-center space-x-2 mb-2">
                             <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-sm text-white ${health_score >= 80 ? 'bg-emerald-600' : health_score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}>
                                 {health_score >= 80 ? 'Excellent' : health_score >= 60 ? 'Average' : 'Improve'}
                             </span>
                         </div>
                         <p className="text-sm font-medium text-slate-600 leading-snug">
                             {short_feedback}
                         </p>
                     </div>
                </div>

                {/* Macro Grid - Integers */}
                <div className="grid grid-cols-4 gap-2">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-sm flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Cals</span>
                        <span className="font-extrabold text-slate-900 text-lg">{Math.round(total_nutrients.calories)}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-sm flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Prot</span>
                        <span className="font-extrabold text-slate-900 text-lg">{Math.round(total_nutrients.protein)}g</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-sm flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Fat</span>
                        <span className="font-extrabold text-slate-900 text-lg">{Math.round(total_nutrients.fat)}g</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-sm flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1">Carbs</span>
                        <span className="font-extrabold text-slate-900 text-lg">{Math.round(total_nutrients.carbs)}g</span>
                    </div>
                </div>

                {/* Tabs - Hidden in image capture if redundant, but user might want to see what tab they are on. 
                    Actually, for the image download, we might want to force expand everything or just show Overview. 
                    Let's keep it simple and capture current view. */}
                <div className="flex border-b border-gray-200" data-html2canvas-ignore>
                    <button 
                        onClick={() => setActiveTab('overview')} 
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('details')} 
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'details' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                    >
                        Details
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' ? (
                    <div className="space-y-6">
                        {/* Macro Chart - Improved Layout */}
                        <div className="flex items-center bg-white border border-gray-100 p-4 rounded-sm shadow-sm">
                            <div className="w-1/2 h-32 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={macroData}
                                            innerRadius={35}
                                            outerRadius={50}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {macroData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                     <span className="text-[10px] font-bold text-gray-400">MACRO</span>
                                </div>
                            </div>
                            <div className="w-1/2 pl-2 space-y-2">
                                {macroData.map((m) => {
                                    const total = total_nutrients.protein + total_nutrients.fat + total_nutrients.carbs;
                                    const percent = total > 0 ? Math.round((m.value / total) * 100) : 0;
                                    return (
                                        <div key={m.name} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: m.color}}></div>
                                                <span className="text-gray-600 font-medium">{m.name}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-gray-900">{Math.round(m.value)}g</span>
                                                <span className="text-[10px] text-gray-400">{percent}%</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* AI Suggestions */}
                        <div className="bg-slate-50 p-5 border border-slate-100 rounded-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center uppercase text-xs tracking-widest">
                                <Zap size={14} className="text-primary mr-2" />
                                Smart Insights
                            </h3>
                            <div className="space-y-3">
                                {detailed_advice.map((advice, idx) => (
                                    <div key={idx} className="flex items-start text-sm text-slate-700 leading-relaxed">
                                        <span className="mr-3 text-primary font-bold text-xs mt-0.5">•</span>
                                        {advice}
                                    </div>
                                ))}
                            </div>
                            {alternatives.length > 0 && (
                                <div className="mt-5 pt-4 border-t border-slate-200">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Suggested Swaps</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {alternatives.map((alt, idx) => (
                                            <span key={idx} className="text-xs bg-white text-slate-700 px-3 py-1.5 border border-slate-200 rounded-sm shadow-sm">
                                                {alt}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-4 border border-slate-100 rounded-sm space-y-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Detailed Nutrients</h3>
                        <NutrientRow label="Fiber" value={total_nutrients.fiber} unit="g" limit={30} />
                        <NutrientRow label="Sugar" value={total_nutrients.sugar} unit="g" limit={25} />
                        <NutrientRow label="Sodium" value={total_nutrients.sodium} unit="mg" limit={2300} />
                        
                        <h3 className="text-xs font-bold text-slate-400 uppercase mt-8 mb-4 tracking-wider">Health Audit</h3>
                        <NutrientRow label="Calorie Score" value={score_breakdown.calorie_score} unit="/30" />
                        <NutrientRow label="Macro Balance" value={score_breakdown.macro_score} unit="/30" />
                        <NutrientRow label="Quality Score" value={score_breakdown.balance_score} unit="/20" />
                        <NutrientRow label="Risk Factors" value={score_breakdown.risk_score} unit="/20" />
                    </div>
                )}
                
                 {/* Watermark for Image Generation */}
                <div className="pt-12 pb-4 flex flex-col items-center justify-center opacity-70">
                     <div className="flex items-center space-x-2 mb-1">
                         <div className="w-4 h-4 bg-primary rounded-sm"></div>
                         <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase">EasyCAL</span>
                     </div>
                     <p className="text-[9px] text-gray-400 uppercase tracking-widest">AI-Powered Nutrition Coach</p>
                </div>
            </div>
        </div>

        {/* Footer Actions - Hidden if in history mode */}
        {!isHistoryMode && (
            <div className="bg-white p-4 border-t border-gray-200 z-50">
                <button 
                    onClick={onSave}
                    className="w-full bg-primary hover:bg-primary-light text-white font-bold py-4 flex items-center justify-center transition-colors shadow-lg shadow-primary/20 uppercase tracking-widest text-sm rounded-sm"
                >
                    <Check className="mr-2" size={20} />
                    Save Record
                </button>
            </div>
        )}
    </div>
  );
};

export default AnalysisResultView;