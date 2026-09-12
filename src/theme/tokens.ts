export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 12, md: 20, lg: 28 };
export const typography = { hero: 32, heading: 19, body: 16, small: 13 };
const light = {
  background: '#F7F8F2',
  surface: '#FFFFFF',
  surfaceAlt: '#EBF1E5',
  primary: '#315D41',
  onPrimary: '#FFFFFF',
  text: '#23382B',
  muted: '#59675C',
  border: '#D7E0D2',
  accent: '#8A5B21',
  accentSurface: '#FAEED6',
  seed: '#806041',
  leaf: '#578449',
};
export type Colors = typeof light;
export const palettes: { light: Colors; dark: Colors } = {
  light,
  dark: {
    background: '#142019',
    surface: '#1E2D23',
    surfaceAlt: '#293D2D',
    primary: '#B0D6A2',
    onPrimary: '#17321D',
    text: '#EDF3E8',
    muted: '#B3C2B4',
    border: '#425546',
    accent: '#E5C183',
    accentSurface: '#3B3324',
    seed: '#B68E63',
    leaf: '#8DB77B',
  },
};
