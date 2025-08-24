import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/global.ts"

serve(async (req) => {
  try {
    const webhookData = await req.json()
    console.log("[Nivuspay Webhook] Recebido:", webhookData)

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "")

    // Update order status based on webhook
    let paymentStatus = "pending"

    switch (webhookData.status) {
      case "APPROVED":
        paymentStatus = "completed"
        break
      case "REJECTED":
        paymentStatus = "failed"
        break
      case "REFUNDED":
        paymentStatus = "refunded"
        break
      case "CHARGEBACK":
        paymentStatus = "chargeback"
        break
    }

    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("nivuspay_transaction_id", webhookData.paymentId)

    if (error) {
      console.error("[Nivuspay Webhook] Erro ao atualizar pedido:", error)
      throw error
    }

    console.log(`[Nivuspay Webhook] Pedido atualizado para status: ${paymentStatus}`)

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("[Nivuspay Webhook] Erro:", error)
    return new Response("Error", { status: 500 })
  }
})
