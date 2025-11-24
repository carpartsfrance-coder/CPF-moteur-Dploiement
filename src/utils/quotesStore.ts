export type QuoteResponse = {
  id: string;
  channel: 'whatsapp' | 'email';
  message: string;
  createdAt: string;
};

export type QuoteItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleId: string;
  message: string;
  createdAt: string; // ISO
  channel?: 'whatsapp' | 'email' | 'api' | 'unknown';
  status?: 'nouveau' | 'en_cours' | 'termine';
  responses?: QuoteResponse[];
};

const KEY = 'cpf_quotes_v1';

export function getQuotes(): QuoteItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQuotes(list: QuoteItem[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addQuote(q: Omit<QuoteItem, 'id' | 'createdAt'> & Partial<Pick<QuoteItem, 'createdAt'>>) {
  const list = getQuotes();
  const item: QuoteItem = {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    createdAt: q.createdAt || new Date().toISOString(),
    name: q.name,
    email: q.email,
    phone: q.phone,
    vehicleId: q.vehicleId,
    message: q.message,
    channel: q.channel || 'unknown',
    status: 'nouveau',
    responses: q.responses ?? [],
  };
  list.unshift(item);
  saveQuotes(list);
  return item;
}

export function updateQuote(id: string, patch: Partial<QuoteItem>) {
  const list = getQuotes();
  const idx = list.findIndex(x => x.id === id);
  if (idx >= 0) {
    const existing = list[idx];
    list[idx] = {
      ...existing,
      ...patch,
      responses: patch.responses ?? existing.responses ?? [],
    };
    saveQuotes(list);
  }
}

export function deleteQuote(id: string) {
  const list = getQuotes().filter(x => x.id !== id);
  saveQuotes(list);
}

export function addResponseToQuote(id: string, response: QuoteResponse) {
  const list = getQuotes();
  const idx = list.findIndex(x => x.id === id);
  if (idx >= 0) {
    const existing = list[idx];
    const responses = existing.responses ? [...existing.responses, response] : [response];
    list[idx] = { ...existing, responses };
    saveQuotes(list);
  }
}
