export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">CRM</p>
        <h1 className="mt-3 text-3xl font-black">Dashboard</h1>
        <p className="mt-3 text-muted-foreground">
          Base del panel interno. Aqui se agregaran metricas, accesos rapidos y resumenes operativos.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          ["Companias", "0", "Modulo preparado para la siguiente rama."],
          ["Publicaciones", "0", "El blog se conectara al API."],
          ["Usuarios", "1", "Super admin creado por seed."]
        ].map(([label, value, description]) => (
          <article key={label} className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-bold text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-black text-primary">{value}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
