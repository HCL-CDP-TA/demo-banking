// hooks/usePageMeta.ts
import { useEffect } from "react"

export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    if (title) {
      document.title = title
    }
    if (description) {
      let descTag = document.querySelector("meta[name='description']")
      if (!descTag) {
        descTag = document.createElement("meta")
        descTag.setAttribute("name", "description")
        document.head.appendChild(descTag)
      }
      descTag.setAttribute("content", description)
    }
  }, [title, description])
}
