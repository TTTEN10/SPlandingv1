import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import AboutUs from "./components/AboutUs";
import SecurityAndPrivacyPolicy from "./components/SecurityAndPrivacyPolicy";
import ContactUs from "./components/ContactUs";
import JoinOurWaitlist from "./components/JoinOurWaitlist";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen flex flex-col">
            <header className="max-w-6xl mx-auto w-full px-6 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-heading text-lg">
                  <a href="https://www.safepsy.com" target="_blank" rel="noopener noreferrer" className="h-14 hover:drop-shadow-lg transition-all duration-200">
                    <img src="/LogoTransparent1.png" alt="SafePsy Logo" className="h-14" />
                  </a>
                </div>
                <p className="text-[1.1em] text-web-safe hidden sm:block">Smart, Secure, and Private Therapy Powered by AI and Blockchain</p>
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
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/join-our-waitlist" element={<JoinOurWaitlist />} />
      </Routes>
    </Router>
  );
}
