export function BrandLogo({ className = '' }: { className?: string }) {
  return <div className={`vf-brand ${className}`}><span className="vf-brand-mark" aria-hidden="true"><svg viewBox="0 0 42 42" fill="none"><path d="M10 31V11h13.2c4.1 0 6.6 2.3 6.6 5.7 0 2.5-1.4 4.4-3.8 5.2l5.6 9.1h-6.2l-4.9-8.3h-5.1V31H10Z" fill="#fff"/><path d="M15.4 18.4h7.1c1.2 0 2-.7 2-1.8s-.8-1.8-2-1.8h-7.1v3.6Z" fill="#0b1110"/><path d="M31.5 10.4v20.2" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round"/></svg></span><p>RealFrame<span>IA</span></p></div>;
}
