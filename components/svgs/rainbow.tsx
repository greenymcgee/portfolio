import React, { SVGAttributes } from 'react'

export function Rainbow(props: SVGAttributes<HTMLOrSVGElement>) {
  return (
    <svg fill="none" height={982} viewBox="0 0 120 982" width={120} {...props}>
      <path d="M0 0h24v982H0z" fill="#F25A5A" />
      <path d="M24 0h24v958H24z" fill="#FF9036" />
      <path d="M48 0h24v946H48z" fill="#FFED4B" />
      <path d="M72 0h24v925H72z" fill="#A0E156" />
      <path d="M96 0h24v896H96z" fill="#7EC5FF" />
    </svg>
  )
}
