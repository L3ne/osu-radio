import { Client, SetActivity } from '@xhayper/discord-rpc';

const catchDiscordActivityError = (err: unknown): void => {
  console.error('[Discord] Activity error:', err);
};

const defaultPresence: SetActivity = {
  details: 'Idle',
  largeImageKey: 'logo',
  type: 2,
 // buttons: [{ label: 'Check out osu!radio', url: 'https://github.com/L3ne/osu-radio' }],
};

let client: Client | null = null;
let isConnected = false;

export async function connectDiscord(): Promise<void> {
  if (isConnected && client) {
    console.warn('[Discord] Already connected');
    return;
  }

  client = new Client({ clientId: process.env.DISCORD_CLIENT_ID || '1037879885772890232' });

  client.on('ready', () => {
    isConnected = true;
    console.warn('[Discord] Connected!');
    client?.user?.setActivity(defaultPresence).catch(catchDiscordActivityError);
  });

  client.on('disconnected', () => {
    isConnected = false;
    console.warn('[Discord] Disconnected');
  });

  client.login().catch(catchDiscordActivityError);
}

export async function updateDiscordPlaying(title: string, artist: string, beatmapSetID: string): Promise<void> {
  if (!isConnected || !client) return;

  const response = await fetch(
    `https://assets.ppy.sh/beatmaps/${beatmapSetID}/covers/list@2x.jpg`,
    { method: 'HEAD' }
  );

  let largeImageKey = `https://assets.ppy.sh/beatmaps/${beatmapSetID}/covers/list@2x.jpg`;
  if (response.status === 404) {
    largeImageKey = 'logo';
  }

  const presence: SetActivity = {
    details: title,
    state: artist,
    type: 2,
    largeImageKey,
    buttons: [],
  };

  if (beatmapSetID) {
    presence.buttons?.push({
      label: 'Go to this map on osu!',
      url: `https://osu.ppy.sh/beatmapsets/${beatmapSetID}`,
    });
  }

  client.user?.setActivity(presence).catch(catchDiscordActivityError);
}

export async function updateDiscordPaused(title: string, artist: string, beatmapSetID: string): Promise<void> {
  if (!isConnected || !client) return;

  const response = await fetch(
    `https://assets.ppy.sh/beatmaps/${beatmapSetID}/covers/list@2x.jpg`,
    { method: 'HEAD' }
  );

  let largeImageKey = `https://assets.ppy.sh/beatmaps/${beatmapSetID}/covers/list@2x.jpg`;
  if (response.status === 404) {
    largeImageKey = 'logo';
  }

  const presence: SetActivity = {
    details: title,
    state: artist,
    type: 2,
    largeImageKey,
    largeImageText: 'Paused',
    buttons: [{ label: 'Check out osu!radio', url: 'https://github.com/L3ne/osu-radio' }],
  };

  if (beatmapSetID) {
    presence.buttons?.push({
      label: 'Go to this map on osu!',
      url: `https://osu.ppy.sh/beatmapsets/${beatmapSetID}`,
    });
  }

  client.user?.setActivity(presence).catch(catchDiscordActivityError);
}

// Auto-connect on import
connectDiscord();
