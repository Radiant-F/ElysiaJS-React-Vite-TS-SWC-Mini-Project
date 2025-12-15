const featureCards = [
  {
    title: "Authentication",
    detail:
      "Register, login, refresh tokens, and logout already wired on the backend.",
  },
  {
    title: "Todos API",
    detail: "CRUD endpoints with ownership checks and validation rules.",
  },
  {
    title: "Database ready",
    detail:
      "Postgres schema bootstrap runs on server start; repository layer abstracts queries.",
  },
  {
    title: "Next steps",
    detail:
      "Build forms, call the API, and add optimistic UI for todo updates.",
  },
];

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12">
        <header className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-2xl">
            🦊
          </div>
          <div>
            <p className="text-sm text-slate-400">Elysia + React + Tailwind</p>
            <h1 className="text-3xl font-semibold">Todo UI starter</h1>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm shadow-black/20"
            >
              <h2 className="text-lg font-semibold text-white">{card.title}</h2>
              <p className="mt-2 text-sm text-slate-200">{card.detail}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/20 via-slate-900 to-slate-950 p-6">
          <h2 className="text-xl font-semibold">Ready to build the UI?</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-100 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <p>
                Hook up auth forms against /auth/register, /auth/login, and
                /auth/refresh.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-300" />
              <p>
                Render the todo list with pagination, toggles, and inline
                editing.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-300" />
              <p>
                Add API base URL and token storage (access + refresh) in a
                client helper.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-300" />
              <p>
                Layer in optimistic updates and skeleton loading for a smooth
                feel.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
