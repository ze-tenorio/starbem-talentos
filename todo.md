# Starbem - Banco de Talentos TODO

## Funcionalidades Principais

### Banco de Dados
- [ ] Criar schema de candidatos com campos de perfil, formação e validações
- [ ] Criar schema de logs de submissão e status
- [ ] Criar índices para otimizar buscas por categoria e status

### Formulário Multi-etapa
- [x] Implementar componente de seleção inicial de perfil (4 opções)
- [x] Implementar fluxo de perguntas customizado por perfil
- [x] Implementar navegação fluida entre etapas (próximo/anterior)
- [x] Implementar validação de campos em tempo real
- [x] Implementar indicador de progresso visual

### Validações Técnicas por Perfil
- [ ] Validações para Médico Clínico (CRM, experiência, especialidades)
- [ ] Validações para Médico Especialista (CRM, especialidades, certificações)
- [ ] Validações para Psicólogo (CRP, experiência, abordagens)
- [ ] Validações para Nutricionista (CRN, experiência, certificações)

### Validações Regulatórias
- [x] Implementar verificação de CNPJ formalizado
- [x] Implementar redirecionamento para Contabilizei quando sem CNPJ
- [x] Implementar retorno ao formulário após formalização
- [x] Implementar sistema de classificação (Pronto vs Com Pendências)

### Armazenamento em Nuvem
- [ ] Implementar upload de arquivos para S3
- [ ] Implementar organização automática por pastas (Medicina, Psicologia, Nutrição)
- [ ] Implementar subpastas (Candidatos Prontos, Com Pendências)
- [ ] Implementar geração automática de PDF com dados do candidato

### Página de Boas-vindas
- [x] Criar página de boas-vindas personalizada
- [x] Implementar apresentação da Starbem
- [x] Implementar informações de acompanhamento
- [x] Implementar newsletter signup

### Dashboard Administrativo
- [x] Criar layout do dashboard com autenticação
- [x] Implementar visualização de candidatos por categoria
- [x] Implementar filtros e busca
- [x] Implementar visualização de status (Pronto vs Pendências)
- [x] Implementar download de relatórios

### Notificações
- [ ] Implementar notificação ao owner quando novo candidato completa
- [ ] Implementar notificação com resumo dos dados

### Design Visual
- [ ] Implementar cores e tipografia Starbem
- [ ] Implementar design responsivo
- [ ] Implementar animações fluidas estilo Typeform

### Testes
- [x] Testes unitários para lógica de validação
- [x] Testes de fluxo do formulário
- [ ] Testes de armazenamento em S3

## Progresso Geral
- [x] Inicializar projeto web com scaffold
- [x] Estruturar banco de dados com schema de candidatos
- [x] Implementar formulário multi-etapa estilo Typeform
- [x] Criar página de boas-vindas
- [x] Implementar procedimentos tRPC para candidatos
- [ ] Implementar validações regulatórias e redirecionamento para Contabilizei
- [ ] Implementar armazenamento em S3
- [ ] Implementar dashboard administrativo
- [ ] Implementar notificações ao owner
- [ ] Testes e refinamento
- [ ] Deploy


## Correções Solicitadas
- [x] Corrigir erros de texto em todo o projeto
- [x] Atualizar link da Contabilizei para https://e.contabilizei.com.br/parceria-starbem-e-contabilizei
- [x] Revisar e testar fluxo de redirecionamento para Contabilizei

## Melhorias em Andamento
- [x] Adicionar logotipo oficial da Starbem ao formulário e páginas


## Novas Funcionalidades
- [ ] Adicionar etapa de disponibilidade (dias da semana e turnos)
