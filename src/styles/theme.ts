import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e63946', // Rouge de Car Parts France
      light: '#ff6b6b',
      dark: '#b71c1c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1d3557', // Bleu foncé pour contraste
      light: '#4f5b62',
      dark: '#000a12',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
    },
    grey: {
      100: '#f8f9fa',
      200: '#e9ecef',
      300: '#dee2e6',
      400: '#ced4da',
      500: '#adb5bd',
      600: '#6c757d',
      700: '#495057',
      800: '#343a40',
      900: '#212529',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '0em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.35,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.75,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.57,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollBehavior: 'smooth',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: 'none',
          fontWeight: 600,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #e63946 30%, #ff6b6b 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #d32f2f 30%, #e63946 90%)',
          },
        },
        outlinedPrimary: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 5px 20px rgba(0, 0, 0, 0.08)',
          borderRadius: 16,
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        },
        elevation4: {
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&.Mui-focused fieldset': {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          margin: '24px 0',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 24,
          paddingRight: 24,
          '@media (min-width: 600px)': {
            paddingLeft: 32,
            paddingRight: 32,
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.05)',
    '0 4px 8px rgba(0,0,0,0.05)',
    '0 6px 12px rgba(0,0,0,0.08)',
    '0 8px 16px rgba(0,0,0,0.08)',
    '0 10px 20px rgba(0,0,0,0.1)',
    '0 12px 24px rgba(0,0,0,0.1)',
    '0 14px 28px rgba(0,0,0,0.12)',
    '0 16px 32px rgba(0,0,0,0.12)',
    '0 18px 36px rgba(0,0,0,0.14)',
    '0 20px 40px rgba(0,0,0,0.14)',
    '0 22px 44px rgba(0,0,0,0.16)',
    '0 24px 48px rgba(0,0,0,0.16)',
    '0 26px 52px rgba(0,0,0,0.18)',
    '0 28px 56px rgba(0,0,0,0.18)',
    '0 30px 60px rgba(0,0,0,0.2)',
    '0 32px 64px rgba(0,0,0,0.2)',
    '0 34px 68px rgba(0,0,0,0.22)',
    '0 36px 72px rgba(0,0,0,0.22)',
    '0 38px 76px rgba(0,0,0,0.24)',
    '0 40px 80px rgba(0,0,0,0.24)',
    '0 42px 84px rgba(0,0,0,0.26)',
    '0 44px 88px rgba(0,0,0,0.26)',
    '0 46px 92px rgba(0,0,0,0.28)',
    '0 48px 96px rgba(0,0,0,0.28)',
  ],
});

export default theme;
