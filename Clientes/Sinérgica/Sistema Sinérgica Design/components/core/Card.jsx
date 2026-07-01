import React from 'react';

/**
 * Cartão de superfície da Sinérgica — branco, cantos generosos e sombra fria.
 * Variante `dark` para blocos institucionais sobre navy.
 */
export function Card({
  children,
  variant = 'light',   // light | dark | gradient
  pad = 'md',          // sm | md | lg
  style = {},
  ...rest
}) {
  const pads = { sm: 'var(--sp-5)', md: 'var(--sp-8)', lg: 'var(--sp-10)' }[pad];
  const variants = {
    light:    { background: '#fff', color: 'var(--sin-ink)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--sin-line)' },
    dark:     { background: 'var(--sin-navy)', color: 'var(--sin-ink-on-dark)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--sin-navy-soft)' },
    gradient: { background: 'var(--sin-gradient)', color: '#fff', boxShadow: 'var(--shadow-orange)', border: '1px solid transparent' },
  }[variant];

  return (
    <div
      style={{
        borderRadius: 'var(--r-lg)',
        padding: pads,
        fontFamily: 'var(--font-ui)',
        ...variants,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
