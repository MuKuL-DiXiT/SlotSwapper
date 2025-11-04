import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../src/auth'

export default function Layout({ children }){
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="bg-transparent border-b border-gray-200">
        <div className="container flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">SlotSwapper</Link>
          <div className="flex items-center gap-4">
            <Link href="/marketplace" className="text-sm">Marketplace</Link>
            <Link href="/dashboard" className="text-sm">Dashboard</Link>
            <Link href="/requests" className="text-sm">Requests</Link>
            {user && <div className="text-sm muted">{user.name}</div>}
            {/* dark mode removed - light theme only */}
          </div>
        </div>
      </header>
      <main className="container mt-6">{children}</main>
    </div>
  )
}
