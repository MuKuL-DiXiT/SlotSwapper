import { useState } from 'react'
import { useAuth } from '../src/auth'
import Layout from '../components/Layout'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) })
    const data = await res.json()
    if (res.ok) login(data.token, data.user)
    else alert(data.message || 'Error')
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto p-6 card">
        <h2 className="text-2xl font-semibold mb-4">Log in</h2>
        <form onSubmit={submit}>
          <div><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
          <button type="submit">Log in</button>
        </form>
      </div>
    </Layout>
  )
}
