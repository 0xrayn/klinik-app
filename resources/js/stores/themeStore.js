import { create } from 'zustand';

const applyTheme = (theme) => {
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
};

const getInitialTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initial = getInitialTheme();
applyTheme(initial);

const useTheme = create((set, get) => ({
    theme: initial,
    toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ theme: next });
    },
    setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
    },
}));

export default useTheme;
