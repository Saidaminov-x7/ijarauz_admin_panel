import React from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  as?: React.ElementType;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm',
  ghost: 'bg-transparent text-app hover:bg-gray-100 dark:hover:bg-white/5',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'bg-transparent border border-app text-app hover:bg-gray-50 dark:hover:bg-white/5',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 min-w-fit',
  md: 'h-10 px-4 text-sm gap-2 min-w-fit',
  lg: 'h-12 px-6 text-base gap-2 min-w-fit',
  icon: 'h-9 w-9 p-0 justify-center shrink-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', as: Component = 'button', children, ...props }, ref) => {
    const Comp: any = Component;
    return (
      <Comp
        ref={ref}
        className={[
          'inline-flex items-center justify-center rounded-xl font-semibold whitespace-nowrap transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        <span className="truncate flex items-center gap-1.5">{children}</span>
      </Comp>
    );
  },
);
Button.displayName = 'Button';
