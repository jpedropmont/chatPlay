# 🚀 Como Gerar o Instalador Windows

## Pré-requisitos

Você já tem tudo instalado, mas para referência:
- ✅ Node.js
- ✅ npm
- ✅ electron-builder (instalado nas dependências)

## Passo 1: Converter Ícone (Opcional)

O instalador precisa de um arquivo `.ico` (ícone do Windows). Você tem duas opções:

### Opção A: Usar Conversor Online (Recomendado)
1. Acesse: https://convertio.co/png-ico/
2. Faça upload de `assets/icon.png`
3. Escolha tamanho: 256x256
4. Converta para `.ico`
5. Baixe e salve como `assets/icon.ico`

### Opção B: Usar ImageMagick (Se tiver instalado)
```bash
convert assets/icon.png -define icon:auto-resize=256,128,96,64,48,32,16 assets/icon.ico
```

### Opção C: Remover Ícones do package.json (Temporário)
Se não quiser converter agora, edite `package.json` e remova estas linhas:
```json
"installerIcon": "assets/icon.ico",
"uninstallerIcon": "assets/icon.ico",
"installerHeaderIcon": "assets/icon.ico",
```

## Passo 2: Gerar o Instalador

Execute o comando:

```bash
npm run build
```

**Tempo estimado:** 2-5 minutos (primeira vez pode ser mais)

### O que acontece durante o build:

1. ⏳ Instala dependências do electron-builder (se necessário)
2. ⏳ Compila o código Electron
3. ⏳ Empacota todos os arquivos necessários
4. ⏳ Cria o instalador NSIS para Windows
5. ✅ Gera o arquivo `.exe` final

### Saída esperada:

```
• electron-builder  version=26.0.12
• loaded configuration  file=package.json
• building        target=nsis arch=x64
• packaging       platform=win32 arch=x64 electron=28.0.0
• building block map  blockMapFile=dist\ChatPlay Soundboard Setup 1.0.0.exe.blockmap
• building        target=nsis file=dist\ChatPlay Soundboard Setup 1.0.0.exe archs=x64
```

## Passo 3: Localizar o Instalador

Após o build, o instalador estará em:

```
dist/ChatPlay Soundboard Setup 1.0.0.exe
```

**Tamanho aproximado:** 150-200 MB (inclui Electron + ffmpeg + todos os recursos)

## Passo 4: Testar Localmente (Opcional)

Antes de enviar para outro PC, teste:

```bash
npm run build:dir
```

Isso cria uma versão descompactada em `dist/win-unpacked/` que você pode executar sem instalar.

## Passo 5: Distribuir

### Método 1: GitHub Releases (Recomendado)
```bash
# Se tiver repositório Git
git tag v1.0.0
git push origin v1.0.0
# Depois faça upload do .exe nas Releases
```

### Método 2: Google Drive
1. Faça upload de `dist/ChatPlay Soundboard Setup 1.0.0.exe`
2. Compartilhe o link
3. Baixe no outro PC

### Método 3: Pen Drive
Copie o arquivo `.exe` direto para um pen drive

## Passo 6: Instalar no Outro PC

No outro PC:

1. **Execute o instalador:**
   - `ChatPlay Soundboard Setup 1.0.0.exe`
   - Escolha o diretório
   - Aguarde a instalação
   - Pronto! Na primeira vez que baixar um áudio do YouTube, o yt-dlp.exe será baixado automaticamente

2. **(Opcional) Instale VB-CABLE:**
   - Só se precisar de microfone virtual para Discord/OBS
   - https://vb-audio.com/Cable/
   - Execute como Administrador
   - Reinicie o PC

## Estrutura do Instalador

O instalador inclui:
- ✅ Aplicativo Electron completo
- ✅ Node.js embutido (não precisa instalar Node)
- ✅ ffmpeg-static (áudio)
- ✅ Download automático de yt-dlp.exe na primeira vez (~10 MB)
- ✅ Todos os assets e recursos

O instalador **NÃO** inclui:
- ❌ VB-CABLE (opcional - apenas se precisar de microfone virtual)

## Solução de Problemas no Build

### Erro: "Cannot find module 'electron-builder'"
```bash
npm install
```

### Erro: "Icon file not found"
Remova as linhas de ícone do `package.json` ou converta o PNG para ICO

### Erro: "ENOENT: no such file or directory"
Verifique se todos os arquivos existem:
- `download_youtube.py`
- `main.js`
- `renderer.js`
- `index.html`
- `package.json`

### Build muito lento
Normal na primeira vez. Builds subsequentes são mais rápidos.

### Arquivo muito grande
O Electron + ffmpeg ocupam ~150MB. É normal.

## Versão Portável (Sem Instalador)

Se quiser apenas uma versão portável sem instalador:

```bash
npm run build:dir
```

Isso cria `dist/win-unpacked/` que pode ser copiado para qualquer lugar e executado diretamente com `ChatPlay Soundboard.exe`.

**Vantagens:**
- Não precisa instalar
- Pode rodar de um pen drive
- Não precisa permissões de administrador

**Desvantagens:**
- Não cria atalhos automaticamente
- Não aparece na lista de programas
- Maior espaço (não compactado)

## Comandos Úteis

```bash
# Build completo (instalador)
npm run build

# Build sem instalador (portável)
npm run build:dir

# Executar em modo desenvolvimento
npm start

# Limpar builds anteriores
rm -rf dist
```

## Checklist Final

Antes de distribuir, verifique:

- [ ] Build executou sem erros
- [ ] Arquivo `.exe` foi gerado em `dist/`
- [ ] Testou o instalador localmente (opcional)
- [ ] Criou documentação de instalação
- [ ] Documentou requisitos (Python, yt-dlp, VB-CABLE)
- [ ] Testou em ambiente limpo (outro PC)

## Próximos Passos

1. **Gere o instalador:** `npm run build`
2. **Teste localmente:** Execute o `.exe` gerado
3. **Distribua:** Faça upload ou copie para pen drive
4. **Instale no outro PC:** Siga o guia `INSTALADOR.md`
5. **Configure:** Instale Python, yt-dlp e VB-CABLE
6. **Teste:** Baixe um áudio do YouTube e teste os atalhos globais

---

## Notas Importantes

- O instalador é **assinado** apenas se você tiver um certificado de código. Sem certificado, o Windows mostrará um aviso de "Editor desconhecido" - é normal, clique em "Mais informações" → "Executar assim mesmo"

- Os **atalhos globais** funcionam apenas quando o aplicativo está **executando**. Minimize para a bandeja em vez de fechar.

- Os **áudios do YouTube** são salvos permanentemente em `%APPDATA%\chatplay-soundboard\youtube-sounds\` - mesmo se desinstalar o app, os áudios permanecem.

- O instalador **substitui** versões antigas automaticamente. Não precisa desinstalar antes de atualizar.

**Boa sorte com o instalador! 🚀**
