import { useEffect, useState } from 'react'
import { useAuth } from '../src/auth'
import Layout from '../components/Layout'

export default function Marketplace(){
  const { user, authFetch, logout } = useAuth()
  const [slots, setSlots] = useState([])
  const [mySwappables, setMySwappables] = useState([])
  const [selectedTheir, setSelectedTheir] = useState(null)
  const [selectedMy, setSelectedMy] = useState(null)

  useEffect(()=>{ if (user) load() }, [user])

  const load = async ()=>{
    const res = await authFetch('/api/events/swappable')
    if (res.ok) setSlots(await res.json())
    const res2 = await authFetch('/api/events/mine')
    if (res2.ok) setMySwappables((await res2.json()).filter(e=>e.status==='SWAPPABLE'))
  }

  const requestSwap = async ()=>{
    if (!selectedMy || !selectedTheir) return alert('Choose your slot and the target slot')
    if (selectedMy === selectedTheir) return alert('You cannot offer the same slot')
    // ensure the target slot is not owned by the requester (should be prevented server-side too)
    const target = slots.find(s => s._id === selectedTheir)
    if (!target) return alert('Selected target not found')
    if (String(target.owner?._id || target.owner) === String(user?.id || user?._id || user?.id)) return alert('Cannot target your own slot')
    const res = await authFetch('/api/swap-request', { method: 'POST', body: JSON.stringify({ myEventId: selectedMy, theirEventId: selectedTheir }) })
    if (res.ok){ alert('Requested'); load() }
    else alert((await res.json()).message || 'Error')
  }

  if (!user) return <Layout><div className="max-w-4xl mx-auto p-6">You must <a href="/login">log in</a>.</div></Layout>

  return (
    <Layout>
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl">Marketplace</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold">Available slots</h3>
          <ul className="mt-2 space-y-3">
            {slots.map(s => {
              const ownerId = String(s.owner?._id || s.owner)
              const isOwn = String(user?._id || user?.id) === ownerId
              return (
                <li key={s._id} className="p-3 bg-white rounded shadow-sm">
                  <strong>{s.title}</strong> by {s.owner?.name}
                  <div className="text-sm muted">{new Date(s.startTime).toLocaleString()}</div>
                  <label className="block mt-2">
                    <input className="mr-2" type="radio" name="their" value={s._id} onChange={()=>setSelectedTheir(s._id)} disabled={isOwn} /> {isOwn ? 'Your slot (not selectable)' : 'Offer this'}
                  </label>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Your swappable slots</h3>
          <ul className="mt-2 space-y-3">
            {mySwappables.map(s => (
              <li key={s._id} className="p-3 bg-white rounded shadow-sm">
                <div>{s.title}</div>
                <div className="text-sm muted">{new Date(s.startTime).toLocaleString()}</div>
                <label className="block mt-2"><input className="mr-2" type="radio" name="my" value={s._id} onChange={()=>setSelectedMy(s._id)} /> Use this</label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <button onClick={requestSwap}>Request Swap</button>
      </div>

      <p className="mt-6"><a className="text-blue-600" href="/dashboard">Dashboard</a> • <a className="text-blue-600" href="/requests">Requests</a></p>
    </div>
    </Layout>
  )
}
