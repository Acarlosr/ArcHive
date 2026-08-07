# 🔒 Correções de Segurança - ArcHive

## Problema Detectado
O GitHub detectou uma **chave secreta Supabase** exposta no arquivo `Superbase.txt`:
```
sb_secret_h6MhyQP8uJ49QkPstZL5cA_Boy_0A6w
```

## ✅ Ações Realizadas

1. **Removidas as chaves secretas** do arquivo `Superbase.txt`
2. **Criado commit de segurança** removendo as credenciais

## 🔐 Próximos Passos IMPORTANTES

### 1. Revogar a Chave Exposta
**Imediatamente**, acesse:
https://github.com/Acarlosr/ArcHive/security/secret-scanning/unblock-secret/3Fijq4LybCEN3jOvw1EslDqgOmu

E clique em "Allow" para desbloquear o repositório.

### 2. Fazer Push das Mudanças
```bash
cd /Volumes/Curso/ArcHive
git push origin main
```

### 3. Regenerar Chaves no Supabase
1. Acesse: https://app.supabase.com
2. Vá para **Settings → API**
3. Delete a chave antiga: `sb_secret_h6Mhy...`
4. Gere uma nova chave
5. Atualize seu arquivo `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://ibhrrxqjxojzfrprinbq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu_novo_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_nova_secret_key_aqui
```

### 4. Nunca Mais Commitar Secrets
Adicione ao `.gitignore`:
```
# Environment variables
.env
.env.local
.env.*.local
Superbase.txt
```

## 📋 Arquivos que NÃO devem estar no Git
- `.env`, `.env.local`
- `Superbase.txt` (ou renomear para `.gitignore`)
- Qualquer arquivo com API keys, senhas ou tokens

## 🛡️ Boas Práticas
1. **Sempre use variáveis de ambiente** para secrets
2. **Use GitHub Secrets** para CI/CD
3. **Nunca comite** arquivos `.txt` com credenciais
4. **Use `git-secrets`** para prevenir commits futuros

## 📚 Referências
- GitHub Secret Scanning: https://docs.github.com/en/code-security/secret-scanning
- Supabase Security: https://supabase.com/docs/guides/api/api-keys
- Git Secrets Tool: https://github.com/awslabs/git-secrets
