import React from 'react';

export interface ChecklistProps {
  /** rótulos dos itens — cada um vira uma cápsula com selo verde */
  items: string[];
  /** light = cápsulas brancas; dark = sobre fundo navy/foto */
  tone?: 'light' | 'dark';
  style?: React.CSSProperties;
}

/**
 * Lista de checagem em cápsulas — motivo recorrente dos posts da Sinérgica.
 * Use para destacar serviços/escopos cobertos (3 a 5 itens).
 */
export function Checklist(props: ChecklistProps): JSX.Element;
