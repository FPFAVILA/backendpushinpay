export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido. Use GET." });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      error: "ID é obrigatório",
      usage: "GET /api/check-status?id=UUID_DA_TRANSACAO",
    });
  }

  try {
    const response = await fetch(`https://api.pushinpay.com.br/api/pix/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PUSHINPAY_TOKEN}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Erro ao consultar status na PushinPay",
        details: data,
      });
    }

    return res.status(200).json({
      success: true,
      transaction: {
        id: data.id,
        status: data.status,
        value: data.value,
        qr_code: data.qr_code,
        payer_name: data.payer_name,
        payer_national_registration: data.payer_national_registration,
        created_at: data.created_at,
        paid_at: data.paid_at,
      },
    });
  } catch (error) {
    console.error("Erro ao verificar status:", error);
    return res.status(500).json({
      error: "Erro interno ao processar requisição",
      message: error.message,
    });
  }
}
