import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/node/global.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    const webhookData = await req.json()

    console.log("[v0] Webhook Nivuspay recebido:", webhookData.type)

    // Verify webhook signature (implement based on Nivuspay documentation)
    const signature = req.headers.get("nivuspay-signature")
    if (!signature) {
      return new Response("Missing signature", { status: 400 })
    }

    // Process different webhook events
    switch (webhookData.type) {
      case "payment.succeeded":
        await handlePaymentSucceeded(supabaseClient, webhookData.data)
        break
      case "payment.failed":
        await handlePaymentFailed(supabaseClient, webhookData.data)
        break
      case "payment.refunded":
        await handlePaymentRefunded(supabaseClient, webhookData.data)
        break
      default:
        console.log("[v0] Evento não tratado:", webhookData.type)
    }

    return new Response("OK", { headers: corsHeaders })
  } catch (error) {
    console.error("[v0] Erro no webhook:", error)
    return new Response("Error", { status: 500, headers: corsHeaders })
  }
})

async function handlePaymentSucceeded(supabase: any, paymentData: any) {
  const orderId = paymentData.metadata?.order_id

  if (orderId) {
    await supabase
      .from("orders")
      .update({
        status: "completed",
        payment_status: "succeeded",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    console.log("[v0] Pagamento confirmado para pedido:", orderId)
  }
}

async function handlePaymentFailed(supabase: any, paymentData: any) {
  const orderId = paymentData.metadata?.order_id

  if (orderId) {
    await supabase
      .from("orders")
      .update({
        status: "failed",
        payment_status: "failed",
        payment_error: paymentData.failure_reason || "Pagamento falhou",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    console.log("[v0] Pagamento falhou para pedido:", orderId)
  }
}

async function handlePaymentRefunded(supabase: any, paymentData: any) {
  const orderId = paymentData.metadata?.order_id

  if (orderId) {
    await supabase
      .from("orders")
      .update({
        status: "refunded",
        payment_status: "refunded",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    console.log("[v0] Reembolso processado para pedido:", orderId)
  }
}
