"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, CreditCard, CheckCircle, XCircle, MapPin } from "lucide-react"
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

interface CheckoutModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

interface CheckoutForm {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  quantity: number
  cardNumber: string
  cardName: string
  cardExpiry: string
  cardCvv: string
}

export function CheckoutModal({ product, isOpen, onClose }: CheckoutModalProps) {
  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    quantity: 1,
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [loadingCep, setLoadingCep] = useState(false)
  const { clearCart } = useCart()

  const handleInputChange = (field: keyof CheckoutForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "")
    handleInputChange("zipCode", cep)

    if (cleanCep.length === 8) {
      setLoadingCep(true)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await response.json()

        if (!data.erro) {
          setForm((prev) => ({
            ...prev,
            address: data.logradouro || "",
            city: data.localidade || "",
            state: data.uf || "",
          }))
        }
      } catch (error) {
        console.error("[v0] Erro ao buscar CEP:", error)
      } finally {
        setLoadingCep(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setLoading(true)
    setStatus("idle")

    try {
      console.log("[v0] Iniciando checkout REAL com Nivuspay")

      const response = await fetch("/functions/v1/nivuspay-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            cpf: form.phone.replace(/\D/g, "").padStart(11, "0"), // Temporary CPF from phone
          },
          card: {
            number: form.cardNumber.replace(/\s/g, ""),
            holder_name: form.cardName,
            expiry_month: form.cardExpiry.split("/")[0],
            expiry_year: form.cardExpiry.split("/")[1],
            cvv: form.cardCvv,
          },
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
          },
          quantity: form.quantity,
          billing_address: {
            street: form.address,
            city: form.city,
            state: form.state,
            zip_code: form.zipCode,
          },
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Erro no processamento do pagamento")
      }

      console.log("[v0] Pagamento processado via Nivuspay:", result.transactionId)

      setStatus("success")
      setMessage(result.message)

      if (product.category === "Carrinho") {
        clearCart()
      }

      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        quantity: 1,
        cardNumber: "",
        cardName: "",
        cardExpiry: "",
        cardCvv: "",
      })
    } catch (error) {
      console.error("[v0] Erro no checkout:", error)
      setStatus("error")
      setMessage("Erro ao processar o pagamento. Verifique os dados do cartão e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = product ? product.price * form.quantity : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto max-h-[95vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-light text-center">Finalizar Compra</DialogTitle>
        </DialogHeader>

        {product && (
          <div className="space-y-8 p-1">
            <Card className="border-0 shadow-sm bg-gray-50">
              <CardContent className="p-6">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-white rounded-lg overflow-hidden shadow-sm">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    <p className="text-lg font-semibold mt-2">R$ {product.price.toFixed(2).replace(".", ",")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {status === "success" && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 text-green-800">
                    <CheckCircle className="h-6 w-6" />
                    <p className="font-medium">{message}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {status === "error" && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 text-red-800">
                    <XCircle className="h-6 w-6" />
                    <p className="font-medium">{message}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <h3 className="font-medium text-lg">Dados Pessoais</h3>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Nome Completo
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Seu nome completo"
                      className="h-12 border-gray-300 focus:border-black focus:ring-0"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="seu@email.com"
                      className="h-12 border-gray-300 focus:border-black focus:ring-0"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="h-12 border-gray-300 focus:border-black focus:ring-0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <MapPin className="h-5 w-5" />
                  <h3 className="font-medium text-lg">Endereço de Entrega</h3>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="zipCode" className="text-sm font-medium">
                      CEP
                    </Label>
                    <div className="relative">
                      <Input
                        id="zipCode"
                        type="text"
                        required
                        value={form.zipCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2")
                          handleCepChange(value)
                        }}
                        placeholder="00000-000"
                        maxLength={9}
                        className="h-12 border-gray-300 focus:border-black focus:ring-0"
                      />
                      {loadingCep && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Endereço
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      required
                      value={form.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Rua, número, complemento"
                      className="h-12 border-gray-300 focus:border-black focus:ring-0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city" className="text-sm font-medium">
                        Cidade
                      </Label>
                      <Input
                        id="city"
                        type="text"
                        required
                        value={form.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="São Paulo"
                        className="h-12 border-gray-300 focus:border-black focus:ring-0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state" className="text-sm font-medium">
                        Estado
                      </Label>
                      <Input
                        id="state"
                        type="text"
                        required
                        value={form.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="SP"
                        className="h-12 border-gray-300 focus:border-black focus:ring-0"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <CreditCard className="h-5 w-5" />
                  <h3 className="font-medium text-lg">Dados do Cartão</h3>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cardNumber" className="text-sm font-medium">
                      Número do Cartão
                    </Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      required
                      value={form.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ")
                        handleInputChange("cardNumber", value)
                      }}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="h-12 border-gray-300 focus:border-black focus:ring-0 font-mono"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cardName" className="text-sm font-medium">
                      Nome no Cartão
                    </Label>
                    <Input
                      id="cardName"
                      type="text"
                      required
                      value={form.cardName}
                      onChange={(e) => handleInputChange("cardName", e.target.value.toUpperCase())}
                      placeholder="NOME COMO NO CARTÃO"
                      className="h-12 border-gray-300 focus:border-black focus:ring-0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cardExpiry" className="text-sm font-medium">
                        Validade
                      </Label>
                      <Input
                        id="cardExpiry"
                        type="text"
                        required
                        value={form.cardExpiry}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2")
                          handleInputChange("cardExpiry", value)
                        }}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="h-12 border-gray-300 focus:border-black focus:ring-0 font-mono"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cardCvv" className="text-sm font-medium">
                        CVV
                      </Label>
                      <Input
                        id="cardCvv"
                        type="text"
                        required
                        value={form.cardCvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "")
                          handleInputChange("cardCvv", value)
                        }}
                        placeholder="000"
                        maxLength={4}
                        className="h-12 border-gray-300 focus:border-black focus:ring-0 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {product.category !== "Carrinho" && (
                <div className="grid gap-2">
                  <Label htmlFor="quantity" className="text-sm font-medium">
                    Quantidade
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={form.quantity}
                    onChange={(e) => handleInputChange("quantity", Number.parseInt(e.target.value) || 1)}
                    className="h-12 border-gray-300 focus:border-black focus:ring-0"
                  />
                </div>
              )}

              <Card className="bg-black text-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Total a pagar:</span>
                    <span className="text-2xl font-bold">R$ {totalAmount.toFixed(2).replace(".", ",")}</span>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full h-14 bg-black hover:bg-gray-800 text-white text-lg font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processando Pagamento...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Finalizar Compra
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
