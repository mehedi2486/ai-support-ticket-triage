// Assistant-written setup probe, not the learner's ticket API implementation.
import assert from 'node:assert/strict';

async function main() {
  const key = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';
  if (!key) {
    console.error('Set GEMINI_API_KEY in the local .env file first. Do not share the key.');
    process.exitCode = 1;
    return;
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(model)) {
    console.error('GEMINI_MODEL must contain a model ID, not a URL or path.');
    process.exitCode = 1;
    return;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(15_000),
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Reply with exactly the single word READY.' }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 64 },
      }),
    },
  );
  if (!response.ok) {
    const hints = {
      400: 'Check the key and model request configuration.',
      403: 'Check key restrictions, project permissions and account eligibility.',
      404: 'Check whether this model is available to your project.',
      429: 'Check the project free-tier quota in AI Studio. Do not enable billing just for this check.',
    };
    console.error(`Gemini returned HTTP ${response.status}. ${hints[response.status] || 'The provider did not accept the request.'}`);
    process.exitCode = 1;
    return;
  }

  const data = await response.json();
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map(part => typeof part.text === 'string' ? part.text : '')
    .join('').trim();
  assert.match(text, /^READY[.!]?$/i);
  console.log(`Gemini connection verified: ${model} returned READY.`);
}

main().catch(() => {
  // Raw errors can contain request details. Keep credentials out of diagnostics.
  console.error('AI check failed: timeout, network error, or unexpected model response. No raw request or response was logged.');
  process.exitCode = 1;
});
