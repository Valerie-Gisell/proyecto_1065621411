export default function Logo() {
  return (
    <div className="inline-flex items-center gap-3 text-white">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-amber-300 text-lg font-bold text-slate-900 shadow-soft">
        GC
      </span>
      <div>
        <p className="font-semibold tracking-wide text-white">GoCash</p>
        <p className="text-[0.78rem] text-slate-300">Finanzas con visión emocional</p>
      </div>
    </div>
  );
}
