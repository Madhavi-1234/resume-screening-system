export default function LoadingSkeleton() {
  return (
    <div className="grid gap-4">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="glass-panel h-28 animate-pulse bg-gradient-to-r from-white/70 to-slate-100 dark:from-white/5 dark:to-white/10"
        />
      ))}
    </div>
  );
}
