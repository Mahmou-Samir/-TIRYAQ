import { findDiseaseByText, searchDiseases, isEmergencyQuery, HEALTH_DISEASES } from './healthKnowledge';
import { MOCK_MEDICINES } from '../components/patient/constants';

const AI_BASE = import.meta.env.VITE_AI_API_URL || '/api/ai';

const PROVIDER_LABELS = {
  gemini: 'Gemini Pro',
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-flash-latest': 'Gemini Flash',
  'gemini-pro-latest': 'Gemini Pro',
  openai: 'GPT-4o mini',
  openrouter: 'Llama 3.3',
  local: 'Tiryaq Local',
};

/** Primary: FastAPI backend (keys secured server-side) */
async function callBackendChat(messages, lang) {
  const res = await fetch(`${AI_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, lang }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.status === 'success' && data.content) {
    return { content: data.content, source: data.provider || 'gemini' };
  }
  throw new Error(data.message || 'Chat failed');
}

export async function fetchAiStatus() {
  try {
    const res = await fetch(`${AI_BASE}/chat/status`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function buildLocalResponse(userText, lang) {
  if (isEmergencyQuery(userText)) {
    return lang === 'ar'
      ? '🚨 **حالة طارئة محتملة**\n\n**اتصل 123 فوراً** أو توجه لأقرب مستشفى.'
      : '🚨 **Possible emergency** — **call 123 immediately**.';
  }

  const disease = findDiseaseByText(userText, lang);
  if (disease) {
    const name = lang === 'ar' ? disease.name : disease.nameEn;
    const symptoms = (lang === 'ar' ? disease.symptoms : disease.symptomsEn).slice(0, 4).join(' • ');
    const solutions = (lang === 'ar' ? disease.solutions : disease.solutionsEn).slice(0, 4).map((s, i) => `${i + 1}. ${s}`).join('\n');
    const meds = disease.medicines.length
      ? (lang === 'ar' ? `\n\n💊 **أدوية للاستفسار:** ${disease.medicines.join('، ')}` : `\n\n💊 **Medicines:** ${disease.medicines.join(', ')}`)
      : '';
    return lang === 'ar'
      ? `**${name}**\n\n**أعراض:** ${symptoms}\n\n**إجراءات:**\n${solutions}${meds}`
      : `**${name}**\n\n**Symptoms:** ${symptoms}\n\n**Actions:**\n${solutions}${meds}`;
  }

  const medMatch = MOCK_MEDICINES.find((m) =>
    userText.toLowerCase().includes(m.name.toLowerCase()),
  );
  if (medMatch) {
    return lang === 'ar'
      ? `**${medMatch.name}** — ${medMatch.description}\n\n**جرعة:** ${medMatch.dosage}`
      : `**${medMatch.name}** — ${medMatch.description}\n\n**Dosage:** ${medMatch.dosage}`;
  }

  const listHint = searchDiseases(userText.slice(0, 24), lang);
  if (listHint.length > 0 && listHint.length < HEALTH_DISEASES.length) {
    const names = listHint.slice(0, 4).map((d) => (lang === 'ar' ? d.name : d.nameEn)).join('، ');
    return lang === 'ar'
      ? `جرّب السؤال عن: **${names}** — أو شغّل سيرفر AI للرد المتقدم.`
      : `Try asking about: **${names}** — or start the AI server for advanced replies.`;
  }

  return lang === 'ar'
    ? 'شغّل **سيرفر AI** (`tiryaq-ai-server`) للردود الذكية، أو افتح **دليل الأمراض**.'
    : 'Start the **AI server** for smart replies, or open the **Health Guide**.';
}

export async function sendChatMessage(messages, lang = 'ar') {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const userText = lastUser?.content || '';

  try {
    return await callBackendChat(messages, lang);
  } catch (e) {
    console.warn('Backend AI unavailable, using local fallback', e);
  }

  const local = buildLocalResponse(userText, lang);
  const disc = lang === 'ar'
    ? '\n\n⚠️ *وضع محلي — شغّل سيرفر AI للحصول على Gemini/GPT.*'
    : '\n\n⚠️ *Local mode — start AI server for Gemini/GPT.*';
  return { content: local + disc, source: 'local' };
}

export const getProviderLabel = (source) => PROVIDER_LABELS[source] || source;

export const CHAT_SUGGESTIONS = {
  ar: [
    'عندي صداع وحرارة 38 من يومين',
    'حموضة وحرقة بعد الأكل',
    'نزلة برد مع كحة — ماذا أفعل؟',
    'ما الفرق بين باندول اكسترا وأدفانس؟',
    'أعراض السكر المبكرة',
  ],
  en: [
    'Headache and fever 38°C for 2 days',
    'Heartburn after meals',
    'Cold with cough — what to do?',
    'Difference between Panadol Extra and Advance?',
    'Early diabetes symptoms',
  ],
};

export const getWelcomeMessage = (lang) =>
  lang === 'ar'
    ? 'مرحباً! 👋 أنا **د. ترياق AI** — مساعد صحي متقدم (Gemini / GPT).\n\nاسألني عن أعراضك، دواء، أو حالة — سأجيب بتحليل منظم.\n\n⚠️ للتوعية فقط — ليس تشخيصاً نهائياً.'
    : 'Hi! 👋 I\'m **Dr. Tiryaq AI** — powered by Gemini / GPT.\n\nAsk about symptoms, medicines, or conditions.\n\n⚠️ Awareness only — not a final diagnosis.';
