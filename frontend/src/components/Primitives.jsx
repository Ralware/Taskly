export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between gap-6 mb-8">
      <div>
        <h1 className="font-display text-4xl tracking-tight font-medium text-[#F2F2F2]">{title}</h1>
        {subtitle && <p className="text-sm text-[#A1A1AA] mt-2 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="border border-dashed border-[#1f1f22] rounded-xl py-16 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-[#0A0A0A] border border-[#1f1f22] mx-auto flex items-center justify-center mb-4">
          <Icon strokeWidth={1.5} className="w-5 h-5 text-[#71717A]" />
        </div>
      )}
      <div className="font-display text-lg text-[#F2F2F2]">{title}</div>
      {description && <div className="text-sm text-[#71717A] mt-1 max-w-md mx-auto">{description}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
