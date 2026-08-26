import React from 'react';

interface GridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Editorial Grid (D-04)
 * A 12-column CSS grid system for the New Editorial aesthetic.
 */
export const Grid: React.FC<GridProps> = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-0 w-full max-w-[1440px] mx-auto ${className}`}>
      {children}
    </div>
  );
};

interface GridItemProps {
  children: React.ReactNode;
  cols?: number; // Span for large screens
  mdCols?: number; // Span for medium screens
  smCols?: number; // Span for mobile
  className?: string;
  borderRight?: boolean;
  borderBottom?: boolean;
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  cols = 1,
  mdCols,
  smCols = 4,
  className = '',
  borderRight = false,
  borderBottom = false,
}) => {
  const spanClass = `lg:col-span-${cols} ${mdCols ? `md:col-span-${mdCols}` : ''} col-span-${smCols}`;
  const borderClass = `${borderRight ? 'border-r border-black' : ''} ${borderBottom ? 'border-b border-black' : ''}`;

  return (
    <div className={`${spanClass} ${borderClass} p-6 lg:p-8 ${className}`}>
      {children}
    </div>
  );
};
