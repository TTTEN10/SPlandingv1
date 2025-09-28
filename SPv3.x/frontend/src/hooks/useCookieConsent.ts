import { useState, useEffect } from 'react'

export interface CookiePreferences {
  essential: boolean
  functional: boolean
  analytics: boolean
}

interface ConsentData {
  hasConsented: boolean
  preferences: CookiePreferences
  timestamp: number
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  functional: false,
  analytics: false
}

const CONSENT_KEY = 'safepsy-cookie-consent'

export const useCookieConsent = () => {
  const [consentData, setConsentData] = useState<ConsentData>(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          hasConsented: true,
          preferences: parsed.preferences || DEFAULT_PREFERENCES,
          timestamp: parsed.timestamp || Date.now()
        }
      }
    } catch (error) {
      console.warn('Failed to parse stored cookie consent:', error)
    }
    
    return {
      hasConsented: false,
      preferences: DEFAULT_PREFERENCES,
      timestamp: Date.now()
    }
  })

  const updateConsent = (preferences: CookiePreferences) => {
    const newConsentData: ConsentData = {
      hasConsented: true,
      preferences,
      timestamp: Date.now()
    }
    
    setConsentData(newConsentData)
    
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsentData))
    } catch (error) {
      console.warn('Failed to store cookie consent:', error)
    }
  }

  const clearConsent = () => {
    setConsentData({
      hasConsented: false,
      preferences: DEFAULT_PREFERENCES,
      timestamp: Date.now()
    })
    
    try {
      localStorage.removeItem(CONSENT_KEY)
    } catch (error) {
      console.warn('Failed to clear cookie consent:', error)
    }
  }

  // Check if consent is older than 1 year (optional - for re-consent)
  const isConsentExpired = () => {
    const oneYear = 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds
    return Date.now() - consentData.timestamp > oneYear
  }

  return {
    consentData,
    updateConsent,
    clearConsent,
    isConsentExpired
  }
}
