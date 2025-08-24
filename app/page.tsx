"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturedProducts } from "@/components/featured-products"
import { NewsletterSection } from "@/components/newsletter-section"
import { CheckoutModal } from "@/components/checkout-modal"
import { CartModal } from "@/components/cart-modal"
import { Footer } from "@/components/footer"
import { useCart } from "@/components/cart-context"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_featured: boolean
}

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { items } = useCart()

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product)
    setIsCheckoutOpen(true)
  }

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false)
    setSelectedProduct(null)
  }

  const handleCartClick = () => {
    setIsCartOpen(true)
  }

  const handleCartCheckout = () => {
    // Convert cart items to checkout format
    if (items.length > 0) {
      // For now, we'll checkout with the first item, but this could be enhanced
      // to handle multiple items or create a multi-item checkout
      const firstItem = items[0]
      const product: Product = {
        id: firstItem.id,
        name: firstItem.name,
        description: `Quantidade: ${firstItem.quantity}`,
        price: firstItem.price * firstItem.quantity,
        image_url: firstItem.image_url,
        category: "Carrinho",
        is_featured: false,
      }
      setSelectedProduct(product)
      setIsCheckoutOpen(true)
    }
  }

  return (
    <main className="min-h-screen">
      <Header onCartClick={handleCartClick} />

      <div id="home">
        <HeroSection />
      </div>

      <div id="produtos">
        <FeaturedProducts onBuyNow={handleBuyNow} />
      </div>

      <NewsletterSection />

      <Footer />

      <CheckoutModal product={selectedProduct} isOpen={isCheckoutOpen} onClose={handleCloseCheckout} />

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={handleCartCheckout} />
    </main>
  )
}
