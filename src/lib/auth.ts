'use client'

import { Member } from './supabase'

const STORAGE_KEY = 'cocktail_app_user'

export function setCurrentUser(member: Member) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(member))
  }
}

export function getCurrentUser(): Member | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      try {
        return JSON.parse(data)
      } catch {
        return null
      }
    }
  }
  return null
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function isHost(member: Member | null): boolean {
  return member?.role === 'host'
}
