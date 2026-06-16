import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, icon, actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="w-12 h-12 rounded-xl bg-bamboo-100 flex items-center justify-center text-bamboo-700">
              {icon}
            </div>
          )}
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink-800">{title}</h1>
            {subtitle && <p className="text-ink-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
      <div className="decoration-line mt-6" />
    </div>
  );
}
