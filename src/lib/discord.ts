import { Client, SetActivity } from '@xhayper/discord-rpc';
import { Song } from '@/types';

let client: Client | null = null;
let isConnected = false;

const catchDiscordActivityError = (error: unknown): void => {
  console.error('[Discord RPC] Error:', error);
};

const defaultPresence: SetActivity = {
  details: 'zZz',
  largeImageKey: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Osu%21_Logo_2016.svg/2048px-Osu%21_Logo_2016.svg.png',
  type: 2,
};

export async function connectDiscord(): Promise<void> {
  if (isConnected && client) {
    console.warn('[Discord RPC] Already connected');
    return;
  }
  
  console.warn('[Discord RPC] Connecting...');
  
  client = new Client({ clientId: '1037879885772890232' });
  
  await new Promise<void>((resolve, reject) => {
    if (!client) {
      reject(new Error('Client not created'));
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error('Connection timeout - is Discord running?'));
    }, 10000);

    client.on('ready', () => {
      clearTimeout(timeout);
      isConnected = true;
      console.warn('[Discord RPC] ✓ Ready!');
      client?.user?.setActivity(defaultPresence).catch(catchDiscordActivityError);
      resolve();
    });

    client.on('disconnected', () => {
      isConnected = false;
      console.warn('[Discord RPC] Disconnected');
    });

    client.login().catch((err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });

  console.warn('[Discord RPC] ✓ Connected!');
}

export async function updateDiscordPlaying(song: Song, length: number, position: number): Promise<void> {
  console.warn(`[Discord RPC] updateDiscordPlaying called - Connected: ${isConnected}`);
  
  if (!isConnected) {
    console.warn('[Discord RPC] Not connected, skipping update');
    return;
  }

  console.warn(`[Discord RPC] Updating to: ${song.title} (${position}s / ${length}s)`);

  const endTimestamp = new Date(new Date().getTime() + (length - position) * 1000);
  const startTimestamp = new Date(endTimestamp.getTime() - length * 1000);

  const response = await fetch(
    `https://assets.ppy.sh/beatmaps/${song.beatmapSetID}/covers/list@2x.jpg`,
    { method: 'HEAD' }
  );

  let largeImageKey = `https://assets.ppy.sh/beatmaps/${song.beatmapSetID}/covers/list@2x.jpg`;
  if (response.status === 404) {
    largeImageKey = 'logo';
  }

  const presence: SetActivity = {
    details: song.title,
    state: song.artist,
    type: 2,
    startTimestamp,
    endTimestamp,
    largeImageKey,
    buttons: [{ label: 'osu! Radio', url: 'https://github.com/yourusername/osu-radio' }],
  };

  if (song.beatmapSetID) {
    presence.buttons?.push({
      label: 'Go to this map on osu!',
      url: `https://osu.ppy.sh/beatmapsets/${song.beatmapSetID}`,
    });
  }

  console.warn('[Discord RPC] Sending activity update...');
  
  if (!client) {
    console.error('[Discord RPC] Client is null!');
    return;
  }
  
  client.user?.setActivity(presence).catch(catchDiscordActivityError);
  console.warn('[Discord RPC] ✓ Activity sent!');
}

export async function updateDiscordPaused(song: Song): Promise<void> {
  console.warn(`[Discord RPC] updateDiscordPaused called - Connected: ${isConnected}`);
  
  if (!isConnected) {
    console.warn('[Discord RPC] Not connected, skipping update');
    return;
  }

  console.warn(`[Discord RPC] Updating to paused: ${song.title}`);

  const response = await fetch(
    `https://assets.ppy.sh/beatmaps/${song.beatmapSetID}/covers/list@2x.jpg`,
    { method: 'HEAD' }
  );

  let largeImageKey = `https://assets.ppy.sh/beatmaps/${song.beatmapSetID}/covers/list@2x.jpg`;
  if (response.status === 404) {
    largeImageKey = 'logo';
  }

  const presence: SetActivity = {
    details: song.title,
    state: song.artist,
    type: 2,
    largeImageKey,
    largeImageText: 'Paused',
    buttons: [{ label: 'osu! Radio', url: 'https://github.com/yourusername/osu-radio' }],
  };

  if (song.beatmapSetID) {
    presence.buttons?.push({
      label: 'Go to this map on osu!',
      url: `https://osu.ppy.sh/beatmapsets/${song.beatmapSetID}`,
    });
  }

  if (!client) {
    console.error('[Discord RPC] Client is null!');
    return;
  }
  
  client.user?.setActivity(presence).catch(catchDiscordActivityError);
}
