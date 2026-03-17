export default function PlaygroundPage() {
  return (
    <section className="py-16">
      <h2 className="section-heading animate-fade-up">Playground</h2>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        A space for small experiments, prototypes, and interactive demos. You
        can later showcase animations, microservices visualizations, or UI
        components you are exploring.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card-elevated p-4 text-sm text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            Sample widget
          </p>
          <p className="mt-2 text-xs">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis vitae
            elit euismod, consequat nulla at, molestie tortor.
          </p>
        </div>
        <div className="card-elevated p-4 text-sm text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            Future idea
          </p>
          <p className="mt-2 text-xs">
            Use this area to embed charts, visualizations, or step-by-step
            walkthroughs of interesting system designs.
          </p>
        </div>
      </div>
    </section>
  )
}

