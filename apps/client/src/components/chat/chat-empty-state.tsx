export function ChatEmptyState() {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-slate-200">
        👋
      </div>

      <h2 className="mt-5 text-base font-semibold text-slate-900">
        Comment pouvons-nous vous aider ?
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Décrivez votre problème. Votre message sera transmis
        directement au support informatique.
      </p>
    </div>
  );
}