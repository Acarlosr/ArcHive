# OpenGraph e Twitter Card Fix - ArcHive

## Alterações Realizadas

### 1. **opengraph-image.tsx**
- ✅ Adicionado `export const revalidate = 3600;` para cache de 1 hora
- ✅ Melhorias de layout com `justifyContent: "space-between"`
- ✅ Padronização de espaçamento e tipografia
- ✅ Melhor compatibilidade com diferentes dimensões de tela
- ✅ Adicionado `flexWrap: "wrap"` nos badges para responsividade

### 2. **layout.tsx - Metadata**
- ✅ URLs absolutas nas imagens OpenGraph: `https://archivearc.xyz/opengraph-image.png`
- ✅ URLs absolutas no Twitter: `https://archivearc.xyz/twitter-image.png`
- ✅ Adicionado `type: "image/png"` na metadata
- ✅ Melhor estrutura do OpenGraph com URL canônica completa
- ✅ Adicionado `creator: "@ArcHiveApp"` no Twitter card

## Como Aplicar

### Opção 1: Deploy Automático
Se você usa Vercel ou similar:
```bash
git add .
git commit -m "fix: OpenGraph and Twitter cards rendering"
git push origin main
```

### Opção 2: Build Local
```bash
npm run build
npm run start
```

## Verificação

Após fazer deploy, teste usando:

### X (Twitter)
1. Vá para: https://cards-dev.twitter.com/validator
2. Cole: https://www.archivearc.xyz
3. Clique em "Validate and Preview"

### Discord
1. Envie o link no Discord
2. Veja se a imagem aparece no preview

### Facebook / LinkedIn
1. Use: https://www.opengraphcheck.com/
2. Cole: https://www.archivearc.xyz

## Próximos Passos

Se a imagem ainda não aparecer:
1. Limpar cache: Aguarde ~1 hora para invalidação
2. Forçar refresh: https://twitter.com/search?q=site:archivearc.xyz&src=typed_query
3. Usar ferramenta de cache clearing do Twitter: https://twitter.com/intent/tweet

## Links de Referência
- Next.js OG Image Generation: https://nextjs.org/docs/app/api-reference/file-conventions/opengraph-image
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- Open Graph Checker: https://www.opengraphcheck.com/
