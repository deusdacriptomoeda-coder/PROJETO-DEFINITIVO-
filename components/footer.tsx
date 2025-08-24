import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold">Kikomiilano</h3>
            <p className="text-primary-foreground/80">
              Beleza autêntica e luxo acessível para realçar sua essência única.
            </p>
            <div className="flex gap-4">
              <Instagram className="h-5 w-5 hover:text-accent cursor-pointer transition-colors" />
              <Facebook className="h-5 w-5 hover:text-accent cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 hover:text-accent cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Produtos</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li className="hover:text-accent cursor-pointer transition-colors">Base</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Olhos</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Lábios</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Acessórios</li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Suporte</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li className="hover:text-accent cursor-pointer transition-colors">FAQ</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Trocas e Devoluções</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Frete Grátis</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Contato</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contato</h4>
            <div className="space-y-3 text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contato@kikomiilano.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(11) 9999-9999</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>São Paulo, SP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-primary-foreground/60">
          <p>&copy; 2024 Kikomiilano. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
