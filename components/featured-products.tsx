"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { ShoppingBag, Heart, Plus } from "lucide-react"
import { useCart } from "./cart-context"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_featured: boolean
}

interface FeaturedProductsProps {
  onBuyNow: (product: Product) => void
}

export function FeaturedProducts({ onBuyNow }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart } = useCart()

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log("[v0] Iniciando busca de produtos...")
        console.log("[v0] SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log("[v0] SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

        const supabase = createClient()
        console.log("[v0] Cliente Supabase criado:", supabase)

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_featured", true)
          .order("created_at", { ascending: false })

        console.log("[v0] Resposta do Supabase - data:", data)
        console.log("[v0] Resposta do Supabase - error:", error)

        if (error) {
          console.error("Erro ao carregar produtos:", error)
          if (error.message.includes("table") || error.message.includes("schema")) {
            setProducts(getMockProducts())
            setError("Usando produtos de exemplo. Execute os scripts SQL para criar o banco de dados.")
          } else {
            setProducts(getMockProducts())
            setError(`Erro: ${error.message}`)
          }
        } else {
          if (data && data.length > 0) {
            setProducts(data)
            console.log("[v0] Produtos carregados do banco:", data.length)
          } else {
            setProducts(getMockProducts())
            setError("Nenhum produto encontrado no banco. Usando produtos de exemplo.")
            console.log("[v0] Usando produtos mock - banco vazio")
          }
        }
      } catch (err) {
        console.error("Erro inesperado:", err)
        setProducts(getMockProducts())
        setError("Usando produtos de exemplo devido a erro inesperado")
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  function getMockProducts(): Product[] {
    return [
      {
        id: "1",
        name: "Batom Matte Luxo",
        description: "Batom de longa duração com acabamento matte e cores vibrantes",
        price: 45.9,
        image_url: "/luxury-matte-lipstick-cosmetics.png",
        category: "Lábios",
        is_featured: true,
      },
      {
        id: "2",
        name: "Base Líquida HD",
        description: "Base de alta cobertura com acabamento natural e proteção solar",
        price: 89.9,
        image_url: "/liquid-foundation-makeup-cosmetics.png",
        category: "Rosto",
        is_featured: true,
      },
      {
        id: "3",
        name: "Paleta de Sombras Nude",
        description: "12 tons neutros para criar looks naturais e sofisticados",
        price: 129.9,
        image_url: "/nude-eyeshadow-palette-cosmetics.png",
        category: "Olhos",
        is_featured: true,
      },
    ]
  }

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Produtos em Destaque</h2>
            <p className="text-lg text-muted-foreground">Carregando nossa seleção especial...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Produtos em Destaque</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra nossa seleção cuidadosamente escolhida dos melhores produtos de beleza
          </p>
          {error && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-800 text-sm max-w-md mx-auto">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">{product.category}</Badge>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-6">
                <h3 className="font-serif text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-2xl">R$ {product.price.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => addToCart(product)} className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    Carrinho
                  </Button>
                  <Button onClick={() => onBuyNow(product)} className="flex-1 bg-primary hover:bg-primary/90">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Comprar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
