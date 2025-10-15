# 🔧 Configurar Git no Windows

## Passo 1: Instalar Git

### Opção A: Winget (Recomendado)
```powershell
winget install Git.Git
```

### Opção B: Download Manual
1. Acesse: https://git-scm.com/download/win
2. Baixe o instalador (64-bit)
3. Execute e clique em "Next" em todas as opções (padrões são bons)
4. **Importante:** Marque "Git from the command line and also from 3rd-party software"

### Opção C: Chocolatey
```powershell
choco install git
```

## Passo 2: Reiniciar PowerShell

Após instalar, **feche e abra novamente o PowerShell/VSCode**.

## Passo 3: Configurar Git

### 3.1 Nome de Usuário
```powershell
git config --global user.name "Seu Nome"
```

### 3.2 Email
```powershell
git config --global user.email "seuemail@example.com"
```

### 3.3 Editor Padrão (VSCode)
```powershell
git config --global core.editor "code --wait"
```

### 3.4 Branch Padrão (main)
```powershell
git config --global init.defaultBranch main
```

### 3.5 Line Endings (Windows)
```powershell
git config --global core.autocrlf true
```

## Passo 4: Verificar Configuração

```powershell
git config --list --global
```

Deve mostrar algo como:
```
user.name=Seu Nome
user.email=seuemail@example.com
core.editor=code --wait
init.defaultbranch=main
core.autocrlf=true
```

## Passo 5: Inicializar Repositório

No projeto ChatPlay:

```powershell
cd C:\Users\joaop\Documents\chatPlay
git init
```

## Passo 6: Criar .gitignore

Já existe um `.gitignore`, mas vou garantir que está completo:

```
# Dependências
node_modules/

# Build
dist/

# Sistema
.DS_Store
Thumbs.db
desktop.ini

# IDE
.vscode/
.idea/

# Logs
*.log
npm-debug.log*

# Temporários
*.tmp
*.temp
```

## Passo 7: Primeiro Commit

```powershell
git add .
git commit -m "🎉 Versão 1.0.0 - ChatPlay Soundboard Standalone"
```

## Passo 8: Criar Repositório no GitHub

### Via GitHub CLI (gh)

**Instalar gh:**
```powershell
winget install GitHub.cli
```

**Criar repo:**
```powershell
gh auth login
gh repo create chatplay-soundboard --public --source=. --push
```

### Via Web (Manual)

1. Acesse: https://github.com/new
2. Nome: `chatplay-soundboard`
3. Descrição: `Soundboard minimalista para Windows com YouTube e atalhos globais`
4. Público
5. Clique em "Create repository"

**Conectar local ao remoto:**
```powershell
git remote add origin https://github.com/SEU_USUARIO/chatplay-soundboard.git
git branch -M main
git push -u origin main
```

## Passo 9: Criar Release com Instalador

### Via GitHub CLI:
```powershell
gh release create v1.0.0 `
  "dist/ChatPlay Soundboard Setup 1.0.0.exe" `
  --title "v1.0.0 - Primeira Versão Standalone" `
  --notes "🎉 Instalador completo sem dependências Python!"
```

### Via Web:
1. GitHub → Seu Repo → Releases → "Create a new release"
2. Tag: `v1.0.0`
3. Title: `v1.0.0 - Primeira Versão Standalone`
4. Description:
```markdown
## 🎉 ChatPlay Soundboard v1.0.0

### Instalador 100% Standalone!

**Novidades:**
- ✅ Não precisa Python instalado
- ✅ yt-dlp.exe baixado automaticamente
- ✅ Atalhos globais (Shift+F1-F12)
- ✅ Download permanente do YouTube
- ✅ Efeitos de voz em tempo real
- ✅ Design minimalista

**Download:** ChatPlay Soundboard Setup 1.0.0.exe (~180 MB)

**Requisitos:**
- Windows 10/11 (64-bit)
- VB-CABLE (opcional - para microfone virtual)
```
5. Anexe: `ChatPlay Soundboard Setup 1.0.0.exe`
6. Clique em "Publish release"

## Comandos Úteis do Git

### Ver Status
```powershell
git status
```

### Adicionar Arquivos
```powershell
git add .                    # Todos
git add arquivo.js           # Específico
```

### Commit
```powershell
git commit -m "mensagem"
```

### Ver Histórico
```powershell
git log --oneline
```

### Push (enviar para GitHub)
```powershell
git push
```

### Pull (baixar do GitHub)
```powershell
git pull
```

### Criar Branch
```powershell
git checkout -b nova-feature
```

### Mudar Branch
```powershell
git checkout main
```

### Merge
```powershell
git merge nova-feature
```

## Credenciais GitHub

### Primeira Vez (HTTPS):
Windows vai pedir login do GitHub e salvar no Windows Credential Manager.

### SSH (Alternativa):

**Gerar chave:**
```powershell
ssh-keygen -t ed25519 -C "seuemail@example.com"
```

**Copiar chave pública:**
```powershell
Get-Content ~/.ssh/id_ed25519.pub | clip
```

**Adicionar no GitHub:**
1. GitHub → Settings → SSH and GPG keys → New SSH key
2. Cole a chave
3. Salve

**Usar SSH:**
```powershell
git remote set-url origin git@github.com:SEU_USUARIO/chatplay-soundboard.git
```

## Dicas

### Aliases Úteis
```powershell
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --all"
```

Agora pode usar:
```powershell
git st      # em vez de git status
git lg      # log bonito
```

### Git GUI
Se preferir interface gráfica:
- **GitHub Desktop**: https://desktop.github.com/
- **GitKraken**: https://www.gitkraken.com/
- **Sourcetree**: https://www.sourcetreeapp.com/

## Checklist Final

- [ ] Git instalado
- [ ] PowerShell reiniciado
- [ ] `git config` configurado (nome, email)
- [ ] Repositório inicializado (`git init`)
- [ ] Primeiro commit feito
- [ ] Repositório GitHub criado
- [ ] Conectado ao remoto (`git remote add`)
- [ ] Push feito (`git push`)
- [ ] Release criada com instalador

**Pronto! Git configurado no Windows! 🚀**
