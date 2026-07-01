import React from 'react';

export interface ButtonProps {
  children?: React.ReactNode;
  /** primary = gradiente da marca (ação principal); navy = institucional; outline; ghost */
  variant?: 'primary' | 'navy' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  /** cantos totalmente arredondados (cápsula) */
  pill?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

/**
 * Botão de ação da Sinérgica.
 * Use `primary` (gradiente laranja) para a ação principal de uma tela; no máximo uma por bloco.
 * `navy` para ações institucionais secundárias; `outline`/`ghost` para terciárias.
 */
export function Button(props: ButtonProps): JSX.Element;
