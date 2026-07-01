import React from 'react';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'orange' | 'navy' | 'success' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  /** caixa-alta com tracking de label (padrão true) */
  uppercase?: boolean;
  style?: React.CSSProperties;
}

/**
 * Selo / eyebrow da Sinérgica — rótulo de seção em caixa-alta (Saira) ou tag de status.
 */
export function Badge(props: BadgeProps): JSX.Element;
