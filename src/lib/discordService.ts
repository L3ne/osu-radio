import { Client, SetActivity } from '@xhayper/discord-rpc';

class DiscordService {
  private client: Client;
  private ready = false;
  private showButtons = process.env.DISCORD_SHOW_BUTTONS === 'true';

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

  updatePlaying(title: string, artist: string, beatmapSetID: string, position: number, duration: number): void {
    if (!this.ready) {
      console.warn('[Discord] Not ready, skipping');
      return;
    }

    const endTimestamp = new Date(Date.now() + (duration - position) * 1000);
    const startTimestamp = new Date(endTimestamp.getTime() - duration * 1000);

    fetch(`https://assets.ppy.sh/beatmaps/${beatmapSetID}/covers/list@2x.jpg`, { method: 'HEAD' })
      .then((res) => {
        const largeImageKey = res.status === 404 ? 'logo' : `https://assets.ppy.sh/beatmaps/${beatmapSetID}/covers/list@2x.jpg`;

        const presence: SetActivity = {
          details: title,
          state: artist,
          type: 2,
          startTimestamp,
          endTimestamp,
          largeImageKey,
        };

        if (this.showButtons) {
          presence.buttons = [
            { label: 'osu! Radio', url: 'https://github.com/yourusername/osu-radio' },
            { label: 'Go to this map on osu!', url: `https://osu.ppy.sh/beatmapsets/${beatmapSetID}` },
          ];
        }

        console.warn(`[Discord] Playing: ${title}`);
        this.client.user?.setActivity(presence);
      })
      .catch((err) => {
        console.error('[Discord] Fetch error:', err);
      });
  }

  updatePaused(title: string, artist: string, beatmapSetID: string): void {
    if (!this.ready) {
      console.warn('[Discord] Not ready, skipping');
      return;
    }

    fetch(`https://assets.ppy.sh/beatmaps/${beatmapSetID}/covers/list@2x.jpg`, { method: 'HEAD' })
      .then((res) => {
        const largeImageKey = res.status === 404 ? 'logo' : `https://assets.ppy.sh/beatmaps/${beatmapSetID}/covers/list@2x.jpg`;

        const presence: SetActivity = {
          details: title,
          state: artist,
          type: 2,
          largeImageKey,
          largeImageText: 'Paused',
        };

        if (this.showButtons) {
          presence.buttons = [
            { label: 'osu! Radio', url: 'https://github.com/yourusername/osu-radio' },
            { label: 'Go to this map on osu!', url: `https://osu.ppy.sh/beatmapsets/${beatmapSetID}` },
          ];
        }

        console.warn(`[Discord] Paused: ${title}`);
        this.client.user?.setActivity(presence);
      })
      .catch((err) => {
        console.error('[Discord] Fetch error:', err);
      });
  }
}

export const discord = new DiscordService();
