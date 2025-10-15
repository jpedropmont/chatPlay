# Guia do Instalador Windows

## Criando o Instalador

### 1. Preparar o Build

Certifique-se que tem todas as dependências instaladas:

```bash
npm install
```

### 2. Gerar o Instalador

Execute o comando de build:

```bash
npm run build
```

Isso criará o instalador em: `dist/ChatPlay Soundboard Setup X.X.X.exe`

**Observação:** O build pode levar alguns minutos na primeira vez.

### 3. Arquivos Gerados

Após o build, você encontrará na pasta `dist/`:
- `ChatPlay Soundboard Setup X.X.X.exe` - Instalador principal
- `win-unpacked/` - Versão descompactada (não precisa instalar)
- Arquivos `.blockmap` e `.yaml` - Metadados (ignorar)

## Instalando no Computador

### O que o Instalador Faz

✅ Instala o aplicativo ChatPlay Soundboard
✅ Cria atalho na área de trabalho
✅ Cria atalho no menu iniciar
✅ Registra desinstalador no Windows
✅ Inclui suporte a YouTube (yt-dlp.exe baixado automaticamente)
✅ Inclui ffmpeg embutido

### O que o Instalador NÃO Faz (Opcional)

❌ VB-CABLE - Microfone virtual (opcional - para Discord/OBS)
  Baixe apenas se precisar: https://vb-audio.com/Cable/

### Passo a Passo da Instalação

#### 1. Instalar ChatPlay Soundboard

1. Execute `ChatPlay Soundboard Setup.exe`
2. Escolha o idioma (English)
3. Escolha o diretório de instalação (ou deixe padrão)
4. Clique em "Install"
5. Aguarde a instalação
6. Marque "Run ChatPlay Soundboard" e clique em "Finish"
7. ✅ **Pronto!** Na primeira vez que baixar um áudio do YouTube, o yt-dlp.exe será baixado automaticamente

#### 2. (Opcional) Instalar VB-CABLE

**Só instale se precisar de microfone virtual para Discord, OBS, etc:**
1. Acesse: https://vb-audio.com/Cable/
2. Baixe "VBCABLE_Driver_Pack43.zip"
3. Extraia o arquivo
4. Execute "VBCABLE_Setup_x64.exe" como Administrador
5. Clique em "Install Driver"
6. Reinicie o computador

#### 2. Instalar ChatPlay Soundboard

1. Execute `ChatPlay Soundboard Setup X.X.X.exe`
2. Escolha o idioma (English)
3. Escolha o diretório de instalação (ou deixe padrão)
4. Clique em "Install"
5. Aguarde a instalação
6. Marque "Run ChatPlay Soundboard" e clique em "Finish"

## Distribuindo para Outro PC

### Método 1: Upload e Download

1. **Compacte o instalador:**
   - Compacte o arquivo `.exe` em um `.zip` (opcional)
   
2. Faça upload:**
   - Google Drive
   - OneDrive
   - Dropbox
   - GitHub Releases
   - WeTransfer

3. **No outro PC:**
   - Baixe o instalador
   - Execute o instalador (yt-dlp.exe será baixado automaticamente na primeira vez)
   - (Opcional) Instale VB-CABLE se precisar de microfone virtual
   - Execute o aplicativo

### Método 2: Pen Drive

1. Copie o arquivo `.exe` para um pen drive
2. Leve até o outro PC
3. Execute o instalador (yt-dlp.exe será baixado automaticamente)
4. (Opcional) Instale VB-CABLE se precisar de microfone virtual

## Configuração Inicial

### 1. Configurar Microfone Virtual

Após instalar tudo:

1. Abra **Configurações do Windows** → **Som**
2. Em "Entrada", selecione **"CABLE Output"**
3. Abra o ChatPlay Soundboard
4. Na aba "Efeitos de Voz", configure o microfone

### 2. Configurar Discord/OBS/etc

**Discord:**
1. Configurações → Voz e Vídeo
2. Dispositivo de Entrada: **CABLE Output**
3. Teste tocando um áudio no soundboard

**OBS:**
1. Adicione fonte "Captura de Áudio"
2. Dispositivo: **CABLE Output**
3. Teste a captura

## Usar o Soundboard

### Atalhos Globais (Funcionam em QUALQUER programa)

- **Shift + F1 a F12**: Tocar áudios 1-12
- **Ctrl + Shift + F1 a F12**: Tocar áudios 13-24
- **Alt + F1 a F12**: Tocar áudios 25-36
- **Ctrl + Alt + F1 a F12**: Tocar áudios 37-48

### Adicionar Áudios

**Arquivo Local:**
1. Aba "Adicionar Áudio"
2. Clique em "Adicionar Arquivo de Áudio"
3. Selecione o arquivo MP3/WAV/M4A

**YouTube:**
1. Aba "Adicionar Áudio"
2. Cole o link do YouTube
3. Clique em "Baixar Áudio"
4. O áudio será salvo permanentemente em: `%APPDATA%\chatplay-soundboard\youtube-sounds\`

### Organizar Áudios

1. Aba "Soundboard"
2. Clique em "Ordenar"
3. Arraste os áudios para reordenar
4. Clique em "Salvar Ordem"

### Atribuir Atalhos

1. Clique no botão cinza do atalho (ex: "Shift+F1")
2. Pressione a combinação desejada
3. O atalho é salvo automaticamente

## Solução de Problemas

### "Erro ao baixar áudio do YouTube"

**Solução:**
1. Verifique sua conexão com a internet
2. O yt-dlp.exe será baixado automaticamente na primeira vez (~10 MB)
3. Aguarde alguns segundos e tente novamente

### "yt-dlp.exe não encontrado"

**Solução:**
1. Verifique se o firewall/antivírus não está bloqueando
2. Execute o ChatPlay como Administrador
3. O download automático será tentado novamente

### "Áudios não tocam no Discord"

**Solução:**
1. Verifique se o microfone virtual está selecionado
2. Configure o Discord para usar "CABLE Output"
3. Teste com um áudio

### "Atalhos globais não funcionam"

**Solução:**
1. Execute o ChatPlay como Administrador
2. Verifique se outro programa não usa os mesmos atalhos
3. Tente outras combinações (Ctrl+Shift+F1, Alt+F1)

## Desinstalar

1. Configurações do Windows → Aplicativos
2. Procure "ChatPlay Soundboard"
3. Clique em "Desinstalar"

**Observação:** Os áudios baixados do YouTube são preservados em `%APPDATA%\chatplay-soundboard\`

## Atualização

Para atualizar:
1. Gere um novo instalador com versão atualizada
2. Execute o novo instalador (ele substitui automaticamente)
3. Suas configurações e áudios são preservados

## Suporte

Se encontrar problemas:
1. Verifique se Python, yt-dlp e VB-CABLE estão instalados
2. Execute como Administrador
3. Verifique os logs no console (F12 para abrir DevTools)
