import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Hero from './components/Hero'
import EmailSignup from './components/EmailSignup'
import Footer from './components/Footer'
import PlausibleAnalytics from './components/PlausibleAnalytics'
import JoinOurWaitlist from './components/JoinOurWaitlist'
import ContactUs from './components/ContactUs'
import AboutUs from './components/AboutUs'
import NotFound from './components/NotFound'
import ServerError from './components/ServerError'
import Maintenance from './components/Maintenance'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <PlausibleAnalytics />
          <Routes>
            <Route path="/" element={
              <>
                <main className="flex-1">
                  <Hero />
                  <EmailSignup />
                </main>
                <Footer />
              </>
            } />
            <Route path="/join-our-waitlist" element={<JoinOurWaitlist />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/500" element={<ServerError />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
