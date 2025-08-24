import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, customer, quantity, total_amount } = body

    // Validação básica
    if (!product_id || !customer || !quantity || !total_amount) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verificar se o produto existe
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Criar ou buscar cliente
    let customerId: string
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", customer.email)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        })
        .select("id")
        .single()

      if (customerError || !newCustomer) {
        return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 })
      }
      customerId = newCustomer.id
    }

    // Criar pedido
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        product_id: product_id,
        quantity: quantity,
        total_amount: total_amount,
        payment_status: "pending",
      })
      .select("*")
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 })
    }

    // TODO: Integrar com Nivuspay API
    // Aqui você implementaria a chamada para a API da Nivuspay
    // Por enquanto, simulamos um pagamento bem-sucedido

    // Simular processamento de pagamento
    const paymentSuccess = Math.random() > 0.1 // 90% de sucesso para demo

    if (paymentSuccess) {
      // Atualizar status do pedido
      await supabase
        .from("orders")
        .update({
          payment_status: "completed",
          payment_id: `nivus_${Date.now()}`, // ID simulado
        })
        .eq("id", order.id)

      return NextResponse.json({
        success: true,
        order_id: order.id,
        message: "Pagamento processado com sucesso!",
      })
    } else {
      // Atualizar status do pedido como falhou
      await supabase.from("orders").update({ payment_status: "failed" }).eq("id", order.id)

      return NextResponse.json({ error: "Falha no processamento do pagamento" }, { status: 400 })
    }
  } catch (error) {
    console.error("Erro no checkout:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
