import type { ProgramDeps } from '@/cli/deps.js';
import { Box, useApp, useInput } from 'ink';
import { FC, useState } from 'react';
import type { ViewState } from './types/index.js';
import { ComboView } from './views/ComboView.js';
import { DoctorView } from './views/DoctorView.js';
import { HomeView } from './views/HomeView.js';
import { InitView } from './views/InitView.js';
import { McpView } from './views/McpView.js';
import { PluginView } from './views/PluginView.js';
import { RuleView } from './views/RuleView.js';
import { SettingsView } from './views/SettingsView.js';
import { SkillView } from './views/SkillView.js';
import { StructureView } from './views/StructureView.js';
import { UpdateView } from './views/UpdateView.js';
import { WorkflowView } from './views/WorkflowView.js';

interface AppProps {
    deps?: ProgramDeps;
}

export const App: FC<AppProps> = ({ deps }) => {
    const { exit } = useApp();
    const [currentView, setCurrentView] = useState<ViewState>('home');

    useInput((input) => {
        if (input === 'q' && currentView === 'home') {
            exit();
        }
    });

    const handleSelectOption = (value: string) => {
        switch (value) {
            case 'exit':
                exit();
                break;
            case 'doctor':
                setCurrentView('doctor');
                break;
            case 'init':
                setCurrentView('init');
                break;
            case 'combo':
                setCurrentView('combo');
                break;
            case 'skill':
                setCurrentView('skill');
                break;
            case 'workflow':
                setCurrentView('workflow');
                break;
            case 'rule':
                setCurrentView('rule');
                break;
            case 'plugin':
                setCurrentView('plugin');
                break;
            case 'mcp':
                setCurrentView('mcp');
                break;
            case 'setting-vs':
                setCurrentView('setting-vs');
                break;
            case 'extensions-vs':
                setCurrentView('extensions-vs');
                break;
            case 'structure-generate':
                setCurrentView('structure-generate');
                break;
            case 'update':
                setCurrentView('update');
                break;
        }
    };

    const renderView = () => {
        switch (currentView) {
            case 'doctor':
                return <DoctorView onBack={() => setCurrentView('home')} />;
            case 'init':
                return <InitView deps={deps} onBack={() => setCurrentView('home')} />;
            case 'combo':
                return <ComboView deps={deps} onBack={() => setCurrentView('home')} />;
            case 'skill':
                return <SkillView deps={deps} onBack={() => setCurrentView('home')} />;
            case 'workflow':
                return <WorkflowView deps={deps} onBack={() => setCurrentView('home')} />;
            case 'rule':
                return <RuleView deps={deps} onBack={() => setCurrentView('home')} />;
            case 'plugin':
                return <PluginView deps={deps} onBack={() => setCurrentView('home')} />;
            case 'mcp':
                return <McpView deps={deps} onBack={() => setCurrentView('home')} />;
            case 'setting-vs':
            case 'extensions-vs':
                return <SettingsView deps={deps} onBack={() => setCurrentView('home')} />;
            case 'structure-generate':
                return <StructureView deps={deps} onBack={() => setCurrentView('home')} />;
            case 'update':
                return <UpdateView deps={deps} onBack={() => setCurrentView('home')} />;
            case 'home':
            default:
                return <HomeView onSelectOption={handleSelectOption} />;
        }
    };

    return (
        <Box flexDirection="column" padding={1}>
            {renderView()}
        </Box>
    );
};
