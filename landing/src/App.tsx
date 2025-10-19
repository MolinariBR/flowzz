
import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import PainPoint from './components/PainPoint'
import Benefits from './components/Benefits'
import Features from './components/Features'
import WhyChoose from './components/WhyChoose'
import Plans from './components/Plans'
import Integrations from './components/Integrations'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        <Hero />
        <PainPoint />
        <Benefits />
        <Features />
        <WhyChoose />
        <Plans />
        <Integrations />
      </main>
      <Footer />
    </div>
  )
}

export default App
