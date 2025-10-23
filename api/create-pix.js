export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { value, webhook_url } = req.body;

  if (!value) {
    return res.status(400).json({ error: "O campo 'value' é obrigatório" });
  }

  try {
    const response = await fetch("https://api.pushinpay.com.br/api/pix/cashIn", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PUSHINPAY_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value,
        webhook_url: webhook_url || `${req.headers.host}/api/webhook`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Erro ao criar PIX na PushinPay",
        details: data,
      });
    }

    return res.status(200).json({
      success: true,
      id: data.id,
      qr_code: data.qr_code,
      qr_code_base64: data.qr_code_base64,
      status: data.status,
      value: data.value,
      created_at: data.created_at,
    });
  } catch (error) {
    console.error("Erro ao criar PIX:", error);
    return res.status(500).json({
      error: "Erro interno ao processar requisição",
      message: error.message,
    });
  }
}
