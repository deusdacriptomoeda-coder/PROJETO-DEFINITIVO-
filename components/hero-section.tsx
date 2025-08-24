import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/luxury-cosmetics-beauty-elegant-woman-makeup.png" alt="Kikomiilano Beauty" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight">Kikomiilano</h1>
        <p className="text-xl md:text-2xl mb-4 font-light">Beleza Autêntica, Luxo Acessível</p>
        <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          Descubra nossa coleção exclusiva de cosméticos premium que realçam sua beleza natural
        </p>
        <Button size="lg" className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-6 rounded-full">
          Explorar Coleção
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  )
}
