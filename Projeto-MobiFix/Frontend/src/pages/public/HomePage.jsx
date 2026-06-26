import Header from "./components/Header";
import Hero from "./components/Hero";
import FeaturedParts from "./components/FeaturedParts";
import TrustSection from "./components/TrustSection";
import Footer  from "./components/Footer";
import { ServicesSection } from "./components/Services";

export default function HomePage() {
  return(
    <div className="min-h-screen bg-white antialiased scroll-smooth selection:bg-safety-orange selection:text-white">
    <Header/>
    <main>
      <Hero />
      <FeaturedParts />
      <ServicesSection />
      <TrustSection />
    </main>
    <Footer /> 
    </div>
  )
}