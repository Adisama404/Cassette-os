import React, { createContext, useContext, useState, useEffect } from 'react';

export type SystemTheme = 'default' | 'blue-note' | 'grunge';

interface ThemeContextType {
    theme: SystemTheme;
    setTheme: (theme: SystemTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Load from local storage or default
    const [theme, setTheme] = useState<SystemTheme>(() => {
        const saved = localStorage.getItem('cassette-os-theme');
        return (saved as SystemTheme) || 'default';
    });

    useEffect(() => {
        localStorage.setItem('cassette-os-theme', theme);
        // We can also set a class on the body if we want global overrides outside of React
        document.body.className = `theme-${theme}`;
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
