const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const { spawn } = require('child_process');
const https = require('https');

class YouTubeAudioDownloader {
  constructor() {
    // Pasta permanente para áudios do YouTube
    this.audioDir = path.join(app.getPath('userData'), 'youtube-sounds');
    
    // Pasta para o binário do yt-dlp
    this.binDir = path.join(app.getPath('userData'), 'bin');
    this.ytdlpPath = path.join(this.binDir, 'yt-dlp.exe');
    
    // URL do yt-dlp.exe
    this.ytdlpUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';

    // Criar diretórios se não existirem
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
    if (!fs.existsSync(this.binDir)) {
      fs.mkdirSync(this.binDir, { recursive: true });
    }

    // Verificar/baixar yt-dlp na inicialização
    this.ensureYtDlp();
  }

  /**
   * Verifica se yt-dlp existe, senão baixa automaticamente
   */
  async ensureYtDlp() {
    if (fs.existsSync(this.ytdlpPath)) {
      console.log('✅ yt-dlp.exe encontrado em:', this.ytdlpPath);
      return true;
    }

    console.log('⬇️  Baixando yt-dlp.exe pela primeira vez...');
    try {
      await this.downloadYtDlp();
      console.log('✅ yt-dlp.exe baixado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao baixar yt-dlp:', error);
      return false;
    }
  }

  /**
   * Baixa o yt-dlp.exe do GitHub
   */
  downloadYtDlp() {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(this.ytdlpPath);
      
      const request = https.get(this.ytdlpUrl, (response) => {
        // Seguir redirects
        if (response.statusCode === 302 || response.statusCode === 301) {
          file.close();
          fs.unlinkSync(this.ytdlpPath);
          
          https.get(response.headers.location, (redirectResponse) => {
            const finalFile = fs.createWriteStream(this.ytdlpPath);
            redirectResponse.pipe(finalFile);
            
            finalFile.on('finish', () => {
              finalFile.close(() => {
                console.log('yt-dlp.exe baixado:', this.ytdlpPath);
                // Aguardar um pouco para garantir que o arquivo foi escrito completamente
                setTimeout(resolve, 500);
              });
            });
            
            finalFile.on('error', (err) => {
              fs.unlink(this.ytdlpPath, () => {});
              reject(err);
            });
          }).on('error', (err) => {
            fs.unlink(this.ytdlpPath, () => {});
            reject(err);
          });
        } else {
          response.pipe(file);
          file.on('finish', () => {
            file.close(() => {
              console.log('yt-dlp.exe baixado:', this.ytdlpPath);
              // Aguardar um pouco para garantir que o arquivo foi escrito completamente
              setTimeout(resolve, 500);
            });
          });
          
          file.on('error', (err) => {
            fs.unlink(this.ytdlpPath, () => {});
            reject(err);
          });
        }
      }).on('error', (err) => {
        fs.unlink(this.ytdlpPath, () => {}); // Remover arquivo incompleto
        reject(err);
      });
    });
  }

  /**
   * Extrai ID do vídeo de uma URL do YouTube
   */
  extractVideoId(url) {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Baixa o áudio de um vídeo do YouTube usando yt-dlp.exe
   */
  async downloadAudio(url, onProgress = null) {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error('URL do YouTube inválida');
    }

    // Garantir que yt-dlp existe
    await this.ensureYtDlp();

    if (!fs.existsSync(this.ytdlpPath)) {
      throw new Error('yt-dlp.exe não encontrado. Verifique sua conexão com a internet.');
    }

    try {
      console.log('Baixando áudio do YouTube...');
      console.log('URL:', url);

      if (onProgress) onProgress(10);

      // Definir nome do arquivo de saída
      const outputTemplate = path.join(this.audioDir, '%(title)s [%(id)s].%(ext)s');

      // Argumentos do yt-dlp - download direto sem conversão
      const args = [
        url,
        '--format', 'bestaudio',
        '--output', outputTemplate,
        '--no-playlist',
        '--newline',
        '--no-warnings',
        '--no-cache-dir',
        '--no-check-certificates'
      ];

      return new Promise((resolve, reject) => {
        const ytdlp = spawn(this.ytdlpPath, args, {
          windowsHide: true,
          stdio: ['ignore', 'pipe', 'pipe']
        });
        
        let lastProgress = 10;

        ytdlp.stdout.on('data', (data) => {
          const output = data.toString();
          console.log('yt-dlp output:', output);

          // Detectar progresso
          const progressMatch = output.match(/(\d+\.\d+)%/);
          if (progressMatch) {
            const percent = parseFloat(progressMatch[1]);
            lastProgress = Math.floor(20 + (percent * 0.6)); // 20-80%
            if (onProgress) onProgress(lastProgress);
          }

          // Detectar download completo
          if (output.includes('[download] 100%')) {
            if (onProgress) onProgress(85);
          }
        });

        ytdlp.stderr.on('data', (data) => {
          const error = data.toString();
          console.error('yt-dlp error:', error);
        });

        ytdlp.on('close', (code) => {
          if (code === 0) {
            // yt-dlp finalizado com sucesso
            // Buscar o arquivo baixado no diretório
            const files = fs.readdirSync(this.audioDir);
            const downloadedFile = files
              .filter(f => f.includes(videoId))
              .sort((a, b) => {
                const statA = fs.statSync(path.join(this.audioDir, a));
                const statB = fs.statSync(path.join(this.audioDir, b));
                return statB.mtimeMs - statA.mtimeMs;
              })[0];
            
            if (downloadedFile) {
              const outputPath = path.join(this.audioDir, downloadedFile);
              const videoTitle = downloadedFile
                .replace(/\.[^/.]+$/, '') // remove extensão
                .replace(/\[.*?\]$/, '') // remove [videoId]
                .trim();
              
              console.log('✅ Download concluído:', outputPath);
              if (onProgress) onProgress(100);
              
              resolve({ 
                path: outputPath, 
                title: videoTitle 
              });
            } else {
              reject(new Error('Download concluído mas arquivo não encontrado'));
            }
          } else {
            reject(new Error(`yt-dlp finalizou com código de erro: ${code}`));
          }
        });

        ytdlp.on('error', (error) => {
          console.error('❌ Erro spawn:', error);
          
          // Se for erro de spawn UNKNOWN, pode ser Windows bloqueando
          if (error.code === 'UNKNOWN' || error.message.includes('spawn')) {
            reject(new Error('Erro ao iniciar yt-dlp. Tente executar o aplicativo como Administrador ou verifique se o antivírus está bloqueando.'));
          } else {
            reject(new Error(`Erro ao executar yt-dlp: ${error.message}`));
          }
        });
      });
    } catch (error) {
      console.error('Erro ao baixar vídeo:', error);
      throw new Error(`Erro ao processar vídeo: ${error.message}`);
    }
  }

  /**
   * Lista todos os áudios do YouTube salvos
   */
  listYouTubeAudios() {
    if (!fs.existsSync(this.audioDir)) {
      return [];
    }

    const files = fs.readdirSync(this.audioDir);
    return files
      .filter(file => file.endsWith('.m4a') || file.endsWith('.webm') || file.endsWith('.opus'))
      .map(file => ({
        id: path.parse(file).name,
        filename: file,
        path: path.join(this.audioDir, file),
        name: file.replace(/\.[^/.]+$/, '').replace(/\[.*?\]$/, '').trim()
      }));
  }

  /**
   * Remove um áudio do YouTube
   */
  deleteYouTubeAudio(filename) {
    const filePath = path.join(this.audioDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Áudio removido:', filename);
      return true;
    }
    return false;
  }

  /**
   * Limpa arquivos temporários antigos
   */
  cleanupOldFiles(maxAgeHours = 24) {
    if (!fs.existsSync(this.audioDir)) return;

    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;

    fs.readdirSync(this.audioDir).forEach((file) => {
      const filePath = path.join(this.audioDir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Arquivo temporário removido: ${file}`);
      }
    });
  }

  /**
   * Remove todos os arquivos temporários
   */
  cleanupAll() {
    if (fs.existsSync(this.audioDir)) {
      fs.readdirSync(this.audioDir).forEach((file) => {
        fs.unlinkSync(path.join(this.audioDir, file));
      });
      console.log('Todos os arquivos temporários removidos');
    }
  }

  /**
   * Atualiza o yt-dlp para a versão mais recente
   */
  async updateYtDlp() {
    if (fs.existsSync(this.ytdlpPath)) {
      fs.unlinkSync(this.ytdlpPath);
    }
    return this.downloadYtDlp();
  }
}

module.exports = YouTubeAudioDownloader;
