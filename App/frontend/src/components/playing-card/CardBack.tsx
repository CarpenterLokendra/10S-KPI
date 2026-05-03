import { motion } from 'framer-motion'

interface CardBackProps {
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  layoutId?: string
}

export default function CardBack({ onClick, className = '', size = 'md', layoutId }: CardBackProps) {
  const sizeMap = {
    sm: { w: 'w-[72px]', h: 'h-[100px]' },
    md: { w: 'w-[88px]', h: 'h-[124px]' },
    lg: { w: 'w-[104px]', h: 'h-[145px]' },
  }

  const { w, h } = sizeMap[size]

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        relative rounded-xl cursor-default select-none
        ${w} ${h}
        bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900
        border-2 border-blue-900
        shadow-card overflow-hidden
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* SVG pattern background - diamond grid */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="diamondPattern" x="20" y="20" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M10 0 L20 10 L10 20 L0 10 Z" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
          </pattern>
        </defs>
        <rect width="100" height="140" fill="url(#diamondPattern)" />
      </svg>

      {/* Inner frame border */}
      <div className="absolute inset-[4px] rounded-lg border-2 border-white border-opacity-25" />

      {/* Corner pips */}
      <div className="absolute top-2 left-2 text-white text-opacity-40 text-lg leading-none">◆</div>
      <div className="absolute bottom-2 right-2 rotate-180 text-white text-opacity-40 text-lg leading-none">◆</div>

      {/* Center accent circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white border-opacity-15 rounded-full" />
      </div>
    </motion.div>
  )
}
