import { FC } from 'react';
import { HomeDashboardView } from './HomeDashboardView.js';

interface HomeViewProps {
    onSelectOption?: (value: string) => void;
}

export const HomeView: FC<HomeViewProps> = () => {
    return <HomeDashboardView />;
};
