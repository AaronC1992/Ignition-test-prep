import type { ReactNode } from 'react'
import { SectionCard } from '../components/SectionCard'

export function GenericPage({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="page-stack">
      <SectionCard title={title} description={body} />
      {children}
    </div>
  )
}
