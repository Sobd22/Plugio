import React from 'react';
import type { TabIcon as TabIconType } from '../core/plugin-system/types';

interface TabIconProps {
  icon?: TabIconType;
  className?: string;
}

export const TabIcon: React.FC<TabIconProps> = ({ icon, className = '' }) => {
  if (!icon) return null;
  
  const size = icon.size || 16;
  
  switch (icon.type) {
    case 'svg':
      return (
        <div 
          className={`tab-icon svg-icon ${className}`}
          style={{ 
            width: size, 
            height: size,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          dangerouslySetInnerHTML={{ __html: icon.content }}
        />
      );
      
    case 'url':
      return (
        <img 
          src={icon.content}
          alt="Tab icon"
          className={`tab-icon url-icon ${className}`}
          style={{ 
            width: size, 
            height: size,
            objectFit: 'contain'
          }}
          onError={(e) => {
            console.warn(`Failed to load tab icon: ${icon.content}`);
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
      
    case 'emoji':
    default:
      return (
        <span 
          className={`tab-icon emoji-icon ${className}`}
          style={{ 
            fontSize: size,
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon.content}
        </span>
      );
  }
};
