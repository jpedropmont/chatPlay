# 🚀 Criar Release no GitHub

## Seu Repositório
**URL:** https://github.com/jpedropmont/chatPlay

## Passos para Criar Release:

### 1. Acessar Releases
1. Acesse: https://github.com/jpedropmont/chatPlay/releases
2. Clique em **"Create a new release"** ou **"Draft a new release"**

### 2. Escolher Tag
- **Choose a tag:** Selecione `v1.0.0` (já criada)
- Ou digite `v1.0.0` se não aparecer

### 3. Título e Descrição

**Release title:**
```
v1.0.0 - ChatPlay Soundboard Standalone
```

**Describe this release:**
```markdown
## 🎉 ChatPlay Soundboard v1.0.0

### Instalador 100% Standalone!

**Download:** `ChatPlay Soundboard Setup 1.0.0.exe` (~180 MB)

### ✨ Funcionalidades

- 🎵 **Soundboard** - Adicione e reproduza seus áudios favoritos
- 📥 **YouTube** - Baixe áudios direto do YouTube (sem Python!)
- ⌨️ **Atalhos Globais** - Shift+F1 a F12 funcionam em qualquer programa
- 🎤 **Efeitos de Voz** - Robô, grave, agudo, eco, reverb e mais
- 🔊 **Microfone Virtual** - Use com Discord, OBS, jogos
- 💾 **Auto-Save** - Tudo salvo automaticamente

### 📦 Instalação

1. Baixe o instalador abaixo
2. Execute `ChatPlay Soundboard Setup 1.0.0.exe`
3. Clique em "Next" → "Install"
4. Pronto! O yt-dlp será baixado automaticamente na primeira vez

### 📋 Requisitos

- **Windows 10/11** (64-bit)
- **VB-CABLE** (opcional - apenas para microfone virtual)
  - Download: https://vb-audio.com/Cable/

### 🎯 Novidades desta Versão

#### ✅ 100% Standalone
- Não precisa Python instalado
- Não precisa yt-dlp instalado
- yt-dlp.exe baixado automaticamente (~10 MB, 5-10 seg)

#### ⌨️ Atalhos Globais
- 48 combinações disponíveis (Shift+F1-F12, Ctrl+Shift+F1-F12, etc.)
- Funcionam em qualquer programa (Discord, jogos, VSCode)
- Configuráveis por áudio

#### 🎨 Design Minimalista
- Interface limpa e moderna
- Lista unificada de áudios
- Player fixo na parte inferior
- Drag-and-drop para reordenar

#### 📥 YouTube Permanente
- Áudios baixados ficam salvos
- Títulos dos vídeos preservados
- Armazenamento em `%APPDATA%\chatplay-soundboard\`

### 🐛 Solução de Problemas

**"Erro ao baixar do YouTube"**
- Aguarde 5-10 segundos na primeira vez (baixando yt-dlp.exe)
- Verifique conexão com internet

**"Áudios não tocam no Discord"**
- Instale VB-CABLE: https://vb-audio.com/Cable/
- Configure Discord: Voz → Entrada → CABLE Output

**"Atalhos não funcionam"**
- Execute como Administrador
- Verifique se outro programa não usa o mesmo atalho

### 📄 Licença

MIT License

---

**Desenvolvido para gamers e streamers ❤️**
```

### 4. Anexar Instalador

1. Clique em **"Attach binaries"** ou arraste o arquivo
2. Selecione: `dist/ChatPlay Soundboard Setup 1.0.0.exe`
3. Aguarde o upload (~180 MB pode demorar alguns minutos)

### 5. Publicar

- Marque **"Set as the latest release"** ✅
- Clique em **"Publish release"**

## ✅ Pronto!

Seu instalador estará disponível em:
```
https://github.com/jpedropmont/chatPlay/releases/tag/v1.0.0
```

Os usuários poderão baixar diretamente:
```
https://github.com/jpedropmont/chatPlay/releases/download/v1.0.0/ChatPlay.Soundboard.Setup.1.0.0.exe
```

## 📊 Estatísticas da Release

Após publicar, você verá:
- Número de downloads
- Assets (arquivos anexados)
- Data de publicação
- Tag/Commit associado

## 🔄 Próximas Versões

Para criar novas versões:

```powershell
# Fazer alterações no código
git add .
git commit -m "feat: nova funcionalidade"
git push

# Criar nova versão
git tag -a v1.1.0 -m "v1.1.0 - Descrição"
git push origin v1.1.0

# Gerar novo instalador
npm run build

# Criar nova release no GitHub com novo instalador
```

## 📝 Dicas

1. **Changelog**: Mantenha um histórico detalhado das mudanças
2. **Semantic Versioning**: Use vX.Y.Z
   - X = Major (mudanças incompatíveis)
   - Y = Minor (novas funcionalidades)
   - Z = Patch (correções de bugs)
3. **Pre-releases**: Marque versões beta/alpha como pre-release
4. **Assets**: Inclua checksum (SHA256) para verificação

## 🎉 Compartilhe!

Depois de publicar, compartilhe:
- Discord
- Twitter/X
- Reddit
- Fóruns de jogos

**Link direto do release:**
```
https://github.com/jpedropmont/chatPlay/releases/latest
```

**Boa sorte! 🚀**
