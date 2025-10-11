import { Client, SetActivity } from '@xhayper/discord-rpc';

class DiscordService {
  private client: Client;
  private ready = false;
  private showButtons = process.env.DISCORD_SHOW_BUTTONS === 'true';
  private imageCache = new Map<string, boolean>();
  private lastUpdate: { title: string; artist: string; position: number; isPlaying: boolean } | null = null;
  private updateTimeout: NodeJS.Timeout | null = null;

  constructor() {
    const clientId = process.env.DISCORD_CLIENT_ID || '1037879885772890232';
    this.client = new Client({ clientId });
    
    this.client.on('ready', () => {
      this.ready = true;
      console.warn('[Discord] Connected!');
      
      this.client.user?.setActivity({
        details: 'zZz',
        largeImageKey: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Osu%21_Logo_2016.svg/2048px-Osu%21_Logo_2016.svg.png',
        type: 2,
      });
    });

    this.client.on('disconnected', () => {
      this.ready = false;
      console.warn('[Discord] Disconnected');
    });

    this.client.login().catch((err) => {
      console.error('[Discord] Login failed:', err);
    });
  }

  private async checkImageExists(beatmapSetID: string): Promise<boolean> {
    if (this.imageCache.has(beatmapSetID)) {
      return this.imageCache.get(beatmapSetID) ?? false;
    }

    try {
      const response = await fetch(
        `https://assets.ppy.sh/beatmaps/${beatmapSetID}/covers/list@2x.jpg`,
        { method: 'HEAD' }
      );
      const exists = response.status !== 404;
      this.imageCache.set(beatmapSetID, exists);
      return exists;
    } catch {
      this.imageCache.set(beatmapSetID, false);
      return false;
    }
  }

  updatePlaying(title: string, artist: string, beatmapSetID: string, position: number, duration: number): void {
    if (!this.ready) {
      return;
    }

    if (this.lastUpdate?.title === title && this.lastUpdate?.artist === artist && this.lastUpdate?.isPlaying === true && Math.abs(this.lastUpdate.position - position) < 2) {
      return;
    }

    this.lastUpdate = { title, artist, position, isPlaying: true };

    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      this.performUpdate(title, artist, beatmapSetID, position, duration, true);
    }, 100);
  }

  private async performUpdate(title: string, artist: string, beatmapSetID: string, position: number, duration: number, isPlaying: boolean): Promise<void> {
    const imageExists = await this.checkImageExists(beatmapSetID);
    const largeImageKey = imageExists 
      ? `https://assets.ppy.sh/beatmaps/${beatmapSetID}/covers/list@2x.jpg`
      : 'logo';

    const presence: SetActivity = {
      details: title,
      state: artist,
      type: 2,
      largeImageKey,
    };

    if (isPlaying) {
      const endTimestamp = new Date(Date.now() + (duration - position) * 1000);
      const startTimestamp = new Date(endTimestamp.getTime() - duration * 1000);
      presence.startTimestamp = startTimestamp;
      presence.endTimestamp = endTimestamp;
    } else {
      presence.largeImageText = 'Paused';
    }

    if (this.showButtons) {
      presence.buttons = [
        { label: 'osu! Radio', url: 'https://github.com/yourusername/osu-radio' },
        { label: 'Go to this map on osu!', url: `https://osu.ppy.sh/beatmapsets/${beatmapSetID}` },
      ];
    }

    this.client.user?.setActivity(presence);
  }

  updatePaused(title: string, artist: string, beatmapSetID: string): void {
    if (!this.ready) {
      return;
    }

    if (this.lastUpdate?.title === title && this.lastUpdate?.artist === artist && this.lastUpdate?.isPlaying === false) {
      return;
    }

    this.lastUpdate = { title, artist, position: 0, isPlaying: false };

    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      this.performUpdate(title, artist, beatmapSetID, 0, 0, false);
    }, 100);
  }
}

export const discord = new DiscordService();
