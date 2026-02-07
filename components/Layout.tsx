import React from 'react';
import { ViewState } from '../types';
import { Home, Camera, BarChart2, User, History } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const isFullScreen = [ViewState.SPLASH, ViewState.CAMERA, ViewState.QUANTITY_ADJUST, ViewState.ONBOARDING].includes(currentView);

  if (isFullScreen) {
    return <div className="h-full w-full bg-white">{children}</div>;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => {
    const isActive = currentView === view;
    return (
      <button 
        onClick={() => setView(view)}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-gray-400'}`}
      >
        <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
        <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-primary-bg relative font-sans">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {children}
      </div>
      
      {/* Bottom Navigation - Sharp corners, minimal shadow */}
      <div className="h-[70px] bg-white border-t border-gray-200 flex items-center justify-between px-4 z-50">
        <NavItem view={ViewState.HOME} icon={Home} label="Home" />
        <NavItem view={ViewState.HISTORY} icon={History} label="History" />
        
        {/* Floating Camera Button - Square-ish */}
        <div className="relative -top-5">
          <button 
            onClick={() => setView(ViewState.CAMERA)}
            className="w-14 h-14 bg-primary shadow-xl shadow-primary/30 flex items-center justify-center text-white transform transition-transform active:scale-95 hover:bg-primary-light"
          >
            <Camera size={28} />
          </button>
        </div>

        <NavItem view={ViewState.DAILY_SUMMARY} icon={BarChart2} label="Report" />
        <NavItem view={ViewState.PROFILE} icon={User} label="Profile" />
      </div>
    </div>
  );
};

export default Layout;