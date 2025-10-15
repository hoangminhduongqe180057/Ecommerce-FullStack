// src/App.tsx
import { Toaster } from 'react-hot-toast'
import AppRouter from './routes/AppRouter'
import { Navbar, Footer } from './components/common'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <AppRouter />
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  )
}

export default App