export const root = {

  '--color-background':           '#f3f4f1',
  '--color-background-gradient':  '#f3f4f1',
  '--color-surface':              '#fafafa',
  '--color-surface-2':            '#e5e6e3',


  '--color-foreground':           '#3b3b3b',
  '--color-muted-foreground':     '#444444',
  '--color-subtle-foreground':    '#676866',


  '--color-accent':               '#77ac22',
  '--color-accent-subtle':        '#dbecbb',


  '--color-primary':              '#86c322',
  '--color-primary-foreground':   '#191919',


  '--color-border':               'rgba(211, 211, 209, 0.27)',
  '--color-border-strong':        '#628c20',
  '--color-border-subtle':        'rgba(211, 211, 209, 0.27)',
  '--color-border-medium':        '#b3b4b1',
  '--color-border-primary':       '#628c20',
  '--color-border-icon':          '#b3b4b1',
} as const;

export const dark = {

  '--color-background':           '#0c0c0c',
  '--color-background-gradient':  '#212121',
  '--color-surface':              '#191919',
  '--color-surface-2':            '#3b3b3b',


  '--color-foreground':           '#fafafa',
  '--color-muted-foreground':     '#e5e6e3',
  '--color-subtle-foreground':    '#cdcecb',


  '--color-accent':               '#b9ff49',
  '--color-accent-subtle':        '#33401c',


  '--color-primary':              '#b9ff49',
  '--color-primary-foreground':   '#212121',

  '--color-border':               '#676866',
  '--color-border-strong':        '#b9ff49',
  '--color-border-subtle':        '#444444',
  '--color-border-medium':        '#676866',
  '--color-border-primary':       '#b9ff49',
  '--color-border-icon':          '#fafafa',
} as const;

/**
 * TypeScript mirror of app.css — intentional duplicate source of truth.
 *
 * PURPOSE:
 *   Server-side code cannot import or
 *   evaluate a .css file at runtime. 
 *
 *   This file exports the same design tokens so any server-side module can
 *   import them as plain TypeScript values.
 * 
 *   This file is an intentional duplicate of app.css and is meant to stay in
 *   sync with it. The structure, grouping comments, and CSS variable names are
 *   mirrored as closely as possible so that diffs between the two files are
 *   immediately obvious to humans and LLMs alike.
 *
 *   Whenever app.css design tokens are updated, update this file to match.
 *
 * 
**/
export const cssTokens = { root, dark } as const;
export type CssTokenKey = keyof typeof root;
