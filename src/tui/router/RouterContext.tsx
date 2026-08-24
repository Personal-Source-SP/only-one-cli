import React, { createContext, FC, ReactNode, useContext, useState } from 'react';
import type { FocusPane, NavigationEntry, RouteItem, ViewState } from './types.js';
import { ROUTE_CATEGORIES, ALL_ROUTE_ITEMS } from './routes.js';

export interface RouterContextValue {
    currentRoute: NavigationEntry;
    history: NavigationEntry[];
    activePane: FocusPane;
    selectedItem: RouteItem;
    searchQuery: string;
    push: (view: ViewState, title?: string, params?: Record<string, unknown>) => void;
    pop: () => void;
    replace: (view: ViewState, title?: string, params?: Record<string, unknown>) => void;
    setActivePane: (pane: FocusPane) => void;
    setSelectedItem: (item: RouteItem) => void;
    setSearchQuery: (query: string) => void;
}

const defaultItem = ALL_ROUTE_ITEMS[0] || ROUTE_CATEGORIES[0]!.items[0]!;

const RouterContext = createContext<RouterContextValue | null>(null);

export const RouterProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [history, setHistory] = useState<NavigationEntry[]>([{ view: 'home', title: 'Dashboard' }]);
    const [activePane, setActivePane] = useState<FocusPane>('sidebar');
    const [selectedItem, setSelectedItem] = useState<RouteItem>(defaultItem);
    const [searchQuery, setSearchQuery] = useState('');

    const currentRoute = history[history.length - 1] || { view: 'home', title: 'Dashboard' };

    const push = (view: ViewState, title?: string, params?: Record<string, unknown>) => {
        const item = ALL_ROUTE_ITEMS.find((r) => r.id === view);
        const resolvedTitle = title || item?.label || view;
        setHistory((prev) => [...prev, { view, title: resolvedTitle, params }]);
        setActivePane('content');
    };

    const pop = () => {
        if (history.length > 1) {
            setHistory((prev) => prev.slice(0, -1));
            setActivePane('sidebar');
        }
    };

    const replace = (view: ViewState, title?: string, params?: Record<string, unknown>) => {
        const item = ALL_ROUTE_ITEMS.find((r) => r.id === view);
        const resolvedTitle = title || item?.label || view;
        setHistory((prev) => [...prev.slice(0, -1), { view, title: resolvedTitle, params }]);
    };

    return (
        <RouterContext.Provider
            value={{
                currentRoute,
                history,
                activePane,
                selectedItem,
                searchQuery,
                push,
                pop,
                replace,
                setActivePane,
                setSelectedItem,
                setSearchQuery,
            }}
        >
            {children}
        </RouterContext.Provider>
    );
};

export function useRouter(): RouterContextValue {
    const ctx = useContext(RouterContext);
    if (!ctx) {
        throw new Error('useRouter must be used within RouterProvider');
    }
    return ctx;
}
