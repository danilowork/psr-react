import ThemedCssFunction, { css } from './styled-components'

export const breakpoints = { small: 0,
                             medium: 768,
                             large: 1024,
                             xlarge: 1200,
                             xxlarge: 1440 };

export const mediaMax = Object.keys(breakpoints).reduce((acc, label) => {
  acc[label] = (first: any, ...args: any[]) => css`
    @media (max-width: ${breakpoints[label]}px) {
      ${css(first, ...args)}
    }
  `
  return acc
}, {} as {[size: string]: (_: any) => any});

export const mediaMin = Object.keys(breakpoints).reduce((acc, label) => {
  acc[label] = (first: any, ...args: any[]) => css`
    @media (min-width: ${breakpoints[label]}px) {
      ${css(first, ...args)}
    }
  `
  return acc
}, {} as {[size: string]: (_: any) => any});

type MemberType = 'althelet' | 'coach'
interface MemberTheme {
  primaryColor: string
}
type MemberThemes = Record<MemberType, MemberTheme>;

export const themes = {
  althelet: {
    primaryColor: '#ff4f51'
  },
  coach: {
    primaryColor: '#008cd8'
  }
}

export default interface ThemeInterface {
  breakpoints: { string: number },
  mediaMax: (bp: string) => (_: any) => any
  mediaMin: (bp: string) => (_: any) => any
  themes: MemberThemes
}