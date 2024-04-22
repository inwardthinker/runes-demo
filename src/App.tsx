import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AppBar from './components/AppBar'
import { Container } from '@mui/material'
import Home from './pages/home'
import { AppContextProvider } from './context/AppContext'

function App() {
  const [count, setCount] = useState(0)

  return (
    <AppContextProvider>
      <AppBar/>
      <Container>
        <Home/>
      </Container>
    </AppContextProvider>
  )
}

export default App
