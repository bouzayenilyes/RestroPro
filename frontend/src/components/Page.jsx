import React from 'react'

export default function Page({children, className = 'px-4 py-3'}) {
  return (
    <div className={className}>{children}</div>
  )
}
