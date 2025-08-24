"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, CheckCircle } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)

    // Simula inscrição na newsletter
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubscribed(true)
    setEmail("")
    setLoading(false)

    // Reset após 3 segundos
    setTimeout(() => {
      setIsSubscribed(false)
    }, 3000)
  }

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Fique por dentro das novidades</h2>
          <p className="text-muted-foreground mb-8">
            Receba em primeira mão nossos lançamentos, promoções exclusivas e dicas de beleza.
          </p>

          {isSubscribed ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-medium">Obrigada! Você foi inscrita com sucesso.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Seu melhor email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={loading} className="sm:w-auto">
                {loading ? (
                  "Inscrevendo..."
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Inscrever
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
