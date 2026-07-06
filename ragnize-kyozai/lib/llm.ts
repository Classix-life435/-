import Anthropic from '@anthropic-ai/sdk';
import type { GenerateInput, Script, ScriptSegment } from './types';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';

/**
 * 台本・構成を生成する。
 * - ANTHROPIC_API_KEY があれば Claude で生成
 * - 無ければローカル生成（キーワード分割）にフォールバック
 */
export async function generateScript(input: GenerateInput): Promise<Script> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await generateWithClaude(input);
    } catch (err) {
      // 失敗時もアプリは止めず、ローカル生成にフォールバック
      console.error('[llm] Claude generation failed, falling back to local:', err);
    }
  }
  return generateLocally(input);
}

async function generateWithClaude(input: GenerateInput): Promise<Script> {
  const client = new Anthropic(); // ANTHROPIC_API_KEY を環境から解決

  const minutes = input.targetMinutes ?? 5;
  const audience = input.audience?.trim() || '一般の受講者';
  // 尺の目安からスライド枚数を概算（1枚あたり40〜60秒）
  const approxSlides = Math.max(3, Math.min(12, Math.round((minutes * 60) / 50)));

  const system = [
    'あなたは企業研修の教材設計プロフェッショナルです。',
    '与えられた教材内容から、eラーニング動画の「台本」と「スライド構成」を作成します。',
    '出力は必ず指定のJSON形式のみ。前置き・後書き・コードフェンスは一切付けないこと。',
  ].join('\n');

  const user = [
    `# 教材タイトル\n${input.title}`,
    `# 想定受講者\n${audience}`,
    `# 想定尺\n約${minutes}分（スライド ${approxSlides} 枚程度）`,
    `# 教材内容\n${input.content}`,
    '',
    '# 出力仕様（このJSON構造だけを返す）',
    JSON.stringify(
      {
        title: 'string（教材タイトル）',
        intro: 'string（導入ナレーション。60〜120字）',
        segments: [
          {
            heading: 'string（スライド見出し）',
            bullets: ['string（要点。1枚3〜5個）'],
            narration: 'string（このスライドの解説ナレーション。100〜250字）',
          },
        ],
        outro: 'string（まとめナレーション。60〜150字）',
      },
      null,
      2,
    ),
    '',
    `segments は ${approxSlides} 枚前後にすること。`,
  ].join('\n');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    // Opus 4.8 では adaptive thinking を使用（budget_tokens は 400 になるため不可）
    thinking: { type: 'adaptive' },
    system,
    messages: [{ role: 'user', content: user }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  const parsed = extractJson(text);

  const segments: ScriptSegment[] = Array.isArray(parsed.segments)
    ? parsed.segments.map((s: any) => ({
        heading: String(s.heading ?? '').trim() || '（見出しなし）',
        bullets: Array.isArray(s.bullets) ? s.bullets.map((x: any) => String(x)) : [],
        narration: String(s.narration ?? '').trim(),
      }))
    : [];

  if (segments.length === 0) {
    throw new Error('Claude returned no segments');
  }

  return {
    title: String(parsed.title ?? input.title),
    intro: String(parsed.intro ?? '').trim(),
    segments,
    outro: String(parsed.outro ?? '').trim(),
    source: 'claude',
  };
}

/** コードフェンスや前置きが混じっていてもJSON部分を取り出す */
function extractJson(text: string): any {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('No JSON object found in model output');
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

/**
 * ローカル生成（APIキー無しでもデモが動くように）。
 * 段落・箇条書きを見出しに割り、簡易ナレーションを組む。
 */
export function generateLocally(input: GenerateInput): Script {
  const blocks = input.content
    .split(/\n\s*\n|\r\n\s*\r\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const source = blocks.length > 0 ? blocks : [input.content.trim() || input.title];

  const segments: ScriptSegment[] = source.map((block, i) => {
    const lines = block
      .split(/\n|・|●|-\s|•/)
      .map((l) => l.trim())
      .filter(Boolean);
    const heading = lines[0] || `ポイント ${i + 1}`;
    const bullets = lines.slice(1, 6);
    const narration = `${heading}について解説します。${block.replace(/\s+/g, ' ').slice(0, 200)}`;
    return {
      heading,
      bullets: bullets.length > 0 ? bullets : [heading],
      narration,
    };
  });

  return {
    title: input.title,
    intro: `本教材「${input.title}」では、${input.audience?.trim() || '受講者'}の皆さんに向けて要点を解説します。`,
    segments,
    outro: 'ここまでの内容を振り返り、実務で活用していきましょう。お疲れさまでした。',
    source: 'local',
  };
}
