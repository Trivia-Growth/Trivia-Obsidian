import React from 'react';

/**
 * Lista de checagem em cápsulas — motivo recorrente dos posts da Sinérgica
 * (Elétrica / Hidráulica / Estrutura, cada item com selo verde de confirmação).
 */
export function Checklist({
  items = [],
  tone = 'light',     // light | dark
  style = {},
  ...rest
}) {
  const dark = tone === 'dark';
  return (
    <ul
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        ...style,
      }}
      {...rest}
    >
      {items.map((label, i) => (
        <li
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 20px 12px 14px',
            borderRadius: 'var(--r-pill)',
            background: dark ? 'rgba(255,255,255,.10)' : '#fff',
            boxShadow: dark ? 'none' : 'var(--shadow-sm)',
            border: dark ? '1px solid rgba(255,255,255,.14)' : '1px solid var(--sin-line)',
            fontFamily: 'var(--font-ui)',
            fontSize: 'var(--fs-lg)',
            fontWeight: 500,
            color: dark ? 'var(--sin-ink-on-dark)' : 'var(--sin-ink)',
          }}
        >
          <span
            style={{
              flex: '0 0 auto',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--sin-success)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}
