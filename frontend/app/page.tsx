import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { TrustStrip } from '@/components/trust-strip'
import { IntelligenceGrid } from '@/components/intelligence-grid'
import { ModulesSection } from '@/components/modules-section'
import { DashboardsSection } from '@/components/dashboards-section'
import { DigitalTwinSection } from '@/components/digital-twin-section'
import { CTASection } from '@/components/cta-section'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <main className="w-full overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <TrustStrip />
      <IntelligenceGrid />
      <ModulesSection />
      <DashboardsSection />
      <DigitalTwinSection />
      <CTASection />
      <Footer />
    </main>
  )
}
