import { createTheme } from '@astral/ui/theme';

const brandPalette = {
  primary: {
    900: '#009E71',
    800: '#00B07E',
    700: '#2CC89B',
    600: '#41CDA5',
    500: '#56D3AF',
    400: '#6BD8B9',
    300: '#95E3CD',
    200: '#CAF1E6',
    100: '#E3F8F2',
  },
  secondary: {
    800: '#00BDB2',
  },
  brand: {
    800: '#00B07E',
    background: '#FAFBFC',
  },
};

export const theme = createTheme({
  palette: brandPalette,
});
