import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../src/auth'

export default function Layout({ children }){
  const { user } = useAuth()
  const [dark, setDark] = useState(true)

  useEffect(()=>{
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  },[dark])

  return (
    <div className="min-h-screen">
      <header className="bg-transparent border-b border-slate-700">
        <div className="container flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">SlotSwapper</Link>
          <div className="flex items-center gap-4">
            <Link href="/marketplace" className="text-sm">Marketplace</Link>
            <Link href="/dashboard" className="text-sm">Dashboard</Link>
            <Link href="/requests" className="text-sm">Requests</Link>
            <button onClick={()=>setDark(d=>!d)} className="ml-4 px-2 py-1 rounded border">{dark ? 'Light' : 'Dark'}</button>
          </div>
        </div>
      </header>
      <main className="container mt-6">{children}</main>
    </div>
  )
}
