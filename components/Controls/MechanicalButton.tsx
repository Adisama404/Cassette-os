import React from 'react';
import { useHaptics } from '../../hooks/useHaptics';

interface MechanicalButtonProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  label?: string;
  active?: boolean;
  color?: 'default' | 'red' | 'orange';
  className?: string;
  disabled?: boolean;
}

export const MechanicalButton: React.FC<MechanicalButtonProps> = ({ 
    onClick, 
    icon, 
    label, 
    active = false, 
    color = 'default',
    className = '',
    disabled = false
}) => {
  const { trigger } = useHaptics();

  const handleClick = (e: React.MouseEvent) => {
      if (disabled) return;
      trigger();
      if (onClick) onClick();
  };

  // Determine colors based on variant
  let faceColor = 'bg-stone-700';
  let sideColor = 'bg-stone-900';
  let activeLed = 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]';
  
  if (color === 'red') {
      faceColor = 'bg-red-800';
      sideColor = 'bg-red-950';
      activeLed = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]';
  } else if (color === 'orange') {
      faceColor = 'bg-orange-700';
      sideColor = 'bg-orange-950';
  }

  // CSS for the 3D depth effect
  // When not active (up): Has a bottom border/shadow representing the side
  // When active (down): The face translates down, hiding the side
  
  const depthClass = active 
    ? 'translate-y-[4px] shadow-[0_0_0_0_rgba(0,0,0,0.5)] border-b-0' 
    : 'hover:-translate-y-[1px] active:translate-y-[4px] border-b-[4px] active:border-b-0 shadow-[0_4px_6px_rgba(0,0,0,0.4)] active:shadow-none';

  const borderColor = color === 'red' ? 'border-red-950' : (color === 'orange' ? 'border-orange-950' : 'border-stone-950');

  return (
    <div className={`flex flex-col items-center gap-3 group ${className} ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
        
        {/* The physical button block */}
        <button 
            onClick={handleClick}
            disabled={disabled}
            className={`
                relative w-16 h-12 sm:w-20 sm:h-14 rounded-md 
                transition-all duration-75 ease-out
                ${faceColor} 
                ${borderColor}
                ${depthClass}
                flex items-center justify-center
                outline-none
            `}
        >
            {/* Top Shine/Gradient */}
            <div className="absolute inset-0 rounded-md bg-gradient-to-b from-white/10 to-black/10 pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20 rounded-t-md"></div>
            
            {/* Icon */}
            <div className={`relative z-10 text-stone-300 drop-shadow-md transform transition-transform ${active ? 'scale-95 text-white' : ''}`}>
                {icon}
            </div>

            {/* LED Indicator (Simulated) */}
            {active && (
                <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${activeLed} transition-all duration-300 animate-pulse-led`}></div>
            )}
        </button>

        {/* Panel Label - Printed on the chassis */}
        {label && (
            <span className="font-mono text-[10px] sm:text-[11px] font-bold text-stone-500 tracking-[0.2em] uppercase select-none drop-shadow-[0_1px_1px_rgba(0,0,0,1)] transition-colors group-hover:text-stone-400">
                {label}
            </span>
        )}
    </div>
  );
};
