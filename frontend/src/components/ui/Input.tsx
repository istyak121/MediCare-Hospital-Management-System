import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ className, label, error, icon, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{icon}</span>}
        <input
          className={cn(
            'w-full h-10 px-3 rounded-md border bg-white text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-bg-secondary',
            icon && 'pl-10',
            error ? 'border-danger' : 'border-border',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
