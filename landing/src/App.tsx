import Benefits from './components/Benefits'
import Features from './components/Features'
import Footer from './components/Footer'
import Header from './components/Header'
import Hero from './components/Hero'
import Integrations from './components/Integrations'
import PainPoint from './components/PainPoint'
import Plans from './components/Plans'
import WhyChoose from './components/WhyChoose'

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
