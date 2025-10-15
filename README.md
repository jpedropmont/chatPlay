# 🎵 ChatPlay Soundboard

Soundboard minimalista para Windows com YouTube, efeitos de voz e atalhos globais.

## ✨ Funcionalidades

- 🎵 **Soundboard** - Adicione e reproduza seus áudios favoritos
- 📥 **YouTube** - Baixe áudios direto do YouTube (sem Python!)
- ⌨️ **Atalhos Globais** - Shift+F1 a F12 funcionam em qualquer programa
- � **Efeitos de Voz** - Robô, grave, agudo, eco, reverb e mais
-  **Microfone Virtual** - Use com Discord, OBS, jogos (requer VB-CABLE)
- 💾 **Auto-Save** - Tudo salvo automaticamente

## � Instalação

### Baixar Instalador

1. Baixe `ChatPlay Soundboard Setup.exe`
2. Execute o instalador
3. Pronto! O yt-dlp será baixado automaticamente na primeira vez

### (Opcional) VB-CABLE

Só precisa se quiser usar microfone virtual no Discord/OBS:

1. Baixe: https://vb-audio.com/Cable/
2. Instale como Administrador
3. Reinicie o PC
4. Configure Discord/OBS: Entrada → CABLE Output

## 🎮 Como Usar

### Adicionar Áudios

1. **Locais**: Clique em "Adicionar Arquivo de Áudio" (MP3, WAV, M4A)
2. **YouTube**: Cole o link e clique em "Baixar Áudio"

### Atalhos Globais

1. Clique no botão do atalho (ex: "Shift+F1")
2. Pressione a combinação desejada
3. Use de qualquer programa! (Discord, jogos, VSCode, etc.)

**Combinações disponíveis:**
- Shift+F1 a F12 (12 áudios)
- Ctrl+Shift+F1 a F12 (mais 12)
- Alt+F1 a F12 (mais 12)
- Ctrl+Alt+F1 a F12 (mais 12)

### Efeitos de Voz

1. Ative o microfone
2. Escolha um efeito (Robô, Grave, Agudo, etc.)
3. Fale normalmente - efeito aplicado em tempo real!

## 🔧 Desenvolvimento

### Instalar Dependências

```bash
npm install
```

### Executar

```bash
npm start
```

### Gerar Instalador

```bash
npm run build
```

## 📁 Onde os Arquivos são Salvos

```
%APPDATA%\chatplay-soundboard\
├── youtube-sounds\    # Áudios baixados do YouTube
├── bin\yt-dlp.exe     # Baixado automaticamente
└── config.json        # Configurações
```

## � Solução de Problemas

### "Erro ao baixar do YouTube"

- Aguarde 5-10 segundos na primeira vez (baixando yt-dlp.exe)
- Verifique sua conexão com internet

### "Áudios não tocam no Discord"

- Instale VB-CABLE: https://vb-audio.com/Cable/
- Configure Discord: Voz → Entrada → CABLE Output

### "Atalhos não funcionam"

- Execute como Administrador
- Verifique se outro programa não usa o mesmo atalho

## 📝 Licença

MIT License

---

**Desenvolvido para gamers e streamers ❤️**
