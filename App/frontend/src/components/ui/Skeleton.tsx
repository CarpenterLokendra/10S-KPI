import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  count?: number
}

export function SkeletonLine({ className = 'h-4 w-full' }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-bg-elevated via-gray-700 to-bg-elevated rounded ${className}`}
      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{ backgroundSize: '200% 100%' }}
    />
  )
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-bg-surface rounded-lg border border-gray-700 p-4 ${className}`}>
      <SkeletonLine className="h-6 w-1/2 mb-3" />
      <SkeletonLine className="h-4 w-full mb-2" />
      <SkeletonLine className="h-4 w-4/5" />
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="bg-bg-surface rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-bg-elevated px-6 py-4 border-b border-gray-700 grid grid-cols-4 gap-4">
        <SkeletonLine className="h-4" />
        <SkeletonLine className="h-4" />
        <SkeletonLine className="h-4" />
        <SkeletonLine className="h-4" />
      </div>

      {/* Rows */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="px-6 py-4 border-b border-gray-700 grid grid-cols-4 gap-4"
        >
          <SkeletonLine className="h-4" />
          <SkeletonLine className="h-4" />
          <SkeletonLine className="h-4" />
          <SkeletonLine className="h-4" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonAvatar({ className = 'w-12 h-12' }: SkeletonProps) {
  return <SkeletonLine className={`rounded-full ${className}`} />
}
