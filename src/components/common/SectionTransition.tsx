import React from 'react';
import { Box, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

interface SectionTransitionProps {
  variant?: 'wave' | 'angle' | 'curve' | 'gradient';
  color?: string;
  flipY?: boolean;
  height?: number;
}

const SectionTransition: React.FC<SectionTransitionProps> = ({
  variant = 'wave',
  color,
  flipY = false,
  height = 80
}) => {
  const theme = useTheme();
  const bgColor = color || theme.palette.background.default;
  
  const getTransitionPath = () => {
    switch (variant) {
      case 'wave':
        return (
          <path 
            d="M0,32L80,37.3C160,43,320,53,480,80C640,107,800,149,960,149.3C1120,149,1280,107,1360,85.3L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            fill={bgColor}
          />
        );
      case 'angle':
        return (
          <path 
            d="M0,0L1440,0L1440,320L0,320Z"
            fill={bgColor}
          />
        );
      case 'curve':
        return (
          <path 
            d="M0,224L1440,64L1440,320L0,320Z"
            fill={bgColor}
          />
        );
      case 'gradient':
      default:
        return (
          <>
            <defs>
              <linearGradient id="transitionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity="0.1" />
                <stop offset="50%" stopColor={theme.palette.primary.main} stopOpacity="0.05" />
                <stop offset="100%" stopColor={theme.palette.secondary.main} stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path 
              d="M0,160L1440,64L1440,320L0,320Z"
              fill={bgColor}
            />
          </>
        );
    }
  };

  const GradientOverlay = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height,
    background: variant === 'gradient' 
      ? `linear-gradient(to bottom, rgba(255,255,255,0) 0%, ${bgColor} 100%)`
      : 'transparent',
    zIndex: 1
  });

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      sx={{
        position: 'relative',
        width: '100%',
        height: height,
        transform: flipY ? 'rotate(180deg)' : 'none',
        marginTop: flipY ? -height/2 : 0,
        marginBottom: !flipY ? -height/2 : 0,
        zIndex: 1,
        pointerEvents: 'none'
      }}
    >
      {variant === 'gradient' ? (
        <GradientOverlay />
      ) : (
        <Box
          component="svg"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          {getTransitionPath()}
        </Box>
      )}
    </Box>
  );
};

export default SectionTransition;
