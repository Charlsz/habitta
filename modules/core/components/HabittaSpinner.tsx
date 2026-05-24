import Image from 'next/image';

interface HabittaSpinnerProps {
  /** Diameter in px — default 24 */
  size?: number;
  className?: string;
}

/**
 * Reusable loading indicator using /habitta_monochrome.png.
 * Combines a slow rotation with a subtle pulse for a polished feel.
 */
export function HabittaSpinner({ size = 24, className = '' }: HabittaSpinnerProps) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label="Cargando"
    >
      <Image
        src="/habitta_monochrome.png"
        alt="Cargando"
        width={size}
        height={size}
        className="habitta-spinner"
        style={{ objectFit: 'contain' }}
        priority
      />
    </span>
  );
}
