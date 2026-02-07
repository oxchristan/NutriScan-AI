import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import CameraView from './components/CameraView';
import AnalysisResultView from './components/AnalysisResultView';
import QuantityAdjustView from './components/QuantityAdjustView';
import { ViewState, MealRecord, UserProfile, AnalysisResult, FoodItem, LanguageCode } from './types';
import { analyzeFoodImage } from './services/geminiService';
import { Camera, Target, ChevronRight, Globe, Save, Edit2, History } from 'lucide-react';
import CircularProgress from './components/CircularProgress';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// --- Translation Dictionary ---
const TRANSLATIONS = {
  'en': {
    welcome: "Hello",
    goal: "Goal",
    consumed: "Consumed",
    scan: "Scan Meal",
    setGoals: "Goals",
    today: "Today's Logs",
    history: "History",
    analysis: "Analysis",
    profile: "Profile",
    dailyTarget: "Daily Target",
    save: "Save",
    language: "Language",
    onboardingTitle: "Setup Profile",
    name: "Name",
    age: "Age",
    height: "Height (cm)",
    weight: "Weight (kg)",
    calculate: "Calculate Plan",
    activity: "Activity Level",
    gender: "Gender",
    male: "Male",
    female: "Female",
    lose: "Lose Weight",
    gain: "Muscle Gain",
    maintain: "Maintain",
    sedentary: "Sedentary",
    light: "Light Active",
    moderate: "Moderate",
    active: "Very Active",
    uploadAvatar: "Upload Avatar"
  },
  'zh-CN': {
    welcome: "你好",
    goal: "目标",
    consumed: "已摄入",
    scan: "拍照识餐",
    setGoals: "设置目标",
    today: "今日记录",
    history: "历史记录",
    analysis: "数据分析",
    profile: "个人中心",
    dailyTarget: "每日目标",
    save: "保存",
    language: "语言",
    onboardingTitle: "个人档案设置",
    name: "姓名",
    age: "年龄",
    height: "身高 (cm)",
    weight: "体重 (kg)",
    calculate: "生成计划",
    activity: "活动量",
    gender: "性别",
    male: "男",
    female: "女",
    lose: "减脂",
    gain: "增肌",
    maintain: "维持",
    sedentary: "久坐",
    light: "轻度活动",
    moderate: "中度活动",
    active: "高强度活动",
    uploadAvatar: "上传头像"
  },
  'zh-TW': {
    welcome: "你好",
    goal: "目標",
    consumed: "已攝入",
    scan: "拍照識餐",
    setGoals: "設置目標",
    today: "今日記錄",
    history: "歷史記錄",
    analysis: "數據分析",
    profile: "個人中心",
    dailyTarget: "每日目標",
    save: "保存",
    language: "語言",
    onboardingTitle: "個人檔案設置",
    name: "姓名",
    age: "年齡",
    height: "身高 (cm)",
    weight: "體重 (kg)",
    calculate: "生成計劃",
    activity: "活動量",
    gender: "性別",
    male: "男",
    female: "女",
    lose: "減脂",
    gain: "增肌",
    maintain: "維持",
    sedentary: "久坐",
    light: "輕度活動",
    moderate: "中度活動",
    active: "高強度活動",
    uploadAvatar: "上傳頭像"
  },
  'es': {
    welcome: "Hola",
    goal: "Meta",
    consumed: "Consumido",
    scan: "Escanear",
    setGoals: "Metas",
    today: "Comidas de hoy",
    history: "Historial",
    analysis: "Análisis",
    profile: "Perfil",
    dailyTarget: "Meta Diaria",
    save: "Guardar",
    language: "Idioma",
    onboardingTitle: "Configurar Perfil",
    name: "Nombre",
    age: "Edad",
    height: "Altura (cm)",
    weight: "Peso (kg)",
    calculate: "Calcular",
    activity: "Actividad",
    gender: "Género",
    male: "Hombre",
    female: "Mujer",
    lose: "Perder Peso",
    gain: "Ganar Músculo",
    maintain: "Mantener",
    sedentary: "Sedentario",
    light: "Ligero",
    moderate: "Moderado",
    active: "Activo",
    uploadAvatar: "Subir Avatar"
  },
  'ja': {
    welcome: "こんにちは",
    goal: "目標",
    consumed: "摂取量",
    scan: "食事スキャン",
    setGoals: "目標設定",
    today: "今日の記録",
    history: "履歴",
    analysis: "分析",
    profile: "プロフィール",
    dailyTarget: "日次目標",
    save: "保存",
    language: "言語",
    onboardingTitle: "プロフィール設定",
    name: "名前",
    age: "年齢",
    height: "身長 (cm)",
    weight: "体重 (kg)",
    calculate: "プラン作成",
    activity: "活動レベル",
    gender: "性別",
    male: "男性",
    female: "女性",
    lose: "減量",
    gain: "筋肉増強",
    maintain: "維持",
    sedentary: "デスクワーク",
    light: "軽い運動",
    moderate: "中程度の運動",
    active: "激しい運動",
    uploadAvatar: "アバターをアップロード"
  },
  'ko': {
    welcome: "안녕하세요",
    goal: "목표",
    consumed: "섭취량",
    scan: "식사 스캔",
    setGoals: "목표 설정",
    today: "오늘의 기록",
    history: "기록",
    analysis: "분석",
    profile: "프로필",
    dailyTarget: "일일 목표",
    save: "저장",
    language: "언어",
    onboardingTitle: "프로필 설정",
    name: "이름",
    age: "나이",
    height: "키 (cm)",
    weight: "체중 (kg)",
    calculate: "계획 생성",
    activity: "활동량",
    gender: "성별",
    male: "남성",
    female: "여성",
    lose: "체중 감량",
    gain: "근육 증가",
    maintain: "유지",
    sedentary: "좌식 생활",
    light: "가벼운 활동",
    moderate: "보통 활동",
    active: "많은 활동",
    uploadAvatar: "아바타 업로드"
  }
};

// --- Helper Functions ---
const calculateMifflinStJeor = (weight: number, height: number, age: number, gender: 'Male' | 'Female', activity: string, goal: string): number => {
  let s = gender === 'Male' ? 5 : -161;
  let bmr = (10 * weight) + (6.25 * height) - (5 * age) + s;

  const activityMultipliers: {[key: string]: number} = {
    'Sedentary': 1.2,
    'Light': 1.375,
    'Moderate': 1.55,
    'Active': 1.725
  };

  let tdee = bmr * (activityMultipliers[activity] || 1.2);

  if (goal === 'Lose Weight') return Math.round(tdee - 500);
  if (goal === 'Muscle Gain') return Math.round(tdee + 300);
  return Math.round(tdee);
};

const calculateTotals = (items: FoodItem[]) => {
    const total = { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0, sodium: 0 };
    items.forEach(item => {
        total.calories += item.nutrients.calories;
        total.protein += item.nutrients.protein;
        total.fat += item.nutrients.fat;
        total.carbs += item.nutrients.carbs;
        total.fiber += item.nutrients.fiber;
        total.sugar += item.nutrients.sugar;
        total.sodium += item.nutrients.sodium;
    });
    return total;
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.SPLASH);
  
  // User State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tempUser, setTempUser] = useState<UserProfile>({
      name: '', age: 25, gender: 'Male', height: 170, weight: 65, 
      goal: 'Lose Weight', activityLevel: 'Moderate', targetCalories: 2000, language: 'en'
  });

  const [dailyLogs, setDailyLogs] = useState<MealRecord[]>([]);
  const [selectedLog, setSelectedLog] = useState<MealRecord | null>(null);
  
  // Analysis Flow State
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Current Date
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const t = user ? TRANSLATIONS[user.language] : TRANSLATIONS['en'];
  
  // Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        setView(ViewState.ONBOARDING);
      } else {
        setView(ViewState.HOME);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [user]);

  const handleOnboardingComplete = () => {
    const calories = calculateMifflinStJeor(tempUser.weight, tempUser.height, tempUser.age, tempUser.gender, tempUser.activityLevel, tempUser.goal);
    const finalUser = { ...tempUser, targetCalories: calories };
    setUser(finalUser);
    setView(ViewState.HOME);
  };

  const handleCapture = async (imageUri: string) => {
    setCurrentImage(imageUri);
    setIsLoading(true);
    try {
      const lang = user?.language || 'en';
      const result = await analyzeFoodImage(imageUri, user?.goal || 'Maintain', lang);
      result.items = result.items.map((i, idx) => ({...i, id: Date.now().toString() + idx}));
      setAnalysisData(result);
      setView(ViewState.QUANTITY_ADJUST);
    } catch (e) {
      alert("Failed to analyze. Please check API key.");
      setView(ViewState.HOME);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityConfirm = (updatedItems: FoodItem[]) => {
    if (!analysisData) return;
    const newTotals = calculateTotals(updatedItems);
    setAnalysisData({
        ...analysisData,
        items: updatedItems,
        total_nutrients: newTotals
    });
    setView(ViewState.ANALYSIS_RESULT);
  };

  const handleSaveLog = () => {
    if (analysisData) {
        const newRecord: MealRecord = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            mealType: 'Lunch', // Simplified
            imageUri: currentImage || undefined,
            analysis: analysisData
        };
        setDailyLogs([...dailyLogs, newRecord]);
        setView(ViewState.HOME);
        setAnalysisData(null);
        setCurrentImage(null);
    }
  };

  const updateUserProfile = () => {
    if(user) {
        const calories = calculateMifflinStJeor(user.weight, user.height, user.age, user.gender, user.activityLevel, user.goal);
        setUser({...user, targetCalories: calories});
        alert("Profile Updated & Calories Recalculated!");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, avatarUri: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogClick = (log: MealRecord) => {
      setSelectedLog(log);
      setView(ViewState.LOG_DETAILS);
  };

  // --- Render Views ---

  const renderSplash = () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-primary relative overflow-hidden">
        <div className="z-10 bg-white/10 rounded-none p-8 backdrop-blur-sm mb-8 animate-pulse">
            <Camera size={64} className="text-white" strokeWidth={1} />
        </div>
        <h1 className="text-4xl font-thin text-white tracking-[0.2em] mb-2 uppercase">EasyCAL</h1>
        <p className="text-white/40 text-sm tracking-widest uppercase">AI Precision Nutrition</p>
    </div>
  );

  const renderOnboarding = () => (
    <div className="h-full w-full bg-white p-8 flex flex-col overflow-y-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">{t.onboardingTitle}</h1>
        <div className="space-y-5 flex-1">
            <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">{t.language}</label>
                <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 text-primary"
                    value={tempUser.language}
                    onChange={(e) => setTempUser({...tempUser, language: e.target.value as LanguageCode})}
                >
                    <option value="en">English</option>
                    <option value="zh-CN">简体中文</option>
                    <option value="zh-TW">繁體中文</option>
                    <option value="es">Español</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                </select>
            </div>
            {/* ... other fields identical to previous ... */}
             <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">{t.name}</label>
                <input type="text" className="w-full p-3 border-b-2 border-gray-200 focus:border-primary outline-none"
                    value={tempUser.name} onChange={e => setTempUser({...tempUser, name: e.target.value})} />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs uppercase text-gray-500 mb-1">{t.age}</label>
                    <input type="number" className="w-full p-3 border-b-2 border-gray-200 focus:border-primary outline-none"
                        value={tempUser.age} onChange={e => setTempUser({...tempUser, age: Number(e.target.value)})} />
                </div>
                <div>
                    <label className="block text-xs uppercase text-gray-500 mb-1">{t.gender}</label>
                    <select className="w-full p-3 bg-transparent border-b-2 border-gray-200 focus:border-primary outline-none"
                        value={tempUser.gender} onChange={e => setTempUser({...tempUser, gender: e.target.value as any})}>
                        <option value="Male">{t.male}</option>
                        <option value="Female">{t.female}</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs uppercase text-gray-500 mb-1">{t.height}</label>
                    <input type="number" className="w-full p-3 border-b-2 border-gray-200 focus:border-primary outline-none"
                        value={tempUser.height} onChange={e => setTempUser({...tempUser, height: Number(e.target.value)})} />
                </div>
                <div>
                    <label className="block text-xs uppercase text-gray-500 mb-1">{t.weight}</label>
                    <input type="number" className="w-full p-3 border-b-2 border-gray-200 focus:border-primary outline-none"
                        value={tempUser.weight} onChange={e => setTempUser({...tempUser, weight: Number(e.target.value)})} />
                </div>
            </div>
            <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">{t.activity}</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 text-primary"
                    value={tempUser.activityLevel} onChange={e => setTempUser({...tempUser, activityLevel: e.target.value as any})}>
                    <option value="Sedentary">{t.sedentary}</option>
                    <option value="Light">{t.light}</option>
                    <option value="Moderate">{t.moderate}</option>
                    <option value="Active">{t.active}</option>
                </select>
            </div>
            <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">{t.goal}</label>
                <div className="grid grid-cols-2 gap-2">
                    {['Lose Weight', 'Muscle Gain', 'Maintain'].map(g => (
                        <button 
                            key={g}
                            onClick={() => setTempUser({...tempUser, goal: g as any})}
                            className={`p-3 text-sm border ${tempUser.goal === g ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200'}`}
                        >
                           {g === 'Lose Weight' ? t.lose : g === 'Muscle Gain' ? t.gain : t.maintain}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        <button 
            onClick={handleOnboardingComplete}
            className="w-full mt-8 bg-primary text-white py-4 font-bold tracking-widest uppercase hover:bg-primary-light transition"
        >
            {t.calculate}
        </button>
    </div>
  );

  const renderHome = () => {
      const todayCalories = dailyLogs
        .filter(log => new Date(log.timestamp).toDateString() === new Date().toDateString())
        .reduce((acc, log) => acc + log.analysis.total_nutrients.calories, 0);
      
      const progress = user ? Math.min((todayCalories / user.targetCalories) * 100, 100) : 0;

      return (
        <div className="p-6 space-y-8 pb-24">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">{todayDate}</p>
                    <h2 className="text-2xl font-light text-primary">{t.welcome}, <span className="font-bold">{user?.name}</span></h2>
                </div>
                <div className="w-12 h-12 bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg rounded-full overflow-hidden border-2 border-white">
                    {user?.avatarUri ? (
                        <img src={user.avatarUri} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        user?.name.charAt(0)
                    )}
                </div>
            </div>

            <div className="bg-white border border-gray-100 p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] relative overflow-hidden">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-gray-400">{t.dailyTarget}</p>
                            <h3 className="text-3xl font-bold text-primary">{user?.targetCalories} <span className="text-sm font-normal text-gray-400">kcal</span></h3>
                        </div>
                        <div className="w-full h-px bg-gray-100 my-2"></div>
                        <div>
                             <p className="text-xs uppercase tracking-widest text-gray-400">{t.consumed}</p>
                             <h3 className="text-xl text-gray-600">{Math.round(todayCalories)}</h3>
                        </div>
                    </div>
                    <CircularProgress value={progress} size={100} strokeWidth={6} color={progress > 100 ? '#D97706' : '#0F172A'}>
                         <div className="flex flex-col items-center">
                             <span className="text-xl font-bold text-primary">{Math.round(progress)}%</span>
                         </div>
                    </CircularProgress>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <button 
                    onClick={() => setView(ViewState.CAMERA)}
                    className="bg-primary text-white h-32 p-4 flex flex-col items-start justify-between shadow-lg hover:bg-primary-light transition group"
                 >
                     <Camera size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                     <div className="flex justify-between w-full items-end">
                         <span className="font-medium tracking-wide">{t.scan}</span>
                         <ChevronRight size={16} />
                     </div>
                 </button>
                 <button 
                    onClick={() => setView(ViewState.PROFILE)}
                    className="bg-white text-primary border border-gray-100 h-32 p-4 flex flex-col items-start justify-between shadow-sm hover:bg-gray-50 transition group"
                 >
                     <Target size={28} strokeWidth={1.5} className="text-accent group-hover:scale-110 transition-transform" />
                     <div className="flex justify-between w-full items-end">
                         <span className="font-medium tracking-wide">{t.setGoals}</span>
                         <ChevronRight size={16} />
                     </div>
                 </button>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">{t.today}</h3>
                </div>
                <div className="space-y-0 divide-y divide-gray-100">
                    {dailyLogs.length === 0 ? (
                        <div className="text-center py-12 text-gray-300">
                            <p className="text-sm font-light italic">No data yet.</p>
                        </div>
                    ) : (
                        dailyLogs.slice().reverse().map(log => (
                            <div 
                                key={log.id} 
                                onClick={() => handleLogClick(log)}
                                className="py-4 flex items-center justify-between group cursor-pointer active:bg-gray-50 transition"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gray-100 overflow-hidden">
                                        {log.imageUri && <img src={log.imageUri} className="w-full h-full object-cover" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-primary text-sm">{log.analysis.items[0]?.name || log.mealType}</h4>
                                        <p className="text-xs text-gray-500">
                                            {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-primary">{Math.round(log.analysis.total_nutrients.calories)} kcal</span>
                                    <span className={`text-xs ${log.analysis.health_score > 75 ? 'text-green-600' : 'text-orange-500'}`}>
                                        Score: {log.analysis.health_score}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      );
  }

  const renderHistory = () => (
    <div className="p-4 pb-24 h-full overflow-y-auto">
        <h2 className="text-xl font-bold text-primary mb-6 border-b border-gray-100 pb-4">{t.history}</h2>
        <div className="space-y-6">
            {dailyLogs.length === 0 && <div className="text-center text-gray-400 mt-20">No history found.</div>}
            {dailyLogs.slice().reverse().map(log => (
                <div 
                    key={log.id} 
                    onClick={() => handleLogClick(log)}
                    className="bg-white border border-gray-200 p-4 shadow-sm cursor-pointer hover:border-primary transition"
                >
                     <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{new Date(log.timestamp).toLocaleDateString()}</span>
                        <span className="text-xs text-primary font-bold">{log.mealType}</span>
                     </div>
                     <div className="flex space-x-4">
                         <div className="w-20 h-20 bg-gray-100 flex-shrink-0">
                             {log.imageUri && <img src={log.imageUri} className="w-full h-full object-cover" />}
                         </div>
                         <div className="flex-1">
                             <div className="flex justify-between items-start">
                                <p className="text-sm font-medium text-primary line-clamp-2 mb-2">
                                    {log.analysis.items.map(i => i.name).join(', ')}
                                </p>
                             </div>
                             <div className="flex space-x-3 text-xs text-gray-500">
                                 <span><span className="font-bold text-primary">{Math.round(log.analysis.total_nutrients.calories)}</span> kcal</span>
                                 <span><span className="font-bold text-primary">{Math.round(log.analysis.total_nutrients.protein)}g</span> P</span>
                                 <span><span className="font-bold text-primary">{Math.round(log.analysis.total_nutrients.carbs)}g</span> C</span>
                             </div>
                         </div>
                     </div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderAnalysis = () => {
    const data = dailyLogs.length > 0 
        ? dailyLogs.map(l => ({
            name: new Date(l.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
            cals: Math.round(l.analysis.total_nutrients.calories),
            prot: Math.round(l.analysis.total_nutrients.protein)
          }))
        : [{name: 'Mon', cals: 0}, {name: 'Tue', cals: 0}, {name: 'Wed', cals: 0}];

    return (
        <div className="p-6 pb-24 h-full overflow-y-auto">
            <h2 className="text-xl font-bold text-primary mb-6 border-b border-gray-100 pb-4">{t.analysis}</h2>
            <div className="space-y-8">
                <div className="bg-white border border-gray-100 p-4 shadow-sm h-64">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">Calorie Trend</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="cals" stroke="#0F172A" strokeWidth={2} dot={{r:3}} activeDot={{r:5}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white border border-gray-100 p-4 shadow-sm h-64">
                     <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">Protein Intake</h3>
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                             <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                             <Tooltip />
                             <Bar dataKey="prot" fill="#2563EB" barSize={20} />
                        </BarChart>
                     </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
  };

  const renderProfile = () => (
    <div className="p-6 pb-24 h-full overflow-y-auto bg-gray-50">
         <h2 className="text-xl font-bold text-primary mb-6 bg-white p-4 -mx-6 -mt-6 border-b border-gray-200 sticky top-0 z-30">{t.profile}</h2>
         <div className="bg-white border border-gray-200 p-6 mb-6 text-center relative">
             <div className="relative w-24 h-24 mx-auto mb-4 group">
                <div className="w-full h-full rounded-full bg-primary text-white text-3xl font-bold flex items-center justify-center overflow-hidden shadow-lg border-4 border-white">
                    {user?.avatarUri ? (
                        <img src={user.avatarUri} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        user?.name.charAt(0)
                    )}
                </div>
                <button 
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary-light transition"
                >
                    <Edit2 size={14} />
                </button>
                <input 
                    type="file" 
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                    className="hidden" 
                    accept="image/*"
                />
             </div>
             <h3 className="text-lg font-bold text-primary">{user?.name}</h3>
             <p className="text-sm text-gray-500">{user?.goal} • {user?.targetCalories} kcal</p>
         </div>
         {/* Profile Edit fields ... */}
         <div className="space-y-4">
             <div className="bg-white border border-gray-200 p-4">
                <label className="block text-xs uppercase text-gray-400 mb-2">{t.language}</label>
                <div className="flex items-center">
                    <Globe size={16} className="text-gray-400 mr-2" />
                    <select 
                        className="w-full bg-transparent font-medium text-primary outline-none"
                        value={user?.language}
                        onChange={(e) => setUser(user ? {...user, language: e.target.value as LanguageCode} : null)}
                    >
                        <option value="en">English</option>
                        <option value="zh-CN">简体中文</option>
                        <option value="zh-TW">繁體中文</option>
                        <option value="es">Español</option>
                        <option value="ja">日本語</option>
                        <option value="ko">한국어</option>
                    </select>
                </div>
             </div>
             <div className="bg-white border border-gray-200 p-4">
                 <h4 className="text-xs uppercase text-gray-400 mb-4 border-b border-gray-100 pb-2">Body Metrics</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500">{t.weight}</label>
                        <input type="number" value={user?.weight} onChange={e => user && setUser({...user, weight: Number(e.target.value)})} 
                        className="w-full border-b border-gray-200 py-1 font-bold text-primary outline-none"/>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">{t.goal}</label>
                        <select value={user?.goal} onChange={e => user && setUser({...user, goal: e.target.value as any})}
                        className="w-full border-b border-gray-200 py-1 font-bold text-primary bg-transparent outline-none">
                            <option value="Lose Weight">{t.lose}</option>
                            <option value="Muscle Gain">{t.gain}</option>
                            <option value="Maintain">{t.maintain}</option>
                        </select>
                    </div>
                 </div>
             </div>
             <button 
                onClick={updateUserProfile}
                className="w-full bg-primary text-white py-4 font-bold uppercase tracking-widest hover:bg-primary-light transition flex items-center justify-center"
             >
                 <Save size={18} className="mr-2" />
                 {t.save}
             </button>
         </div>
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case ViewState.SPLASH: return renderSplash();
      case ViewState.ONBOARDING: return renderOnboarding();
      case ViewState.CAMERA: 
        return <CameraView 
            onCapture={handleCapture} 
            onCancel={() => setView(ViewState.HOME)} 
        />;
      case ViewState.QUANTITY_ADJUST:
        if (isLoading) return (
            <div className="h-full flex flex-col items-center justify-center bg-white">
                <div className="animate-spin w-12 h-12 border-2 border-gray-200 border-t-primary rounded-full mb-4"></div>
                <p className="text-gray-500 text-sm uppercase tracking-widest">Analyzing...</p>
            </div>
        );
        return analysisData ? (
            <QuantityAdjustView 
                initialData={analysisData} 
                onConfirm={handleQuantityConfirm} 
                onBack={() => setView(ViewState.CAMERA)} 
            />
        ) : null;
      case ViewState.ANALYSIS_RESULT:
        return analysisData ? (
            <AnalysisResultView 
                data={analysisData} 
                imageUri={currentImage || undefined}
                onBack={() => setView(ViewState.QUANTITY_ADJUST)} 
                onSave={handleSaveLog}
                isHistoryMode={false}
            />
        ) : null;
      case ViewState.LOG_DETAILS:
        return selectedLog ? (
            <AnalysisResultView 
                data={selectedLog.analysis}
                imageUri={selectedLog.imageUri}
                onBack={() => setView(ViewState.HOME)} 
                isHistoryMode={true}
            />
        ) : null;
      case ViewState.HISTORY: return renderHistory();
      case ViewState.DAILY_SUMMARY: return renderAnalysis();
      case ViewState.PROFILE: return renderProfile();
      case ViewState.HOME:
      default:
        return renderHome();
    }
  };

  return (
    <Layout currentView={view} setView={setView}>
      {renderContent()}
    </Layout>
  );
};

export default App;