'use client';

import { useState } from 'react';
import type {
  GenerateInput,
  PipelineResult,
  Program,
  PublishResult,
  StageResult,
} from '@/lib/types';

type Tab = 'preview' | 'exhaust';

export default function Generator({ programs }: { programs: Program[] }) {
  const [form, setForm] = useState<GenerateInput>({
    title: '',
    content: '',
    targetMinutes: 5,
    audience: '',
    programId: programs[0]?.id,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [tab, setTab] = useState<Tab>('preview');

  // 排出（LMS）用の状態
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);

  // PowerPoint ダウンロード用の状態
  const [downloadingPptx, setDownloadingPptx] = useState(false);

  function update<K extends keyof GenerateInput>(key: K, value: GenerateInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    setPublishResult(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '生成に失敗しました');
      setResult(data as PipelineResult);
      setTab('preview');
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  async function onPublish() {
    if (!result) return;
    const programId = form.programId || programs[0]?.id;
    if (!programId) {
      setPublishResult({
        status: 'skipped',
        live: false,
        detail: '排出先プログラムがありません（Supabase未設定 or programs未作成）',
      });
      return;
    }
    setPublishing(true);
    setPublishResult(null);
    try {
      const scriptText = buildScriptText(result);
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId,
          courseTitle: result.script.title,
          lessonTitle: result.script.title,
          videoUrl: result.vimeo.embedUrl || result.vimeo.link || result.video.url,
          scriptText,
        }),
      });
      const data = (await res.json()) as PublishResult;
      setPublishResult(data);
    } catch (err: any) {
      setPublishResult({ status: 'error', live: true, detail: err?.message ?? String(err) });
    } finally {
      setPublishing(false);
    }
  }

  async function onDownloadPptx() {
    if (!result) return;
    setDownloadingPptx(true);
    try {
      const res = await fetch('/api/pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.script),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'PPTX生成に失敗しました');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(result.script.title || 'kyozai').replace(/[\\/:*?"<>|]/g, '_')}.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setDownloadingPptx(false);
    }
  }

  return (
    <>
      {/* 入力フォーム */}
      <div className="panel">
        <label htmlFor="title">教材タイトル *</label>
        <input
          id="title"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="例: 情報セキュリティの基礎"
        />

        <label htmlFor="content">教材内容 *（箇条書き・本文どちらでも）</label>
        <textarea
          id="content"
          value={form.content}
          onChange={(e) => update('content', e.target.value)}
          placeholder={'例:\nパスワード管理の原則\nフィッシング詐欺の見分け方\n情報漏えい時の初動対応'}
        />

        <div className="row">
          <div>
            <label htmlFor="audience">想定受講者</label>
            <input
              id="audience"
              value={form.audience}
              onChange={(e) => update('audience', e.target.value)}
              placeholder="例: 新入社員"
            />
          </div>
          <div>
            <label htmlFor="minutes">想定尺（分）</label>
            <input
              id="minutes"
              type="number"
              min={1}
              max={30}
              value={form.targetMinutes ?? 5}
              onChange={(e) => update('targetMinutes', Number(e.target.value))}
            />
          </div>
          {programs.length > 0 && (
            <div>
              <label htmlFor="program">排出先プログラム</label>
              <select
                id="program"
                value={form.programId}
                onChange={(e) => update('programId', e.target.value)}
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button onClick={onGenerate} disabled={loading || !form.title || !form.content}>
          {loading ? '生成中…（動画合成まで含むと時間がかかります）' : '生成する'}
        </button>

        {error && <div className="error-box">{error}</div>}
      </div>

      {/* 結果 */}
      {result && (
        <div className="panel">
          <div className="result-actions">
            <button
              onClick={onDownloadPptx}
              disabled={downloadingPptx}
              className="secondary"
            >
              {downloadingPptx ? 'PowerPoint生成中…' : '📊 PowerPointをダウンロード（.pptx）'}
            </button>
            <span className="muted">
              台本からスライドを生成（Canva 未接続でも利用可）。ナレーションはスピーカーノートに入ります。
            </span>
          </div>
          <div className="tabs">
            <div
              className={`tab ${tab === 'preview' ? 'active' : ''}`}
              onClick={() => setTab('preview')}
            >
              プレビュー
            </div>
            <div
              className={`tab ${tab === 'exhaust' ? 'active' : ''}`}
              onClick={() => setTab('exhaust')}
            >
              排出
            </div>
          </div>

          {tab === 'preview' ? (
            <PreviewTab result={result} />
          ) : (
            <ExhaustTab
              result={result}
              onPublish={onPublish}
              publishing={publishing}
              publishResult={publishResult}
              hasProgram={Boolean(form.programId || programs[0]?.id)}
            />
          )}
        </div>
      )}
    </>
  );
}

function PreviewTab({ result }: { result: PipelineResult }) {
  const { script, slides, audio, vimeo } = result;
  return (
    <div>
      <p className="muted">
        台本の生成元:{' '}
        <strong>{script.source === 'claude' ? 'Claude API' : 'ローカル生成'}</strong>
      </p>

      <div className="segment">
        <h4>導入</h4>
        <div className="narration">{script.intro}</div>
      </div>

      {script.segments.map((s, i) => (
        <div className="segment" key={i}>
          <h4>
            {i + 1}. {s.heading}
          </h4>
          {s.bullets.length > 0 && (
            <ul>
              {s.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          )}
          <div className="narration">🎙 {s.narration}</div>
          {audio.segmentUrls?.[i + 1] && (
            <audio controls src={audio.segmentUrls[i + 1]} />
          )}
        </div>
      ))}

      <div className="segment">
        <h4>まとめ</h4>
        <div className="narration">{script.outro}</div>
      </div>

      {slides.url && (
        <p>
          スライド: <a href={slides.url} target="_blank" rel="noreferrer">Canvaで開く</a>
        </p>
      )}
      {vimeo.embedUrl && (
        <p style={{ marginTop: 12 }}>
          <iframe
            src={vimeo.embedUrl}
            width="100%"
            height="360"
            allow="autoplay; fullscreen; picture-in-picture"
            style={{ border: 0, borderRadius: 10 }}
            title="Vimeo preview"
          />
        </p>
      )}
    </div>
  );
}

function ExhaustTab({
  result,
  onPublish,
  publishing,
  publishResult,
  hasProgram,
}: {
  result: PipelineResult;
  onPublish: () => void;
  publishing: boolean;
  publishResult: PublishResult | null;
  hasProgram: boolean;
}) {
  return (
    <div>
      <p className="muted">各工程の状態（本番接続 / スキップ / エラー）</p>
      <ul className="stage-list">
        {result.stages.map((st) => (
          <StageRow key={st.stage} stage={st} />
        ))}
      </ul>

      <button onClick={onPublish} disabled={publishing || !hasProgram} className="secondary">
        {publishing ? 'LMSへ排出中…' : 'LMSへ排出（下書き登録）'}
      </button>
      {!hasProgram && (
        <p className="muted">※ 排出先プログラムがありません（Supabase未設定 or programs未作成）</p>
      )}

      {publishResult && (
        <div className={publishResult.status === 'error' ? 'error-box' : 'notice'}>
          <strong>排出結果: </strong>
          {labelFor(publishResult.status)} — {publishResult.detail}
          {publishResult.lessonId && <> （lesson: {publishResult.lessonId}）</>}
        </div>
      )}
    </div>
  );
}

function StageRow({ stage }: { stage: StageResult }) {
  return (
    <li className="stage-item">
      <span className={`badge ${stage.status}`}>{labelFor(stage.status)}</span>
      <span className="stage-name">{jpStage(stage.stage)}</span>
      <span className="stage-detail">{stage.detail}</span>
      <span className="live-dot">{stage.live ? '● 本番接続' : '○ 未接続'}</span>
    </li>
  );
}

function jpStage(stage: string): string {
  const map: Record<string, string> = {
    script: '台本',
    slides: 'スライド',
    audio: '解説音声',
    video: '動画合成',
    vimeo: 'Vimeo',
  };
  return map[stage] ?? stage;
}

function labelFor(status: string): string {
  const map: Record<string, string> = {
    ok: '本番',
    skipped: 'スキップ',
    mock: 'モック',
    error: 'エラー',
  };
  return map[status] ?? status;
}

function buildScriptText(result: PipelineResult): string {
  const { script } = result;
  const lines = [script.intro, ''];
  script.segments.forEach((s, i) => {
    lines.push(`■ ${i + 1}. ${s.heading}`);
    s.bullets.forEach((b) => lines.push(`  ・${b}`));
    lines.push(s.narration, '');
  });
  lines.push(script.outro);
  return lines.join('\n');
}
