import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/global.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { customer, card, product, quantity, billing_address } = await req.json()

    console.log("[Nivuspay] Iniciando processamento de pagamento")

    // Step 1: Create card token
    const tokenResponse = await fetch("https://example.com.br/api/v1/transaction.createCardToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "bf2f4316-2e4f-4ee7-8247-78b0536795df", // Secret Key
      },
      body: JSON.stringify({
        cardNumber: card.number,
        cardCvv: card.cvv,
        cardExpirationMonth: card.expiry_month,
        cardExpirationYear: card.expiry_year,
        holderName: card.holder_name,
        holderDocument: customer.cpf || "00000000000", // CPF required
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Falha ao criar token do cartão")
    }

    const { token } = await tokenResponse.json()
    console.log("[Nivuspay] Token do cartão criado")

    // Step 2: Create purchase transaction
    const purchaseResponse = await fetch("https://example.com.br/api/v1/transaction.purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "bf2f4316-2e4f-4ee7-8247-78b0536795df", // Secret Key
      },
      body: JSON.stringify({
        name: customer.name,
        email: customer.email,
        cpf: customer.cpf || "00000000000",
        phone: customer.phone.replace(/\D/g, ""),
        paymentMethod: "CREDIT_CARD",
        creditCard: {
          token: token,
          installments: 1,
        },
        cep: billing_address.zip_code?.replace(/\D/g, ""),
        complement: billing_address.complement || "",
        number: billing_address.number || "",
        street: billing_address.street,
        district: billing_address.district || "",
        city: billing_address.city,
        state: billing_address.state,
        amount: Math.round(product.price * quantity * 100), // Convert to cents
        traceable: true,
        items: [
          {
            unitPrice: Math.round(product.price * 100),
            title: product.name,
            quantity: quantity,
            tangible: true,
          },
        ],
      }),
    })

    if (!purchaseResponse.ok) {
      throw new Error("Falha ao processar transação")
    }

    const transactionData = await purchaseResponse.json()
    console.log("[Nivuspay] Transação criada:", transactionData.id)

    // Step 3: Save to Supabase
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "")

    // Create or get customer
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", customer.email)
      .single()

    let customerId = existingCustomer?.id

    if (!customerId) {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        })
        .select("id")
        .single()

      if (customerError) throw customerError
      customerId = newCustomer.id
    }

    // Create order
    const orderId = `KM${Date.now().toString().slice(-6)}`
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        id: crypto.randomUUID(),
        customer_id: customerId,
        product_id: product.id,
        quantity: quantity,
        total_amount: product.price * quantity,
        payment_status: transactionData.status === "APPROVED" ? "completed" : "pending",
        payment_id: transactionData.id,
        nivuspay_transaction_id: transactionData.id,
      })
      .select()
      .single()

    if (orderError) throw orderError

    return new Response(
      JSON.stringify({
        success: true,
        orderId: orderId,
        transactionId: transactionData.id,
        status: transactionData.status,
        message:
          transactionData.status === "APPROVED"
            ? `Pedido #${orderId} aprovado! Você receberá um email de confirmação.`
            : `Pedido #${orderId} criado! Aguardando confirmação do pagamento.`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error) {
    console.error("[Nivuspay] Erro:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    )
  }
})
