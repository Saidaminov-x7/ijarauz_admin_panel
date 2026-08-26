export function CountBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="inline-flex items-center justify-center min-w-[1.375rem] h-[1.375rem] px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold leading-none whitespace-nowrap">
      {count > 99 ? '99+' : count}
    </span>
  );
}
