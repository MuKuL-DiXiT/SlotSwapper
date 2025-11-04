import { useState } from 'react'
import { useAuth, API_BASE } from '../src/auth'
import Layout from '../components/Layout'
import Link from 'next/link'

export default function Signup(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    const res = await fetch(`${API_BASE}/api/auth/signup`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name, email, password }) })
    const data = await res.json()
    if (res.ok) login(data.token, data.user)
    else alert(data.message || 'Error')
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto p-6 card">
        <h2 className="text-2xl font-semibold mb-4">Sign up</h2>
        <form onSubmit={submit}>
          <div><input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} /></div>
          <div><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
          <button type="submit">Sign up</button>
        </form>
        <p className="mt-4 text-sm muted">Already have an account? <Link href="/login">Log in</Link></p>
      </div>
    </Layout>
  )
}
