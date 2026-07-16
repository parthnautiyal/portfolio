export default function ProjectSkeleton() {
  return (
    <div className="card-elevated flex flex-col justify-between p-5 animate-pulse">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
  )
}
