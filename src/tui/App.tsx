import type { ProgramDeps } from '@/cli/deps.js';
import { Box, useApp, useInput } from 'ink';
import React, { FC } from 'react';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { RouterProvider, useRouter } from './router/RouterContext.js';
import { ComboView } from './views/ComboView.js';
import { DoctorView } from './views/DoctorView.js';
import { HomeView } from './views/HomeView.js';
import { InitView } from './views/InitView.js';
import { McpView } from './views/McpView.js';
import { RuleView } from './views/RuleView.js';
import { SettingsView } from './views/SettingsView.js';
import { SkillView } from './views/SkillView.js';
import { StructureView } from './views/StructureView.js';
import { UpdateView } from './views/UpdateView.js';
import { WorkflowView } from './views/WorkflowView.js';
import { GitView } from './views/GitView.js';

interface AppProps {
    deps?: ProgramDeps;
}

const AppInner: FC<AppProps> = ({ deps }) => {
    const { exit } = useApp();
    const { currentRoute, history, activePane, pop } = useRouter();

    const isHome = currentRoute.view === 'home';

    useInput((input, key) => {
        if (activePane === 'search') return;

        if (input === 'q' && isHome) {
            exit();
            return;
        }

        if (!isHome && (input === 'b' || key.escape)) {
            pop();
        }
    });

    const renderView = () => {
        switch (currentRoute.view) {
            case 'doctor':
                return <DoctorView onBack={pop} />;
            case 'init':
                return <InitView deps={deps} onBack={pop} />;
            case 'combo':
                return <ComboView deps={deps} onBack={pop} />;
            case 'skill':
                return <SkillView deps={deps} onBack={pop} />;
            case 'workflow':
                return <WorkflowView deps={deps} onBack={pop} />;
            case 'rule':
                return <RuleView deps={deps} onBack={pop} />;
            case 'mcp':
                return <McpView deps={deps} onBack={pop} />;
            case 'setting-vs':
            case 'extensions-vs':
                return <SettingsView deps={deps} onBack={pop} />;
            case 'git':
                return <GitView deps={deps} onBack={pop} />;
            case 'structure-generate':
                return <StructureView deps={deps} onBack={pop} />;
            case 'update':
                return <UpdateView deps={deps} onBack={pop} />;
            case 'home':
            default:
                return <HomeView />;
        }
    };

    const breadcrumbTrail = history.map((entry) => entry.title);

    const footerHints = isHome
        ? ['[Tab] Switch Pane', '[↑/↓] Navigate', '[/] Search', '[Enter] Open', '[q] Quit']
        : ['[Enter] Run', '[b/Esc] Back to Dashboard', '[q] Quit'];

    return (
        <Box flexDirection="column" padding={1}>
            <Header breadcrumb={breadcrumbTrail} />
            {renderView()}
            <Footer hints={footerHints} activePane={activePane} />
        </Box>
    );
};

export const App: FC<AppProps> = ({ deps }) => {
    return (
        <RouterProvider>
            <AppInner deps={deps} />
        </RouterProvider>
    );
};
