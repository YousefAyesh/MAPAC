export type NavItem = {
  label: string
  href: string
}

/** Home is the logo, so it is not repeated as a nav item. */
export const primaryNav: NavItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Elections', href: '/elections' },
  { label: 'Get Involved', href: '/get-involved' },
  { label: 'News', href: '/news' },
  { label: 'Donate', href: '/donate' },
  { label: 'Contact', href: '/contact' },
]

export const footerNav: NavItem[] = [
  ...primaryNav,
  { label: 'Privacy Policy', href: '/privacy-policy' },
]
