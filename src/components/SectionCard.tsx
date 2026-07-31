import type { ReactNode } from 'react'

export function SectionCard({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <section className="section-card">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </section>
  )
}
