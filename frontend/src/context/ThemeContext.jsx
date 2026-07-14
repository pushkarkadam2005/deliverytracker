import React, { createContext, useState, useMemo, useContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

export const CustomThemeProvider = ({ children }) => {
  // Check localStorage or default to light mode
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'light';
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', nextMode);
          return nextMode;
        });
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#2563EB', // Enterprise royal blue
            dark: '#1D4ED8',
            light: '#60A5FA',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#F59E0B', // Logistics cargo gold
            dark: '#D97706',
            light: '#FBBF24',
            contrastText: '#FFFFFF',
          },
          background: {
            default: mode === 'light' ? '#F8FAFC' : '#0B0F19', // Premium corporate dark background
            paper: mode === 'light' ? '#FFFFFF' : '#151E33', // Sleek navy paper
          },
          text: {
            primary: mode === 'light' ? '#0F172A' : '#F8FAFC',
            secondary: mode === 'light' ? '#475569' : '#94A3B8',
          },
          divider: mode === 'light' ? '#E2E8F0' : '#1E293B',
        },
        typography: {
          fontFamily: "'Inter', sans-serif",
          h4: { fontWeight: 800, letterSpacing: '-0.025em' },
          h5: { fontWeight: 800, letterSpacing: '-0.021em' },
          h6: { fontWeight: 700, letterSpacing: '-0.015em' },
          subtitle1: { fontWeight: 600 },
          subtitle2: { fontWeight: 600 },
          button: { textTransform: 'none', fontWeight: 700 },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                boxShadow: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(37,99,235,0.15)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                borderRadius: 16,
                border: mode === 'light' ? '1px solid #E2E8F0' : '1px solid #1E293B',
                boxShadow: mode === 'light' 
                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: mode === 'light'
                    ? '0 12px 20px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    : '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
};
