import React, { forwardRef } from 'react';
import './GlassCard.css';

const GlassCard = forwardRef(({ children, className = '', style = {}, ...props }, ref) => {
  return (
    <div ref={ref} className={`glass-card ${className}`} style={style} {...props}>
      {children}
    </div>
  );
});

export default GlassCard;
