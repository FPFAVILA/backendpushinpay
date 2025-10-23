export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const webhookData = req.body;

    console.log("💰 Webhook PushinPay recebido:", {
      id: webhookData.id,
      status: webhookData.status,
      value: webhookData.value,
      payer_name: webhookData.payer_name,
      payer_national_registration: webhookData.payer_national_registration,
      timestamp: new Date().toISOString(),
    });

    if (webhookData.status === "paid") {
      console.log(`✅ Pagamento confirmado! ID: ${webhookData.id} | Valor: R$ ${(webhookData.value / 100).toFixed(2)}`);
    }

    return res.status(200).json({
      received: true,
      message: "Webhook processado com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error);

    return res.status(200).json({
      received: true,
      error: error.message,
    });
  }
}
