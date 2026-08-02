interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-shimmer rounded-md bg-surface-strong ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card">
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-border">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-7 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
