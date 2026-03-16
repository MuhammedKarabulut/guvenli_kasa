import { useState, useRef, useEffect } from 'react';

type Props = {
  length?: number;
  onSubmit: (pin: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
};

export function PinInput({ length = 6, onSubmit, label = 'PIN', error, disabled }: Props) {
  const [pin, setPin] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pin.length === length) {
      onSubmit(pin);
    }
  }, [pin, length, onSubmit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, length);
    setPin(v);
  };

  const dots = pin.length;
  const displayValue = pin.replace(/\d/g, '•');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {label && (
        <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{label}</label>
      )}
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={length}
        value={pin}
        onChange={handleChange}
        disabled={disabled}
        autoFocus
        aria-label={label}
        style={{
          width: '100%',
          padding: '1rem 1.25rem',
          fontSize: '1.5rem',
          letterSpacing: '0.5em',
          textAlign: 'center',
          background: 'var(--surface)',
          border: `2px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          color: 'var(--text)',
          outline: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: i < dots ? 'var(--accent)' : 'var(--border)',
            }}
          />
        ))}
      </div>
      {error && (
        <span style={{ fontSize: '0.875rem', color: 'var(--danger)' }}>{error}</span>
      )}
    </div>
  );
}
