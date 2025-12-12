interface LogoProps {
  size?: number;
  showText?: boolean;
  colorScheme?: 'green' | 'pink' | 'orange' | 'gray' | 'blue' | 'yellow' | 'purple' | 'brown' | 'ivory' | 'green1' | 'green2' | 'green3' | 'ivory1' | 'ivory2' | 'ivory3' | 'gray1' | 'gray2' | 'gray3';
}

export function Logo({ size = 160, showText = true, colorScheme = 'green2' }: LogoProps) {
  // Color schemes
  const colors = {
    green: {
      light: '#C8E6C9',
      medium: '#81C784',
      deep: '#4CAF50'
    },
    pink: {
      light: '#F8BBD0',
      medium: '#F06292',
      deep: '#EC407A'
    },
    orange: {
      light: '#FFE0B2',
      medium: '#FFB74D',
      deep: '#FF9800'
    },
    gray: {
      light: '#E0E0E0',
      medium: '#9E9E9E',
      deep: '#616161'
    },
    blue: {
      light: '#BBDEFB',
      medium: '#64B5F6',
      deep: '#2196F3'
    },
    yellow: {
      light: '#FFF9C4',
      medium: '#FDD835',
      deep: '#F9A825'
    },
    purple: {
      light: '#E1BEE7',
      medium: '#BA68C8',
      deep: '#8E24AA'
    },
    brown: {
      light: '#D7CCC8',
      medium: '#A1887F',
      deep: '#6D4C41'
    },
    ivory: {
      light: '#F5F5DC',
      medium: '#D4C5A9',
      deep: '#B8A588'
    },
    // Green variations
    green1: {
      light: '#E8F5E9',
      medium: '#A5D6A7',
      deep: '#66BB6A'
    },
    green2: {
      light: '#C8E6C9',
      medium: '#81C784',
      deep: '#4CAF50'
    },
    green3: {
      light: '#A5D6A7',
      medium: '#66BB6A',
      deep: '#388E3C'
    },
    // Ivory variations
    ivory1: {
      light: '#FEFEF8',
      medium: '#F0EBD8',
      deep: '#D9CDB3'
    },
    ivory2: {
      light: '#F5F5DC',
      medium: '#D4C5A9',
      deep: '#B8A588'
    },
    ivory3: {
      light: '#E8E0CC',
      medium: '#C9B896',
      deep: '#A89368'
    },
    // Gray variations
    gray1: {
      light: '#F5F5F5',
      medium: '#D6D6D6',
      deep: '#AFAFAF'
    },
    gray2: {
      light: '#E0E0E0',
      medium: '#9E9E9E',
      deep: '#616161'
    },
    gray3: {
      light: '#BDBDBD',
      medium: '#757575',
      deep: '#424242'
    }
  };

  const currentColors = colors[colorScheme];

  return (
    <div className="flex items-center gap-2">
      <svg 
        width={size} 
        height={size * 0.7} 
        viewBox="0 0 140 98" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Large Rounded Rectangle - Light */}
        <rect 
          x="15" 
          y="18" 
          width="70" 
          height="70" 
          fill={currentColors.light}
          opacity="0.85"
          rx="20"
        />
        
        {/* Medium Rounded Rectangle - Medium */}
        <rect 
          x="35" 
          y="12" 
          width="58" 
          height="58" 
          fill={currentColors.medium}
          opacity="0.75"
          rx="18"
        />
        
        {/* Small Rounded Rectangle - Deep */}
        <rect 
          x="55" 
          y="28" 
          width="46" 
          height="46" 
          fill={currentColors.deep}
          opacity="0.8"
          rx="16"
        />
      </svg>
      
      {showText && (
        <span 
          className="text-[#2d3436] [font-family:var(--font-playfair-display)]"
          style={{ 
            fontSize: size * 0.42,
            fontWeight: 700,
            letterSpacing: '-0.03em'
          }}
        >
          Overlap
        </span>
      )}
    </div>
  );
}

