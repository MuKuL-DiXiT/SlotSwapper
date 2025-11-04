import Link from 'next/link'
import Layout from '../components/Layout'

export default function Home(){
  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">SlotSwapper</h1>
        <p className="text-lg">A simple peer-to-peer slot swapping demo.</p>
        <p className="mt-4"><Link className="text-blue-600" href="/signup">Sign up</Link> or <Link className="text-blue-600" href="/login">Log in</Link></p>
      </div>
    </Layout>
  )
}
