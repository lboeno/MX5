# Plano — Sprint 1: Inscrição do Piloto em Evento Aberto (PortalMX)

## Objetivo da Sprint 1
Um piloto logado, com cadastro completo, consegue se inscrever em um evento aberto. O
sistema auto-preenche os dados do piloto (sem re-digitar), a inscrição é criada em
`pilot_registrations` com `status='pending'` e `payment_status='pending'`, a vaga fica
reservada, e o admin consegue visualizar a lista de inscritos por evento logo após.

Decisões já confirmadas com o usuário:
- `pilot_registrations` permanece **mínimo** (não adicionar as 35 colunas). Dados do piloto
  vêm da tabela `pilots` no momento da leitura. **Corrigir o bug** do `Registrar.tsx` que
  insere ~35 colunas inexistentes.
- Sprint 1 cria inscrição apenas com `status='pending'` + `payment_status='pending'`.
  Aprovação/pagamento/check-in ficam para Sprint 2+.
- A inscrição do piloto em evento ocorre em **nova página** `/eventos/:slug/inscrever`
  (não em modal). A tela de sucesso do fluxo de evento é **diferente** da tela de sucesso
  do cadastro de piloto (`Registrar.tsx`), que permanece como está.

---

## 1. Migração SQL (banco Supabase)

Arquivo novo: `supabase/migrations/013_event_registration_flow.sql`

Conteúdo:
- `ALTER TABLE pilot_registrations`:
  - ampliar CHECK de `status` para incluir os estados do fluxo:
    `('pending','confirmed','cancelled','waitlist','approved','payment_confirmed','check_in','racing','finished')`
  - adicionar coluna `payment_status TEXT NOT NULL DEFAULT 'pending'`
    CHECK `('pending','paid','refund','cancelled','na')` (usar `'na'` quando não há taxa).
  - adicionar coluna `registration_number TEXT` (preencher no insert da app; já existe
    geração `MX-<6 dígitos>` no `Registrar.tsx` e será reutilizada no novo serviço).
- Policies RLS já existem (admin ALL, pilot select/insert own). Nenhuma nova necessária para Sprint 1.

> Nota: o `Registrar.tsx` atual insere colunas como `registration_number`, `full_name`,
> `cpf`, `competition_category`, etc. que **não existem** na tabela → erro em produção.
> Corrigir no passo 5 (abaixo) reduzindo o insert ao mínimo necessário.

---

## 2. Tipos (`src/types/events.ts`)

Em `src/types/events.ts` adicionar:
```ts
export type RegistrationStatus =
  | "pending" | "approved" | "confirmed" | "waitlist"
  | "payment_confirmed" | "check_in" | "racing" | "finished" | "cancelled";

export type PaymentStatus = "pending" | "paid" | "refund" | "cancelled" | "na";

export interface EventRegistration {
  id: string;
  eventId: string;
  pilotId: string;
  registrationNumber?: string;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  confirmedAt?: string;
  // dados denormalizados para a lista do admin (join em tempo de leitura)
  pilotName: string;
  pilotNumber: string;
  category: string;
  team?: string;
}
```

---

## 3. Serviço de inscrição — `src/services/registrations.ts` (novo)

Funções:
- `getMyRegistrationForEvent(eventId): Promise<EventRegistration | null>`
  - `supabase.from("pilot_registrations").select("*").eq("event_id", eventId)` com filtro
    implícito pela RLS (pilot select own). Retorna null se não inscrito.
- `enrollPilotInEvent(eventId): Promise<EventRegistration>`
  - `fetchMyPilot()` → se `null`, lançar erro "Cadastro incompleto".
  - **Validação de completude** (`isPilotComplete(pilot)`): obrigatórios =
    `name`, `number`, `category`, `emergencyContact.name`, `emergencyContact.phone`.
    Se faltar algo → lançar erro específico (a UI redireciona para `/piloto` para completar).
  - Gera `registrationNumber = "MX-" + Date.now().toString().slice(-6)`.
  - `insert({ pilot_id, event_id, registration_number, status: "pending", payment_status: "pending" })`.
  - A vaga já conta em `getRegisteredCount` (existente) por causa do novo row.
  - Retorna o row mapeado para `EventRegistration`.
- `getRegistrationsForEvent(eventId): Promise<EventRegistration[]>`
  - select com join: `pilot_registrations(*, pilots(name, number, team_name, categories(name)))`
  - mapeia para `EventRegistration` (pilotName/number/category/team).
- Exportar em `src/services/index.ts` (ou `events/index.ts`) para reuse.

Reuse existente: `fetchMyPilot` (`src/lib/pilots.ts:79`), `getCategoryId`/`toAppCategoryName`
(`src/lib/categories.ts`), `getRegisteredCount` (`src/services/events/fetch.ts:35`).

---

## 4. Página de inscrição — `src/features/events/EnrollEventPage.tsx` (nova)

Rota: `/eventos/:slug/inscrever` (adicionar em `src/App.tsx:79` e em `src/lib/routes.ts`).

Fluxo da página:
1. Carrega `getEventBySlug(slug)` (já existe). Se `eventStatus !== "registration_open"`
   → mostra aviso "Inscrições não estão abertas para este evento" + botão voltar.
2. `useAuth()` → se não logado, redireciona para `/login?redirect=...`.
3. `fetchMyPilot()` → se `null` ou incompleto → banner "Complete seu cadastro para se
   inscrever" + link `/piloto` (Meu Perfil).
4. `getMyRegistrationForEvent(event.id)` → se já existe → mostra estado "Você já está
   inscrito" (evita duplicata; UNIQUE constraint também protege).
5. Tela de **revisão + confirmação** (Fase 3 do spec):
   - Card mostrando dados auto-preenchidos do piloto: Nome, Número, Categoria, Moto
     (marca/modelo/ano), Equipe.
   - Dois checkboxes obrigatórios: "Confirmo meus dados" e "Aceito o regulamento".
   - Botão **[ Confirmar inscrição ]** (desabilitado até os dois marcados).
6. Ao confirmar → `enrollPilotInEvent(event.id)` → **tela de sucesso** (ver seção 6).
7. Tratamento de erro: mensagens claras para cada caso negativo (não logado, incompleto,
   já inscrito, inscrições fechadas).

Estilo: usar `Card`, `Button` (variant primary/outline/ghost), tokens de tema
(`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`) — **não** usar
hardcoded `bg-[#09090b]`/`text-white`/`text-zinc-*`.

---

## 5. Corrigir `src/features/auth/Registrar.tsx` (bug de schema)

O insert em `pilot_registrations` (linhas ~376–424) referencia ~35 colunas inexistentes.
Como decidido, reduzir para o mínimo e manter o fluxo de upload de documentos separado
(que vai para `registration_documents`, tabela correta):
- Remover o bloco de insert em `pilot_registrations`. O `Registrar.tsx` é o cadastro inicial
  do piloto e NÃO tem `event_id` (não é inscrição em evento). Deixar apenas a criação do
  `pilots` + upload de documentos para `registration_documents`.
- Isso elimina o bug de colunas e alinha o modelo: `pilot_registrations` = inscrição em
  evento (sempre com event_id, criada via `enrollPilotInEvent`).
- Ajustar a tela de sucesso do `Registrar.tsx` (linhas 497–567) para não referenciar
  "Número da Inscrição" de evento de forma enganosa (mostrar apenas confirmação de cadastro).

---

## 6. Tela de sucesso (event enrollment) — layout do usuário

Implementar dentro de `EnrollEventPage.tsx` (estado pós-`enrollPilotInEvent`):

```
               ✅ Inscrição realizada!

Sua inscrição foi enviada com sucesso.

Inscrição
MX-950188

Status
🟡 Aguardando análise

────────────────────────────

        [ Ver minha inscrição ]

   [ Ver eventos ]   [ Meu Perfil ]

        [ Voltar para Home ]
```

- **Ver minha inscrição** → futuro `/piloto/inscricoes/:id` (Sprint 2). Por ora navega para
  `/piloto` (área do piloto).
- **Ver eventos** → `/eventos`.
- **Meu Perfil** → `ROUTES.PILOT` (`/piloto`) — link "atualizar documentos, moto, equipe,
  contatos".
- **Voltar para Home** → `/`.

### "Próximos passos" (ideia futura, incluída como componente reaproveitável)
Mini timeline vertical reutilizando o padrão do `Stepper` (`src/components/ui/Stepper.tsx`):
```
✔ Inscrição enviada
⏳ Pagamento
⏳ Homologação
⏳ Check-in
⏳ Corrida
⏳ Resultado
```
Implementar como pequeno componente `RegistrationTimeline` mostrando o passo 0 concluído e
os demais pendentes. Antecipa a Fase 6 do spec e reduz suporte.

---

## 7. Admin — visualizar inscritos (`/admin/inscricoes`)

Substituir `AdminPlaceholder` em `src/App.tsx:109` por `AdminRegistrations` (nova página
`src/features/admin/AdminRegistrations.tsx`):
- Seletor de evento (reuse `fetchAllEvents` / `getEvent`).
- Ao selecionar → `getRegistrationsForEvent(eventId)` → tabela:
  Piloto | Número | Categoria | Equipe | Status | Pagamento.
- Status badge com cores por estado (`pending`=amarelo, etc.).
- (Sprint 1 é somente visualização; aprovar/cancelar fica Sprint 2.)
- Reuse `Card`, `Badge`, `Button`, tokens de tema.

---

## 8. Wire dos botões "Inscrever-se"

- `src/features/events/EventsPage.tsx` (~linha 199): botão "Inscrever-se" (quando
  `eventStatus === "registration_open"`) → `<Link to={/eventos/${slug}/inscrever}>`.
- `src/features/events/EventDetailPage.tsx` (~linha 313): botão "Inscrever-se agora"
  → navega para `/eventos/${slug}/inscrever` (hoje aponta para si mesmo — bug).
- Ambos respeitam `disabled` quando não aberto.

---

## 9. Arquivos afetados (resumo)

| Arquivo | Ação |
|---|---|
| `supabase/migrations/013_event_registration_flow.sql` | NOVO — amplia status, add `payment_status`, `registration_number` |
| `src/types/events.ts` | ADD `RegistrationStatus`, `PaymentStatus`, `EventRegistration` |
| `src/services/registrations.ts` | NOVO — enroll/get/list |
| `src/services/index.ts` (ou events) | exportar `registrations` |
| `src/features/events/EnrollEventPage.tsx` | NOVO — revisão + confirmação + sucesso |
| `src/features/admin/AdminRegistrations.tsx` | NOVO — lista de inscritos |
| `src/App.tsx` | ADD rota `/eventos/:slug/inscrever`; trocar stub `/admin/inscricoes` |
| `src/lib/routes.ts` | ADD `ENROLL_EVENT`, `ADMIN_REGISTRATIONS` |
| `src/features/events/EventsPage.tsx` | botão → rota de inscrição |
| `src/features/events/EventDetailPage.tsx` | corrigir botão "Inscrever-se agora" |
| `src/features/auth/Registrar.tsx` | REMOVER insert inválido em `pilot_registrations` (corrigir bug) |

---

## 10. Verificação

- `npx tsc --noEmit` sem novos erros.
- `npx vite build` ok.
- Fluxo manual (Vercel preview):
  1. Piloto logado com cadastro completo acessa evento aberto → Inscrever-se.
  2. Revê dados auto-preenchidos → marca 2 checkboxes → Confirma.
  3. Vê tela de sucesso com nº MX-______ e status "Aguardando análise".
  4. Admin `/admin/inscricoes` → seleciona evento → vê o piloto na lista.
  5. Tentar inscrever de novo → "já inscrito".
  6. Piloto com cadastro incompleto → bloqueado com link para /piloto.
