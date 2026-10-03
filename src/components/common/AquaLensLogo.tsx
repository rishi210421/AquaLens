import React from 'react';

interface AquaLensLogoProps {
  className?: string;
  size?: number;
}

export const AquaLensLogo: React.FC<AquaLensLogoProps> = ({
  className = 'w-7 h-7',
}) => {
  return (
    <img
      src="/images/aqualens-logo.svg"
      alt="AquaLens logo"
      className={`inline-block object-contain shrink-0 select-none ${className}`}
      loading="eager"
      onError={(e) => {
        const target = e.currentTarget;
        if (target.src.endsWith('/images/aqualens-logo.svg')) {
          target.src = '/logo.svg';
        }
      }}
    />
  );
};
