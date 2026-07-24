import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export interface PlaceholderPageProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features?: string[];
  className?: string;
}

export function PlaceholderPage({ icon, title, description, features, className }: PlaceholderPageProps) {
  return (
    <div className={cn('space-y-6 animate-fade-in', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
            <p className="text-sm text-text-muted">{description}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="flex flex-col items-center justify-center text-center px-6 py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-50 to-bg-tertiary flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              {icon}
            </div>
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">Coming in Phase 2</h3>
          <p className="text-text-muted max-w-md mb-8">
            This module is fully specified in the design document and will be implemented in the next phase.
            All backend entities and API endpoints are already built and ready.
          </p>
          {features && features.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full mb-8">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-text-secondary bg-bg-secondary rounded-md px-3 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-primary-600 font-medium hover:gap-3 transition-all cursor-pointer">
            <span>View API docs</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
