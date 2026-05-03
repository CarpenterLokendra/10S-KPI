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
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)',
        borderRadius: '6px',
        border: '2px solid #1e40af',
      }}>
      <motion.div
        layoutId={layoutId}
        className="w-full h-full flex items-center justify-center"
        style={{
          background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
        }}>
        {/* Decorative border pattern */}
        <div className="absolute inset-2 border-2 border-blue-300 rounded opacity-40" />

        {/* Card back branding */}
        <div className="text-center z-10">
          <div style={{ color: '#fbbf24', fontSize: '20px', fontWeight: 'bold', fontFamily: 'Rajdhani', letterSpacing: '2px' }}>
            10S
          </div>
          <div style={{ color: '#fbbf24', fontSize: '12px', marginTop: '2px' }}>
            ♠ ♥ ♦ ♣
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
