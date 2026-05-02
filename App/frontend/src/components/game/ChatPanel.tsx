import { useState, useRef, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: string
  isSystem?: boolean
}

interface ChatPanelProps {
  messages: ChatMessage[]
  onSendMessage?: (message: string) => void
  isOpen?: boolean
  className?: string
}

export default function ChatPanel({
  messages,
  onSendMessage,
  isOpen = true,
  className = '',
}: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    setIsSending(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    onSendMessage?.(input)
    setInput('')
    setIsSending(false)
  }

  if (!isOpen) return null

  return (
    <motion.div
      className={`card-base flex flex-col h-full ${className}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <h3 className="text-heading-sm font-rajdhani mb-4 pb-4 border-b border-gray-700">Chat</h3>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <p className="text-center text-text-muted text-sm py-6">No messages yet</p>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: idx * 0.05 }}
                className={`text-xs ${msg.isSystem ? 'text-center text-text-muted italic' : ''}`}
              >
                {!msg.isSystem && (
                  <>
                    <span className="font-semibold text-gold-500">{msg.username}:</span>{' '}
                  </>
                )}
                <span className="text-text-secondary break-words">{msg.message}</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-4 border-t border-gray-700">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          disabled={isSending}
          className="text-xs"
        />
        <Button
          onClick={handleSend}
          loading={isSending}
          disabled={!input.trim() || isSending}
          size="sm"
        >
          Send
        </Button>
      </div>
    </motion.div>
  )
}
