interface PageTitleProps {
  title: string
  /** Use 'h2' when the page already has an h1. */
  as?: "h1" | "h2"
}

// Page heading.
export default function PageTitle({ title, as: Heading = "h1" }: PageTitleProps) {
  return <Heading className="text-2xl font-medium tracking-tight text-foreground">{title}</Heading>
}
