import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import { useAuth } from '../src/auth'
import Layout from '../components/Layout'

export default function Dashboard(){
  const { user, authFetch, logout } = useAuth()
  const [events, setEvents] = useState([])
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)

  useEffect(()=>{ if (user) load() }, [user])

  const load = async ()=>{
    const res = await authFetch('/api/events/mine')
    if (res.ok) setEvents(await res.json())
    else if (res.status===401) logout()
  }

  const create = async (e)=>{
    e.preventDefault()
    if (!startTime || !endTime) return alert('Please pick start and end times')
    const res = await authFetch('/api/events', { method: 'POST', body: JSON.stringify({ title, startTime: startTime.toISOString(), endTime: endTime.toISOString(), status: 'BUSY' }) })
    if (res.ok){ setTitle(''); setStartTime(null); setEndTime(null); load() }
    else alert((await res.json()).message || 'Error')
  }

  const toggleSwappable = async (ev)=>{
    const newStatus = ev.status==='SWAPPABLE' ? 'BUSY' : 'SWAPPABLE'
    const res = await authFetch(`/api/events/${ev._id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) })
    if (res.ok) load()
  }

  if (!user) return <Layout><div className="max-w-3xl mx-auto p-6">You must <a href="/login">log in</a>.</div></Layout>

    return (
      <Layout>
      <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl">Hi {user.name}</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Create event</h3>
        <form onSubmit={create} className="mt-2">
          <div><input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} /></div>
          <div className="mt-2">
            <label className="block text-sm muted">Start</label>
            <DatePicker selected={startTime} onChange={(d)=>setStartTime(d)} showTimeSelect dateFormat="Pp" />
          </div>
          <div className="mt-2">
            <label className="block text-sm muted">End</label>
            <DatePicker selected={endTime} onChange={(d)=>setEndTime(d)} showTimeSelect dateFormat="Pp" />
          </div>
          <button type="submit">Create</button>
        </form>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold">Your events</h3>
        <ul className="mt-2 space-y-3">
          {events.map(ev => (
            <li key={ev._id} className="p-3 bg-white rounded shadow-sm flex justify-between items-center">
              <div>
                <strong>{ev.title}</strong>
                <div className="text-sm muted">{new Date(ev.startTime).toLocaleString()} to {new Date(ev.endTime).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm">{ev.status}</div>
                <button onClick={()=>toggleSwappable(ev)} className="mt-2">{ev.status==='SWAPPABLE' ? 'Unmark' : 'Make Swappable'}</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6"><a className="text-blue-600" href="/marketplace">Marketplace</a> • <a className="text-blue-600" href="/requests">Requests</a></p>
    </div>
    </Layout>
  )
}
