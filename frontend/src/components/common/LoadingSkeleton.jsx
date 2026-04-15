import React from 'react';

const variantStyles = {
  text: {
    height: '1em',
    borderRadius: '4px'
  },
  card: {
    height: '120px',
    borderRadius: '8px'
  },
  chart: {
    height: '200px',
    borderRadius: '8px'
  }
};

export default function LoadingSkeleton({ 
  width = '100%', 
  height, 
  variant = 'text' 
}) {
  const baseStyle = variantStyles[variant] || variantStyles.text;
  const finalHeight = height || baseStyle.height;

  return (
    <div
      className="animate-shimmer"
      style={{
        width,
        height: finalHeight,
        borderRadius: baseStyle.borderRadius,
        backgroundColor: 'rgba(255, 255, 255, 0.03)'
      }}
    />
  );
}
