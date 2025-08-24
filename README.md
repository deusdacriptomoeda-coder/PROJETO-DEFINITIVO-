# Kikomiilano - Loja Virtual de Cosméticos

Uma landing page moderna para loja virtual de cosméticos inspirada no design elegante da Kiko Cosmetics, com integração completa ao Supabase e gateway de pagamento Nivuspay.

## 🚀 Funcionalidades

### Frontend
- ✅ Landing page responsiva e moderna
- ✅ Sistema de carrinho de compras
- ✅ Checkout integrado com Supabase
- ✅ Modal de produtos com detalhes
- ✅ Newsletter para captura de leads
- ✅ Design inspirado na Kiko Cosmetics

### Backend & Banco de Dados
- ✅ Integração completa com Supabase
- ✅ Tabelas: products, customers, orders
- ✅ Row Level Security (RLS) configurado
- ✅ Edge Functions para processamento de pagamentos

### Painel Administrativo
- ✅ Dashboard com estatísticas de vendas
- ✅ Gestão de pedidos em tempo real
- ✅ Filtros e busca avançada
- ✅ Atualização de status de pedidos

### Integração de Pagamentos
- ✅ Gateway Nivuspay configurado
- ✅ Processamento real de pagamentos
- ✅ Webhook para atualizações de status
- ✅ Fallback para simulação em desenvolvimento

## 🛠️ Configuração

### 1. Variáveis de Ambiente

As seguintes variáveis já estão configuradas no projeto:

\`\`\`env
# Supabase
SUPABASE_URL=https://yuaysyvbjtgsrplqarhf.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://yuaysyvbjtgsrplqarhf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Nivuspay (já configurado nas Edge Functions)
NIVUSPAY_SECRET_KEY=bf2f4316-2e4f-4ee7-8247-78b0536795df
NIVUSPAY_PUBLIC_KEY=6b46a622-3c03-4e4d-af9c-c13b8d398e70
\`\`\`

### 2. Banco de Dados

Execute os scripts SQL na seguinte ordem:

1. **Criar estrutura do banco:**
   \`\`\`bash
   # Execute: scripts/001_create_database_schema.sql
   \`\`\`

2. **Popular com dados iniciais:**
   \`\`\`bash
   # Execute: scripts/002_seed_products.sql
   \`\`\`

### 3. Edge Functions (Supabase)

Deploy das Edge Functions para produção:

\`\`\`bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Deploy das functions
supabase functions deploy checkout
supabase functions deploy webhook-nivuspay

# Configurar secrets
supabase secrets set NIVUSPAY_SECRET_KEY=bf2f4316-2e4f-4ee7-8247-78b0536795df
supabase secrets set NIVUSPAY_PUBLIC_KEY=6b46a622-3c03-4e4d-af9c-c13b8d398e70
\`\`\`

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

**products**
- `id` (UUID, PK)
- `name` (TEXT)
- `description` (TEXT)
- `price` (NUMERIC)
- `image_url` (TEXT)
- `category` (TEXT)
- `is_featured` (BOOLEAN)

**customers**
- `id` (UUID, PK)
- `name` (TEXT)
- `email` (TEXT, UNIQUE)
- `phone` (TEXT)

**orders**
- `id` (UUID, PK)
- `customer_id` (UUID, FK)
- `product_id` (UUID, FK)
- `quantity` (INTEGER)
- `total_amount` (NUMERIC)
- `payment_status` (TEXT)
- `payment_id` (TEXT)

## 🎨 Design System

### Cores
- **Primária:** Rose/Pink (#e11d48)
- **Secundária:** Warm Gray (#6b7280)
- **Accent:** Gold (#f59e0b)
- **Background:** Gradient rose-50 to pink-50

### Tipografia
- **Headings:** Playfair Display (serif)
- **Body:** Inter (sans-serif)

## 🔐 Segurança

- Row Level Security (RLS) ativado em todas as tabelas
- Políticas de acesso configuradas
- Validação de dados no frontend e backend
- Chaves de API protegidas via environment variables

## 📱 Responsividade

- Mobile-first design
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Menu mobile com Sheet component
- Tabelas responsivas com scroll horizontal

## 🚀 Deploy

### Netlify
1. Conecte o repositório ao Netlify
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Vercel (Alternativa)
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

## 📈 Monitoramento

### Painel Administrativo
Acesse `/admin` para:
- Visualizar estatísticas de vendas
- Gerenciar pedidos
- Atualizar status de pagamentos
- Filtrar e buscar pedidos

### Logs
- Edge Functions: Console do Supabase
- Frontend: Browser DevTools
- Pagamentos: Dashboard Nivuspay

## 🔧 Desenvolvimento

\`\`\`bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar testes
npm run test
\`\`\`

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs no console do navegador
2. Confirme se as variáveis de ambiente estão configuradas
3. Teste a conexão com Supabase no painel administrativo
4. Verifique o status das Edge Functions no dashboard do Supabase

---

**Status do Projeto:** ✅ Produção Ready
**Última Atualização:** Agosto 2025
