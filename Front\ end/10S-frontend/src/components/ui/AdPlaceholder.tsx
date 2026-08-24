import { useEffect, useState } from 'react'
import { ADSTERRA_CONFIG, AD_SIZES } from '@/constants/adsterra'
import AdsterraFrame from './AdsterraFrame'

const CONSENT_KEY = 'cookie_consent_accepted'

interface AdPlaceholderProps {
  height?: string
  variant?: 'vertical' | 'horizontal' | 'banner'
  showGoAdFreeButton?: boolean
  onGoAdFree?: () => void
}

export default function AdPlaceholder({ height = '400px', variant = 'vertical', showGoAdFreeButton = false, onGoAdFree }: AdPlaceholderProps) {
  const [consentGiven, setConsentGiven] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(CONSENT_KEY) === 'true'
  })

  useEffect(() => {
    const handleConsentChange = () => {
      setConsentGiven(localStorage.getItem(CONSENT_KEY) === 'true')
    }

    window.addEventListener('cookie-consent-changed', handleConsentChange)
    return () => window.removeEventListener('cookie-consent-changed', handleConsentChange)
  }, [])

  const getHeight = () => {
    if (variant === 'banner') return '120px'
    if (variant === 'horizontal') return '300px'
    return height
  }

  const isBanner = variant === 'banner'
  const containerHeight = getHeight()

  const getAdConfig = () => {
    if (variant === 'banner') {
      return { key: ADSTERRA_CONFIG.bannerKey, ...AD_SIZES.banner }
    }
    return { key: ADSTERRA_CONFIG.sidebarKey, ...AD_SIZES.sidebar }
  }

  const adConfig = getAdConfig()

  // Show placeholder if ads disabled
  if (!ADSTERRA_CONFIG.isEnabled) {
    return (
      <div style={{
        width: '100%',
        height: containerHeight,
        backgroundColor: 'rgba(0,0,0,0)',
        border: '2px dashed rgba(240,180,41,0.3)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'rgba(240,180,41,0.5)',
        fontSize: '12px',
        fontWeight: '600',
        textAlign: 'center',
        padding: '16px',
        flexDirection: isBanner ? 'row' : 'column',
        gap: '12px',
      }}>
        <span>Advertisement Space (Placeholder)</span>
        {showGoAdFreeButton && (
          <button
            onClick={onGoAdFree}
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, #16a34a, #15803d)'
              ;(e.target as HTMLButtonElement).style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, #22c55e, #16a34a)'
              ;(e.target as HTMLButtonElement).style.transform = 'scale(1)'
            }}
          >
            Go Ad Free
          </button>
        )}
      </div>
    )
  }

  // Show placeholder if consent not given
  if (!consentGiven) {
    return (
      <div style={{
        width: '100%',
        height: containerHeight,
        backgroundColor: 'rgba(0,0,0,0)',
        border: '2px dashed rgba(240,180,41,0.3)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(240,180,41,0.5)',
        fontSize: '12px',
        fontWeight: '600',
        textAlign: 'center',
        padding: '16px',
      }}>
        <span>Advertisement Space (Accept cookies to view)</span>
      </div>
    )
  }

  return (
    <div style={{
      width: '100%',
      height: containerHeight,
      minHeight: containerHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(240,180,41,0.02)',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Adsterra Ad Frame */}
      <AdsterraFrame adKey={adConfig.key} width={adConfig.width} height={adConfig.height} />
      {showGoAdFreeButton && (
        <button
          onClick={onGoAdFree}
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, #16a34a, #15803d)'
            ;(e.target as HTMLButtonElement).style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, #22c55e, #16a34a)'
            ;(e.target as HTMLButtonElement).style.transform = 'scale(1)'
          }}
        >
          Go Ad Free
        </button>
      )}
    </div>
  )
}
