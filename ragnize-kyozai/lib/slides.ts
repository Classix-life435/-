import type { Script, SlidesResult } from './types';

/**
 * Canva Connect API（Autofill）でスライドを生成する。
 * ブランドテンプレートに台本の見出し・要点を流し込む。
 *
 * - CANVA_CONNECT_TOKEN と CANVA_BRAND_TEMPLATE_ID が両方あれば本番接続
 * - 無ければ skipped（アプリは継続）
 *
 * 参考: POST https://api.canva.com/rest/v1/autofills
 *   { brand_template_id, data: { <field>: {type:'text', text}} }
 * Autofill は非同期ジョブ。ここではジョブ作成→数回ポーリングまで行う。
 */
export async function generateSlides(script: Script): Promise<SlidesResult> {
  const token = process.env.CANVA_CONNECT_TOKEN;
  const templateId = process.env.CANVA_BRAND_TEMPLATE_ID;

  if (!token || !templateId) {
    return {
      meta: {
        stage: 'slides',
        status: 'skipped',
        live: false,
        detail: 'CANVA_CONNECT_TOKEN / CANVA_BRAND_TEMPLATE_ID 未設定のためスキップ',
      },
    };
  }

  try {
    // テンプレートのフィールド名は運用に合わせて調整してください。
    // ここでは title / body（要点をまとめて流し込む）を例示。
    const bodyText = [
      script.intro,
      ...script.segments.map((s) => `■ ${s.heading}\n${s.bullets.map((b) => `・${b}`).join('\n')}`),
      script.outro,
    ].join('\n\n');

    const createRes = await fetch('https://api.canva.com/rest/v1/autofills', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        brand_template_id: templateId,
        data: {
          title: { type: 'text', text: script.title },
          body: { type: 'text', text: bodyText },
        },
      }),
    });

    if (!createRes.ok) {
      const errText = await safeText(createRes);
      throw new Error(`autofill create failed: ${createRes.status} ${errText}`);
    }

    const created = await createRes.json();
    const jobId: string | undefined = created?.job?.id;

    // ジョブをポーリング（最大 ~15秒）
    let designUrl: string | undefined;
    let designId: string | undefined;
    if (jobId) {
      for (let i = 0; i < 10; i++) {
        await sleep(1500);
        const statusRes = await fetch(`https://api.canva.com/rest/v1/autofills/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!statusRes.ok) continue;
        const status = await statusRes.json();
        const state = status?.job?.status;
        if (state === 'success') {
          designId = status?.job?.result?.design?.id;
          designUrl = status?.job?.result?.design?.url;
          break;
        }
        if (state === 'failed') {
          throw new Error(`autofill job failed: ${JSON.stringify(status?.job?.error)}`);
        }
      }
    }

    return {
      url: designUrl,
      designId,
      meta: {
        stage: 'slides',
        status: 'ok',
        live: true,
        detail: designId ? `Canva design ${designId}` : 'Autofillジョブを作成（ポーリング未完）',
      },
    };
  } catch (err: any) {
    return {
      meta: {
        stage: 'slides',
        status: 'error',
        live: true,
        detail: `Canva Autofill 失敗: ${err?.message ?? err}`,
      },
    };
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return '';
  }
}
