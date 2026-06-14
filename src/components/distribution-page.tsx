type DistributionPageProps = {
  title: string
  description?: string
}

export function DistributionPage({
  title,
  description = "Página en construcción.",
}: DistributionPageProps) {
  return (
    <section className="flex max-w-2xl flex-col gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </section>
  )
}
