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
        relative cursor-default select-none overflow-hidden
        ${w} ${h}
        bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950
        border-2 border-slate-800
        shadow-card
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{ borderRadius: '14px' }}
    >
      {/* Subtle pattern background */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="diamondPattern" x="20" y="20" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M10 0 L20 10 L10 20 L0 10 Z" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
          </pattern>
        </defs>
        <rect width="100" height="140" fill="url(#diamondPattern)" />
      </svg>

      {/* Center branding - "10S ♠" */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="font-rajdhani font-bold text-gold-500/70 text-lg leading-none">10S</span>
        <span className="text-gold-500/50 text-base leading-none">♠</span>
      </div>

      {/* Corner pips */}
      <div className="absolute top-2 left-2 text-white text-opacity-30 text-sm leading-none">◆</div>
      <div className="absolute bottom-2 right-2 rotate-180 text-white text-opacity-30 text-sm leading-none">◆</div>
    </motion.div>
  )
}
