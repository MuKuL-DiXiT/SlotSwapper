import '../styles/globals.css'
import 'react-datepicker/dist/react-datepicker.css'
import { AuthProvider } from '../src/auth'

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
