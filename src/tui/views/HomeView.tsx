import { Box, Text } from 'ink';
import { FC } from 'react';
import { Footer } from '../components/Footer.js';
import { Header } from '../components/Header.js';
import { SelectMenu } from '../components/SelectMenu.js';
import { MAIN_MENU_ITEMS } from '../constants/index.js';

interface HomeViewProps {
    onSelectOption: (value: string) => void;
}

export const HomeView: FC<HomeViewProps> = ({ onSelectOption }) => {
    return (
        <Box flexDirection="column">
            <Header />
            <Text bold color="yellow">
                Main Dashboard:
            </Text>
            <SelectMenu items={MAIN_MENU_ITEMS} onSelect={(item) => onSelectOption(item.value)} />
            <Footer />
        </Box>
    );
};
