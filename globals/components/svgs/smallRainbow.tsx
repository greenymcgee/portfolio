import React, { SVGAttributes } from 'react'

export function SmallRainbow(props: SVGAttributes<HTMLOrSVGElement>) {
  return (
    <svg fill="none" height={982} viewBox="0 0 60 982" width={60} {...props}>
      <path d="M0 0h12v982H0z" fill="#F25A5A" />
      <path d="M12 0h12v958H12z" fill="#FF9036" />
      <path d="M24 0h12v946H24z" fill="#FFED4B" />
      <path d="M36 0h12v925H36z" fill="#A0E156" />
      <path d="M48 0h12v896H48z" fill="#7EC5FF" />
    </svg>
  )
}
