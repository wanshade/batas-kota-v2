"use client"

import { useEffect, useState } from "react"

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    // Remove any bis_skin_checked attributes that might be added by browser extensions
    const elementsWithBis = document.querySelectorAll('[bis_skin_checked]')
    elementsWithBis.forEach(el => {
      el.removeAttribute('bis_skin_checked')
    })
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}