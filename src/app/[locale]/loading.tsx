import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="container py-12 space-y-12">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-surface-2" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
