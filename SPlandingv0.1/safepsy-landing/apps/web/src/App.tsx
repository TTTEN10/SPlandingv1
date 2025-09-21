import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import AboutUs from "./components/AboutUs";
import SecurityAndPrivacyPolicy from "./components/SecurityAndPrivacyPolicy";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen flex flex-col">
            <header className="max-w-6xl mx-auto w-full px-6 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-heading text-lg">
                  <a href="https://www.safepsy.com" target="_blank" rel="noopener noreferrer" className="transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                    <img src="/LogoTransparent1.png" alt="SafePsy Logo" className="h-16 transition-all duration-200 hover:drop-shadow-lg" />
                  </a>
                </div>
                <p className="text-sm text-web-safe hidden sm:block">Smart, Secure, and Private Therapy Powered by AI and Blockchain</p>
              </div>
            </header>

            <main className="flex-1">
              <Hero />
            </main>

            <Footer />
          </div>
        } />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/sap-policy" element={<SecurityAndPrivacyPolicy />} />
      </Routes>
    </Router>
  );
}
