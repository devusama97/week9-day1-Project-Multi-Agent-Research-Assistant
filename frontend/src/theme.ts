'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#38bdf8',
            light: '#7dd3fc',
            dark: '#0284c7',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#818cf8',
            light: '#a5b4fc',
            dark: '#6366f1',
            contrastText: '#ffffff',
        },
        success: {
            main: '#34d399',
            light: '#6ee7b7',
            dark: '#059669',
        },
        error: {
            main: '#f87171',
            light: '#fca5a5',
            dark: '#dc2626',
        },
        warning: {
            main: '#fbbf24',
            light: '#fcd34d',
            dark: '#f59e0b',
        },
        background: {
            default: '#0c111d',
            paper: '#1e293b',
        },
        text: {
            primary: '#ffffff',
            secondary: '#94a3b8',
        },
    },
    typography: {
        fontFamily: 'var(--font-sans)',
        h1: {
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h3: {
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
        },
        h4: {
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
        },
        h5: {
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
        },
        h6: {
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
        },
        button: {
            fontWeight: 600,
            letterSpacing: '0.02em',
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 0 20px rgba(56, 189, 248, 0.15)',
        '0 0 30px rgba(56, 189, 248, 0.2)',
        '0 0 40px rgba(56, 189, 248, 0.25)',
        '0 20px 50px rgba(0, 0, 0, 0.5)',
        '0 25px 60px rgba(0, 0, 0, 0.6)',
        '0 30px 70px rgba(0, 0, 0, 0.7)',
        '0 35px 80px rgba(0, 0, 0, 0.8)',
        '0 40px 90px rgba(0, 0, 0, 0.9)',
        '0 45px 100px rgba(0, 0, 0, 1)',
        '0 50px 110px rgba(0, 0, 0, 1)',
        '0 55px 120px rgba(0, 0, 0, 1)',
        '0 60px 130px rgba(0, 0, 0, 1)',
        '0 65px 140px rgba(0, 0, 0, 1)',
        '0 70px 150px rgba(0, 0, 0, 1)',
        '0 75px 160px rgba(0, 0, 0, 1)',
        '0 80px 170px rgba(0, 0, 0, 1)',
        '0 85px 180px rgba(0, 0, 0, 1)',
        '0 90px 190px rgba(0, 0, 0, 1)',
        '0 95px 200px rgba(0, 0, 0, 1)',
    ],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: '#1e293b #0c111d',
                    '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                        width: 8,
                        height: 8,
                    },
                    '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
                        background: '#0c111d',
                    },
                    '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                        background: '#1e293b',
                        borderRadius: 4,
                    },
                    '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
                        background: '#334155',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '12px 24px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 20px rgba(56, 189, 248, 0.3)',
                    },
                },
                contained: {
                    boxShadow: '0 4px 14px 0 rgba(56, 189, 248, 0.4)',
                    '&:hover': {
                        boxShadow: '0 6px 20px rgba(56, 189, 248, 0.5)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: 16,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.3s ease',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(56, 189, 248, 0.5)',
                            },
                        },
                        '&.Mui-focused': {
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#38bdf8',
                                borderWidth: 2,
                            },
                        },
                    },
                },
            },
        },
        MuiCircularProgress: {
            styleOverrides: {
                root: {
                    animationDuration: '1.5s',
                },
                circle: {
                    strokeLinecap: 'round',
                },
            },
        },
        MuiList: {
            styleOverrides: {
                root: {
                    padding: 0,
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(56, 189, 248, 0.05)',
                    },
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    '&.gradient-text': {
                        background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    },
                },
            },
        },
    },
});
