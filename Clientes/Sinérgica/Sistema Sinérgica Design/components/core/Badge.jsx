import React from 'react';

/**
 * Selo / eyebrow da Sinérgica. Usado como rótulo de seção (caixa-alta espaçada,
 * fonte Saira) ou como tag de status.
 */
export function Badge({
  children,
  variant = 'orange',   // orange | navy | success | neutral | outline
  size = 'md',          // sm | md
  uppercase = true,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { padding: '4px 10px', font: '10px' },
    md: { padding: '6px 14px', font: '11px' },
  }[size];

  const variants = {
    orange:  { background: 'var(--sin-gradient)', color: '#fff', border: '1px solid transparent' },
    navy:    { background: 'var(--sin-navy)', color: '#fff', border: '1px solid transparent' },
    success: { background: 'rgba(47,174,78,.14)', color: 'var(--sin-success)', border: '1px solid rgba(47,174,78,.35)' },
    neutral: { background: 'var(--sin-mist)', color: 'var(--sin-ink-2)', border: '1px solid var(--sin-line)' },
    outline: { background: 'transparent', color: 'var(--sin-amber)', border: '1px solid rgba(247,166,0,.45)' },
  }[variant];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: 'var(--font-brand)',
        fontSize: sizes.font,
        fontWeight: 600,
        letterSpacing: uppercase ? 'var(--ls-label)' : '0.02em',
        textTransform: uppercase ? 'uppercase' : 'none',
        borderRadius: 'var(--r-pill)',
        padding: sizes.padding,
        lineHeight: 1,
        ...variants,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
