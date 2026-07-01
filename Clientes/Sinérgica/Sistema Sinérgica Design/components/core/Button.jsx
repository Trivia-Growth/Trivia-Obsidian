import React from 'react';

/**
 * Botão Sinérgica — ação principal usa o gradiente da marca.
 */
export function Button({
  children,
  variant = 'primary',   // primary | navy | outline | ghost
  size = 'md',           // sm | md | lg
  pill = false,
  iconLeft = null,
  iconRight = null,
  disabled = false,
  onClick,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { padding: '8px 16px', font: 'var(--fs-sm)', gap: '6px' },
    md: { padding: '12px 24px', font: 'var(--fs-body)', gap: '8px' },
    lg: { padding: '16px 32px', font: 'var(--fs-lg)', gap: '10px' },
  }[size];

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizes.gap,
    padding: sizes.padding,
    fontFamily: 'var(--font-ui)',
    fontSize: sizes.font,
    fontWeight: 600,
    lineHeight: 1,
    border: '1px solid transparent',
    borderRadius: pill ? 'var(--r-pill)' : 'var(--r-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'transform var(--transition), filter var(--transition), background var(--transition)',
    whiteSpace: 'nowrap',
  };

  const variants = {
    primary: { background: 'var(--sin-gradient)', color: '#fff', boxShadow: 'var(--shadow-orange)' },
    navy:    { background: 'var(--sin-navy)', color: '#fff' },
    outline: { background: 'transparent', color: 'var(--sin-navy)', borderColor: 'var(--sin-line-cool)' },
    ghost:   { background: 'transparent', color: 'var(--sin-orange)' },
  }[variant];

  const [hover, setHover] = React.useState(false);
  const hoverFx = !disabled && hover
    ? (variant === 'outline'
        ? { borderColor: 'var(--sin-orange)', color: 'var(--sin-orange)' }
        : variant === 'ghost'
          ? { background: 'rgba(239,126,37,.10)' }
          : { filter: 'brightness(1.05)', transform: 'translateY(-1px)' })
    : {};

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants, ...hoverFx, ...style }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
