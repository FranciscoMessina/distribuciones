import katex from "katex"

type Props = { math: string }

export function BlockMath({ math }: Props) {
  const html = katex.renderToString(math, { displayMode: true, throwOnError: false })
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

export function InlineMath({ math }: Props) {
  const html = katex.renderToString(math, { displayMode: false, throwOnError: false })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}
