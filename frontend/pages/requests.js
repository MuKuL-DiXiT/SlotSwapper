import { useEffect, useState } from 'react'
import { useAuth } from '../src/auth'
import Layout from '../components/Layout'

export default function Requests(){
  const { user, authFetch, logout, socketMessage, clearSocketMessage } = useAuth()
  const [incoming, setIncoming] = useState([])
  const [outgoing, setOutgoing] = useState([])

  useEffect(()=>{ if (user) load() }, [user])

  // reload when a relevant socket notification arrives
  useEffect(()=>{
    if (!user || !socketMessage) return
    if (socketMessage.event === 'swap-request' || socketMessage.event === 'swap-accepted') {
      load()
      // clear the notification so it doesn't trigger repeatedly
      clearSocketMessage()
    }
  }, [socketMessage])

  const load = async ()=>{
    const res = await authFetch('/api/swap-requests')
    if (res.ok){
      const data = await res.json();
      setIncoming(data.incoming)
      setOutgoing(data.outgoing)
    }
  }

  const respond = async (id, accept) => {
    const res = await authFetch(`/api/swap-response/${id}`, { method: 'POST', body: JSON.stringify({ accept }) })
    if (res.ok) load()
    else alert((await res.json()).message || 'Error')
  }

  if (!user) return <Layout><div className="max-w-3xl mx-auto p-6">You must <a href="/login">log in</a>.</div></Layout>

  return (
    <Layout>
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl">Requests</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Incoming</h3>
        <ul className="mt-2 space-y-3">
          {incoming.map(r => (
            <li key={r._1d} className="p-3 bg-white rounded shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{r.requester?.name} offered <span className="font-semibold">{r.myEvent?.title}</span> for your <span className="font-semibold">{r.theirEvent?.title}</span></div>
                  <div className="text-sm muted">Status: {r.status}</div>
                </div>
                <div>
                  {r.status==='PENDING' && (
                    <>
                      <button onClick={()=>respond(r._id, true)} className="mr-2">Accept</button>
                      <button onClick={()=>respond(r._id, false)}>Reject</button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Outgoing</h3>
        <ul className="mt-2 space-y-2">
          {outgoing.map(r => (
            <li key={r._id} className="p-3 bg-white rounded shadow-sm">{r.responder?.name} — {r.myEvent?.title} → {r.theirEvent?.title} — {r.status}</li>
          ))}
        </ul>
      </div>

      <p className="mt-6"><a className="text-blue-600" href="/dashboard">Dashboard</a> • <a className="text-blue-600" href="/marketplace">Marketplace</a></p>
    </div>
    </Layout>
  )
}
