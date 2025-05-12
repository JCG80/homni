
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    checkIfMobile() // Initial check
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile)
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Fallback to viewport-based detection for SSR if needed
  if (isMobile === undefined && typeof window !== 'undefined') {
    return window.innerWidth < MOBILE_BREAKPOINT
  }

  return !!isMobile
}
