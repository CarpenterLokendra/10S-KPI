import { motion } from 'framer-motion'

interface CardBackProps {
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  layoutId?: string
}

export default function CardBack({ onClick, className = '', size = 'md', layoutId }: CardBackProps) {
  const sizeMap = {
    sm: 'w-[60px] h-[84px]',
    md: 'w-[80px] h-[112px]',
    lg: 'w-[100px] h-[140px]',
  }

  return (
    <motion.div
      layoutId={layoutId}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        relative rounded-lg cursor-pointer select-none
        ${sizeMap[size]}
        bg-gradient-to-br from-blue-600 to-blue-800
        border-2 border-blue-900
        shadow-md hover:shadow-lg transition-shadow
        ${className}
      `}
    >
      {/* Card back pattern */}
      <div className="absolute inset-0 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-blue-300 opacity-40">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
            <rect x="5" y="5" width="10" height="10" rx="2" />
            <rect x="20" y="5" width="10" height="10" rx="2" />
            <rect x="5" y="20" width="10" height="10" rx="2" />
            <rect x="20" y="20" width="10" height="10" rx="2" />
          </svg>
        </div>
      </div>

      {/* Border accent */}
      <div className="absolute inset-1 rounded-lg border border-blue-500 opacity-30" />
    </motion.div>
  )
}
