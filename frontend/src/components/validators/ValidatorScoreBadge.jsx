import React from 'react';

const getScoreConfig = (score) => {
  if (score === null || score === undefined) {
    return {
      bgColor: 'rgba(136, 136, 136, 0.15)',
      borderColor: 'rgba(136, 136, 136, 0.3)',
      textColor: '#888888'
    };
  }
  if (score >= 90) {
    return {
      bgColor: 'rgba(0, 255, 136, 0.15)',
      borderColor: 'rgba(0, 255, 136, 0.4)',
      textColor: '#00ff88'
    };
  }
  if (score >= 70) {
    return {
      bgColor: 'rgba(255, 170, 0, 0.15)',
      borderColor: 'rgba(255, 170, 0, 0.4)',
      textColor: '#ffaa00'
    };
  }
  return {
    bgColor: 'rgba(255, 68, 68, 0.15)',
    borderColor: 'rgba(255, 68, 68, 0.4)',
    textColor: '#ff4444'
  };
};

export default function ValidatorScoreBadge({ score }) {
  const config = getScoreConfig(score);
  const displayScore = score !== null && score !== undefined ? Math.round(score) : '—';

  return (
    <span
      className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-sm font-bold font-mono min-w-[40px]"
      style={{
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        color: config.textColor
      }}
    >
      {displayScore}
    </span>
  );
}
