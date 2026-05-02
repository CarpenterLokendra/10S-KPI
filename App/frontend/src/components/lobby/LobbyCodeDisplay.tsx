import { useState } from 'react'
import Button from '@/components/ui/Button'

interface LobbyCodeDisplayProps {
  code: string
  large?: boolean
}

export default function LobbyCodeDisplay({ code, large = false }: LobbyCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="text-center">
      {large ? (
        <>
          <p className="text-text-secondary text-sm mb-2">Lobby Code</p>
          <div className="bg-bg-elevated border-2 border-gold-500 rounded-lg p-6 mb-4">
            <p className="text-5xl font-rajdhani font-bold text-gold-500 tracking-widest">{code}</p>
          </div>
          <Button onClick={handleCopy} fullWidth variant="secondary">
            {copied ? '✓ Copied!' : 'Copy Code'}
          </Button>
        </>
      ) : (
        <div className="flex items-center gap-2 justify-center bg-bg-elevated px-4 py-2 rounded-lg border border-gold-500">
          <span className="font-mono text-lg font-bold text-gold-500">{code}</span>
          <button
            onClick={handleCopy}
            className="text-xs px-2 py-1 rounded bg-gold-500 text-bg-base hover:bg-gold-400 transition"
          >
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}
