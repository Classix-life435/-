import type { Script, VideoResult, VimeoResult } from './types';

/**
 * 合成済み動画を Vimeo にアップロードする（pull方式・限定公開）。
 *
 * - VIMEO_ACCESS_TOKEN があり、合成動画URLがある場合に本番接続
 * - VIMEO_ALLOWED_DOMAIN を設定すると、そのドメインだけ埋め込み可（動画流出対策）
 * - 動画URLが無い（合成スキップ）場合は skipped
 *
 * pull方式: Vimeoに動画の公開URLを渡すと、Vimeo側が取得してくれる。
 *   POST https://api.vimeo.com/me/videos
 *   { upload: { approach:'pull', link }, privacy: {...}, embed_domains: [...] }
 */
export async function uploadToVimeo(script: Script, video: VideoResult): Promise<VimeoResult> {
  const token = process.env.VIMEO_ACCESS_TOKEN;
  const allowedDomain = process.env.VIMEO_ALLOWED_DOMAIN;

  if (!token) {
    return {
      meta: {
        stage: 'vimeo',
        status: 'skipped',
        live: false,
        detail: 'VIMEO_ACCESS_TOKEN 未設定のためスキップ',
      },
    };
  }

  if (!video.url) {
    return {
      meta: {
        stage: 'vimeo',
        status: 'skipped',
        live: false,
        detail: '合成動画URLが無いためアップロードをスキップ（先に動画合成が必要）',
      },
    };
  }

  try {
    const privacy: Record<string, unknown> = {
      view: 'disable', // リンク直アクセス不可
      embed: allowedDomain ? 'whitelist' : 'public',
      download: false,
      add: false,
    };

    const body: Record<string, unknown> = {
      upload: { approach: 'pull', link: video.url },
      name: script.title,
      privacy,
    };
    if (allowedDomain) {
      body.embed_domains = [allowedDomain];
    }

    const res = await fetch('https://api.vimeo.com/me/videos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.vimeo.*+json;version=3.4',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = (await res.text()).slice(0, 400);
      throw new Error(`Vimeo upload failed: ${res.status} ${errText}`);
    }

    const data = await res.json();
    const uri: string | undefined = data?.uri; // 例: /videos/123456789
    const videoId = uri?.split('/').pop();
    const link: string | undefined = data?.link;
    const embedUrl = videoId ? `https://player.vimeo.com/video/${videoId}` : undefined;

    // ドメイン制限を後追いで確実に設定（作成時に反映されないケースの保険）
    if (allowedDomain && videoId) {
      await fetch(`https://api.vimeo.com/videos/${videoId}/privacy/domains/${allowedDomain}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => undefined);
    }

    return {
      videoId,
      link,
      embedUrl,
      meta: {
        stage: 'vimeo',
        status: 'ok',
        live: true,
        detail: allowedDomain
          ? `限定公開（${allowedDomain} のみ埋め込み可）`
          : '限定公開でアップロード',
      },
    };
  } catch (err: any) {
    return {
      meta: {
        stage: 'vimeo',
        status: 'error',
        live: true,
        detail: `Vimeo アップロード 失敗: ${err?.message ?? err}`,
      },
    };
  }
}
