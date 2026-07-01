import React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  variant?: 'light' | 'dark' | 'gradient';
  pad?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

/**
 * Cartão de superfície da Sinérgica — branco com sombra fria; `dark` (navy) para
 * blocos institucionais, `gradient` para destaques de ação.
 */
export function Card(props: CardProps): JSX.Element;
