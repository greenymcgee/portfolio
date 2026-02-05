'use client'

import { useState } from 'react'
import { ClipboardCopy } from 'lucide-react'

interface CodeBlockProps {
  code: string
}

export function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-md bg-gray-900">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <span className="text-xs text-gray-400">Terminal</span>
        <button
          aria-label="Copy to clipboard"
          className="text-gray-400 transition-colors hover:text-white"
          onClick={copyToClipboard}
          type="button"
        >
          {copied ? (
            <span className="text-xs text-green-400">Copied!</span>
          ) : (
            <ClipboardCopy size={16} />
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm text-gray-300">
        <code>{code}</code>
      </pre>
    </div>
  )
}
