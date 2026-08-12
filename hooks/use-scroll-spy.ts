import { useEffect, useRef, type RefObject } from "react"

export function useScrollSpy({
  root,
  slots,
  ids,
  enabled,
  settle = 0,
  onVisible,
}: {
  root: RefObject<HTMLElement | null>
  slots: RefObject<Map<string, HTMLElement>>
  ids: string[]
  enabled: boolean
  settle?: number
  onVisible: (id: string) => void
}) {
  const onVisibleRef = useRef(onVisible)
  useEffect(() => {
    onVisibleRef.current = onVisible
  })

  const key = ids.join("|")

  useEffect(() => {
    const container = root.current
    if (!enabled || !container) return
    const order = key.split("|")
    let frame = 0
    let timer = 0
    let last = ""

    const measure = () => {
      frame = 0
      timer = 0
      const line = container.getBoundingClientRect().top + container.clientHeight * 0.3
      let current = order[0]
      for (const id of order) {
        const element = slots.current.get(id)
        if (!element) continue
        if (element.getBoundingClientRect().top > line) break
        current = id
      }
      if (!current || current === last) return
      last = current
      onVisibleRef.current(current)
    }

    const onScroll = settle
      ? () => {
          window.clearTimeout(timer)
          timer = window.setTimeout(measure, settle)
        }
      : () => {
          if (!frame) frame = requestAnimationFrame(measure)
        }

    container.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      container.removeEventListener("scroll", onScroll)
      if (frame) cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [root, slots, key, enabled, settle])
}
