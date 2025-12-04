import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    placeholder: '#666666',    // ← THIS FIXES PLACEHOLDERS IN LIGHT MODE
    inputBg: '#f8f8f8',
    border: '#ddd',
  },
  dark: {
    text: '#ffffff',
    placeholder: '#aaaaaa',
    inputBg: '#1a1a1a',
    border: '#444',
  },
};

export const useTheme = () => {
  const scheme = useColorScheme(); // 'light' or 'dark'
  return Colors[scheme] || Colors.light;
};