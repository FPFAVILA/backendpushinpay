# Guia Completo - Backend PushinPay PIX

## O que foi criado?

Um backend completo para processar pagamentos PIX usando a API da PushinPay, com 3 endpoints funcionais:

1. **POST /api/create-pix** - Cria QR Codes PIX
2. **POST /api/webhook** - Recebe notificações de pagamento
3. **GET /api/check-status** - Consulta status de uma transação

Todos os pagamentos são salvos automaticamente no banco Supabase.

---

## Passo 1: Deploy na Vercel

### 1.1 Faça o Deploy
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe este repositório
4. Clique em "Deploy"

### 1.2 Pegue a URL do seu projeto
Após o deploy, você receberá uma URL tipo:
```
https://seu-projeto.vercel.app
```

**GUARDE ESSA URL!** Você vai precisar dela no próximo passo.

---

## Passo 2: Configure as Variáveis de Ambiente na Vercel

Vá em **Settings → Environment Variables** no seu projeto Vercel e adicione:

### Variáveis Obrigatórias:

```
PUSHINPAY_TOKEN=51354|cScXSmXQV0xw1fphd8H9ITQczZTPRZQH2H8LxWDVd8098c47
API_BASE_URL=https://api.pushinpay.com.br
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw
```

**IMPORTANTE:** Depois de adicionar as variáveis, faça um novo deploy (Vercel faz isso automaticamente).

---

## Passo 3: Como Usar os Endpoints

### 3.1 Criar um PIX (Gerar QR Code)

**Endpoint:** `POST https://seu-projeto.vercel.app/api/create-pix`

**Body (JSON):**
```json
{
  "value": 1000,
  "webhook_url": "https://seu-projeto.vercel.app/api/webhook"
}
```

**Resposta de Sucesso:**
```json
{
  "id": "9c29870c-9f69-4bb6-90d3-2dce9453bb45",
  "qr_code": "00020126580014br.gov.bcb.pix...",
  "qr_code_base64": "data:image/png;base64,iVBORw0KGg...",
  "status": "created",
  "value": 1000
}
```

**O que acontece:**
- Um QR Code PIX é gerado na PushinPay
- Você recebe o código PIX e a imagem em base64
- Quando alguém pagar, o webhook será chamado automaticamente

---

### 3.2 Webhook (Recebe Pagamento Automaticamente)

**Endpoint:** `POST https://seu-projeto.vercel.app/api/webhook`

**Você NÃO precisa chamar isso!** A PushinPay chama automaticamente quando alguém paga o PIX.

**Dados recebidos:**
```json
{
  "id": "9c29870c-9f69-4bb6-90d3-2dce9453bb45",
  "status": "paid",
  "value": 1000,
  "payer_name": "João Silva",
  "payer_national_registration": "12345678909"
}
```

**O que acontece:**
- O webhook recebe a confirmação de pagamento
- Os dados são salvos na tabela `pix_payments` no Supabase
- Retorna status 200 para confirmar o recebimento

---

### 3.3 Consultar Status de um PIX

**Endpoint:** `GET https://seu-projeto.vercel.app/api/check-status?id=SEU_ID_AQUI`

**Exemplo:**
```
GET https://seu-projeto.vercel.app/api/check-status?id=9c29870c-9f69-4bb6-90d3-2dce9453bb45
```

**Resposta:**
```json
{
  "id": "9c29870c-9f69-4bb6-90d3-2dce9453bb45",
  "status": "paid",
  "value": 1000,
  "payer_name": "João Silva",
  "created_at": "2025-10-23T10:30:00Z"
}
```

---

## Passo 4: Banco de Dados Supabase

### Tabela criada: `pix_payments`

Todos os webhooks são salvos automaticamente com:
- `transaction_id` - ID da transação PushinPay
- `status` - Status do pagamento (created, paid, cancelled)
- `value` - Valor em centavos
- `payer_name` - Nome do pagador
- `payer_national_registration` - CPF/CNPJ
- `webhook_received_at` - Quando o webhook foi recebido
- `raw_data` - JSON completo do webhook

### Como consultar os pagamentos:

Acesse seu Supabase e execute:
```sql
SELECT * FROM pix_payments ORDER BY webhook_received_at DESC;
```

---

## Fluxo Completo de Funcionamento

```
1. Seu App → POST /api/create-pix
   ↓
2. Backend → Chama PushinPay API
   ↓
3. PushinPay → Retorna QR Code
   ↓
4. Seu App → Mostra QR Code para usuário
   ↓
5. Usuário → Paga o PIX
   ↓
6. PushinPay → Chama POST /api/webhook automaticamente
   ↓
7. Backend → Salva no Supabase
   ↓
8. Você → Consulta pagamentos no banco
```

---

## Testando na Prática

### Teste 1: Criar um PIX

```bash
curl -X POST https://seu-projeto.vercel.app/api/create-pix \
  -H "Content-Type: application/json" \
  -d '{
    "value": 1000,
    "webhook_url": "https://seu-projeto.vercel.app/api/webhook"
  }'
```

### Teste 2: Consultar Status

```bash
curl https://seu-projeto.vercel.app/api/check-status?id=SEU_ID_AQUI
```

---

## Resumo da Estrutura

```
/api
├── create-pix.js     → Gera QR Codes PIX
├── webhook.js        → Recebe confirmações de pagamento
└── check-status.js   → Consulta status

/vercel.json          → Configuração Vercel
/package.json         → Dependências (Supabase)
/.env                 → Variáveis locais (não vai pro deploy)
```

---

## Segurança

- ✅ Token da PushinPay nunca exposto no frontend
- ✅ Supabase com Row Level Security habilitado
- ✅ Webhooks validados e salvos com segurança
- ✅ Todas as requisições com tratamento de erros

---

## Próximos Passos

1. Faça o deploy na Vercel
2. Pegue sua URL do projeto
3. Configure as variáveis de ambiente
4. Teste criar um PIX
5. Pague o PIX (você mesmo ou use conta teste)
6. Verifique o webhook chegando no console da Vercel
7. Consulte os dados salvos no Supabase

---

## Dúvidas Comuns

**Q: O webhook não está chegando?**
A: Verifique se a URL do webhook está correta no create-pix e se o projeto está deployado.

**Q: Como ver os logs?**
A: Vá em Vercel → Seu Projeto → Functions → Clique em qualquer função → View Logs

**Q: Posso testar localmente?**
A: Sim, mas o webhook só funciona em produção (PushinPay precisa acessar sua URL).

**Q: Como atualizar o token?**
A: Vá em Vercel → Settings → Environment Variables → Edite PUSHINPAY_TOKEN

---

Pronto! Seu backend PIX está 100% funcional e pronto para produção.
