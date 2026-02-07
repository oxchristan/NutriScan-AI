import React, { useState } from 'react';
import { FoodItem, AnalysisResult } from '../types';
import { ChevronLeft, Check, Edit2, Trash2 } from 'lucide-react';

interface QuantityAdjustViewProps {
  initialData: AnalysisResult;
  onConfirm: (updatedItems: FoodItem[]) => void;
  onBack: () => void;
}

const QuantityAdjustView: React.FC<QuantityAdjustViewProps> = ({ initialData, onConfirm, onBack }) => {
  const [items, setItems] = useState<FoodItem[]>(initialData.items);

  const handleWeightChange = (id: string, newWeight: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, weight_g: newWeight } : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col font-sans">
       {/* Header */}
       <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-200 z-20">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 text-gray-600">
                <ChevronLeft size={24} />
            </button>
            <h1 className="text-base font-bold uppercase tracking-wide text-gray-800">Confirm Portions</h1>
            <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-4">Adjust weights for accuracy</p>
            
            <div className="space-y-3">
                {items.map((item) => (
                    <div key={item.id} className="bg-white p-4 border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                                <div className="text-xs text-primary font-medium mt-1">
                                    ~{(item.nutrients.calories * (item.weight_g / 100)).toFixed(0)} kcal
                                </div>
                            </div>
                            <button 
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-gray-300 hover:text-red-600 transition-colors"
                            >
                                <Trash2 size={18} strokeWidth={1.5} />
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                             <div className="flex justify-between text-sm items-center">
                                 <span className="text-gray-500">Weight</span>
                                 <div className="flex items-center">
                                    <input 
                                        type="number" 
                                        value={item.weight_g}
                                        onChange={(e) => handleWeightChange(item.id, parseInt(e.target.value) || 0)}
                                        className="w-16 text-right font-bold text-gray-900 border-b border-gray-300 focus:border-primary outline-none mr-1"
                                    />
                                    <span className="text-gray-500">g</span>
                                 </div>
                             </div>
                             <input 
                                type="range" 
                                min="10" 
                                max="500" 
                                step="10"
                                value={item.weight_g}
                                onChange={(e) => handleWeightChange(item.id, parseInt(e.target.value))}
                                className="w-full h-1 bg-gray-200 appearance-none cursor-pointer accent-primary"
                             />
                        </div>
                    </div>
                ))}
            </div>
            
            <button className="w-full mt-6 py-4 border border-dashed border-gray-300 text-gray-500 font-medium flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors uppercase text-xs tracking-widest">
                <Edit2 size={14} className="mr-2" />
                Add Missing Item
            </button>
        </div>

        <div className="bg-white p-4 border-t border-gray-200">
             <button 
                onClick={() => onConfirm(items)}
                className="w-full bg-primary hover:bg-primary-light text-white font-bold py-4 flex items-center justify-center transition-colors shadow-lg shadow-primary/20 uppercase tracking-widest text-sm"
            >
                <Check className="mr-2" size={18} />
                Confirm & Analyze
            </button>
        </div>
    </div>
  );
};

export default QuantityAdjustView;