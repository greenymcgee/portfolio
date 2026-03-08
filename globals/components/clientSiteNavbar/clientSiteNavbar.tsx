'use client'
import { usePathname } from 'next/navigation'

import { SiteNavbar } from '../siteNavbar'

/**
 * This is a client-side wrapper for the SiteNavbar.
 *
 * @returns {JSX} JSX
 */
export function ClientSiteNavbar() {
  const pathname = usePathname()

  return <SiteNavbar pathname={pathname} />
}
