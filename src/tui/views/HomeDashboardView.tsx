import React, { FC } from 'react';
import { Box, useApp, useInput } from 'ink';
import { MasterDetailLayout } from '../components/MasterDetailLayout.js';
import { SearchFilter } from '../components/SearchFilter.js';
import { CategoryMenu } from '../components/CategoryMenu.js';
import { PreviewCard } from '../components/PreviewCard.js';
import { useRouter } from '../router/RouterContext.js';
import { ROUTE_CATEGORIES } from '../router/routes.js';
import { filterRouteCategories } from '../utils/fuzzy.js';
import type { RouteItem } from '../router/types.js';

export const HomeDashboardView: FC = () => {
    const { exit } = useApp();
    const { activePane, setActivePane, selectedItem, setSelectedItem, searchQuery, setSearchQuery, push } = useRouter();

    const filteredCategories = filterRouteCategories(ROUTE_CATEGORIES, searchQuery);

    useInput(
        (input) => {
            if (activePane === 'search') return;

            if (input === '/') {
                setActivePane('search');
            } else if (input === 'q') {
                exit();
            }
        },
        { isActive: activePane !== 'search' },
    );

    const handleSelectRoute = (item: RouteItem) => {
        push(item.id, item.label);
    };

    const sidebarNode = (
        <Box flexDirection="column">
            <SearchFilter
                query={searchQuery}
                onChange={setSearchQuery}
                isActive={activePane === 'search'}
                onDeactivate={() => setActivePane('sidebar')}
            />
            <CategoryMenu
                categories={filteredCategories}
                selectedItem={selectedItem}
                onHighlight={setSelectedItem}
                onSelect={handleSelectRoute}
                isActive={activePane === 'sidebar'}
            />
        </Box>
    );

    const contentNode = <PreviewCard item={selectedItem} />;

    return <MasterDetailLayout sidebar={sidebarNode} content={contentNode} />;
};
