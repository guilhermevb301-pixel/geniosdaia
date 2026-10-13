# Backup diário do prontuário

Rotina administrativa no projeto `wubzprfmwsfvwvptywlf` (Miza doctor).
O app não exibe download, restauração, exclusão geral ou lembretes de backup.

## Instalação

1. Executar `daily-backup.sql` como postgres no painel do projeto.
2. Publicar `functions/prontuario-daily-backup/index.ts`, mantendo verificação JWT ligada.
3. Executar `schedule-backup.sql` e chamar `select public.prontuario_request_backup();`.
4. Conferir `prontuario_backup_runs`: uma execução só fica `complete` após verificar os arquivos e guardar o manifesto.

A rotina roda às 02h de America/Bahia, com novas tentativas às 05h e 08h.
Se já existe uma cópia completa naquele dia, as tentativas seguintes não criam outra.
Não depende do computador ou de o usuário abrir o aplicativo.

## Conteúdo e isolamento

- Snapshot transacional das tabelas patients, appointments e clinic_settings.
- Cópias dos bytes de todos os objetos do bucket prontuario, incluindo imagens e documentos.
- Manifesto JSON com os registros e o mapeamento entre os caminhos originais e suas cópias.
- Bucket privado `prontuario-backups`; nenhuma política permite acesso a anon/authenticated.
- Tabela de execuções com RLS e acesso somente administrativo/service_role.
- Token da rotina gerado e armazenado dentro do Vault. A service-role nunca vai para o cliente.
- Cópias por revisão: arquivos inalterados são reaproveitados; versões antigas não são sobrescritas.
- Tamanho e eTag são comparados antes de declarar sucesso. Anexos ausentes impedem sucesso.
- Não há limpeza automática de cópias neste primeiro lançamento; acompanhar o uso de armazenamento.

## Verificação operacional (somente administração)

```sql
select backup_day, status, started_at, completed_at,
       jsonb_array_length(files) as files, error_code
from public.prontuario_backup_runs order by started_at desc limit 10;
select jobname, schedule, active from cron.job where jobname='prontuario-daily-backup';
```

Falhas aparecem na tabela e nos logs da função, com códigos sem dados clínicos.
Uma falha de snapshot anterior à criação de uma execução aparece em `net._http_response`.

## Recuperação

Antes de restaurar, interromper gravações no app e preservar o estado atual.
Escolher uma execução `complete`, baixar seu manifesto administrativo e verificar todos os objetos indicados.
Restaurar primeiro os arquivos com o mapeamento do manifesto e então os registros preservando `owner_id` e os dados originais.
Fazer a primeira restauração em ambiente isolado, conferir pacientes, anexos, pagamentos e agenda, e só depois aplicar no projeto original com autorização do responsável.
Não existe botão de restauração no aplicativo do doutor.

## Limite de proteção

Esta cópia está em um bucket separado **dentro do mesmo projeto Supabase**.
Protege o histórico contra alterações/exclusões feitas pelo app, mas não é uma cópia externa contra perda ou exclusão integral do projeto/conta.
Também não é um dump completo do PostgreSQL/Auth. Para recuperação integral de infraestrutura, combinar com backups nativos do plano pago ou uma cópia externa autorizada.
