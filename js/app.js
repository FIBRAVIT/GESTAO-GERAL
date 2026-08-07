// ============================================================
// GRUPO FIBRAVIT — APP.JS
// Integração com Google Apps Script (GitHub Pages)
// ============================================================

// ===== URL DO APPS SCRIPT =====
// Após publicar o codigo.gs, cole a URL aqui:
let APPS_SCRIPT_URL = localStorage.getItem('fibravit_script_url') || '';

// ===== COORDENADORES E SETORES (fallback local) =====
const COORDENADORES = [
  { id: 1, nome: 'José Afonso', area: 'Frota / Manutenção' },
  { id: 2, nome: 'Jhully', area: 'Operações / RH' },
  { id: 3, nome: 'Davi', area: 'Controladoria / Seatrium' },
  { id: 4, nome: 'Gabriel', area: 'Operações / Campo' }
];

const SETORES = [
  'Frota','Financeira','Operações','RH','Qualidade','Manutenção',
  'Controladoria','Comercial','Filial Pará','Medição','Segurança','Almoxarifado','TI'
];

const STATUS_ACAO = ['Realizada','Em andamento','Pendente','Cancelada','Não iniciada'];
const STATUS_NC = ['Aberta','Em tratativa','Eficaz','Não eficaz','Encerrada'];
const TIPOS_ANOMALIA = ['Falha no Processo','Falha Humana','Falha de Equipamento','Não Conformidade','Acidente','Quase Acidente'];
const MESES = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];

// ===== CACHE LOCAL =====
const _cache = {};

function getCached(key) {
  return _cache[key] || null;
}
function setCached(key, data) {
  _cache[key] = data;
}
function clearCache(key) {
  if (key) delete _cache[key];
  else Object.keys(_cache).forEach(k => delete _cache[k]);
}

// ===== STORAGE LOCAL (fallback sem Apps Script) =====
function getLocalData(key) {
  try {
    const raw = localStorage.getItem('fibravit_' + key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setLocalData(key, data) {
  localStorage.setItem('fibravit_' + key, JSON.stringify(data));
}

// Inicializar dados locais com dados das planilhas
function initLocalData() {
  if (!getLocalData('anomalias')) setLocalData('anomalias', DADOS_INICIAIS.anomalias);
  if (!getLocalData('reclamacoes')) setLocalData('reclamacoes', DADOS_INICIAIS.reclamacoes);
  if (!getLocalData('ncs')) setLocalData('ncs', DADOS_INICIAIS.ncs);
  if (!getLocalData('plano_acao')) setLocalData('plano_acao', DADOS_INICIAIS.pa_geral);
  if (!getLocalData('atividades')) setLocalData('atividades', DADOS_INICIAIS.entregas);
  if (!getLocalData('coordenadores')) setLocalData('coordenadores', COORDENADORES);
  if (!getLocalData('setores')) setLocalData('setores', SETORES);
}

// ===== APPS SCRIPT API =====
async function apiGet(aba) {
  if (!APPS_SCRIPT_URL) return null;
  const cached = getCached(aba);
  if (cached) return cached;
  try {
    showLoading(true);
    const res = await fetch(`${APPS_SCRIPT_URL}?aba=${aba}&action=read`);
    const json = await res.json();
    if (json.status === 'ok') {
      setCached(aba, json.data);
      // Sincronizar com localStorage
      setLocalData(aba, json.data);
      return json.data;
    }
    return null;
  } catch(e) {
    console.warn('Apps Script indisponível, usando dados locais:', e.message);
    return null;
  } finally {
    showLoading(false);
  }
}

async function apiPost(action, aba, dados, extra = {}) {
  if (!APPS_SCRIPT_URL) return false;
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action, aba, dados, ...extra })
    });
    const json = await res.json();
    if (json.status === 'ok') {
      clearCache(aba);
      return true;
    }
    return false;
  } catch(e) {
    console.warn('Erro ao gravar no Sheets:', e.message);
    return false;
  }
}

async function getData(key) {
  // Tenta Apps Script primeiro, fallback para localStorage
  const fromApi = await apiGet(key);
  if (fromApi) return fromApi;
  return getLocalData(key) || [];
}

async function saveData(aba, dados) {
  // Salva localmente sempre
  const local = getLocalData(aba) || [];
  local.push(dados);
  setLocalData(aba, local);
  clearCache(aba);

  // Tenta salvar no Apps Script
  const ok = await apiPost('insert', aba, dados);
  return ok;
}

async function getStats() {
  if (!APPS_SCRIPT_URL) return null;
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=stats`);
    const json = await res.json();
    return json.stats || null;
  } catch { return null; }
}

// ===== LOADING =====
function showLoading(show) {
  let el = document.getElementById('loadingBar');
  if (!el) {
    el = document.createElement('div');
    el.id = 'loadingBar';
    el.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:3px;background:linear-gradient(90deg,#205587,#4da3ff,#205587);background-size:200%;animation:loadingAnim 1.2s linear infinite;z-index:9999;transition:opacity 0.3s';
    document.head.insertAdjacentHTML('beforeend','<style>@keyframes loadingAnim{0%{background-position:0%}100%{background-position:200%}}</style>');
    document.body.appendChild(el);
  }
  el.style.opacity = show ? '1' : '0';
}

// ===== UTILITÁRIOS =====
function formatDate(dateStr) {
  if (!dateStr) return '-';
  if (dateStr.includes('/')) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('pt-BR');
}

function today() {
  return new Date().toLocaleDateString('pt-BR');
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function isVencido(prazoStr) {
  if (!prazoStr || prazoStr === '-') return false;
  const parts = prazoStr.split('/');
  if (parts.length !== 3) return false;
  const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  return d < new Date() && !isNaN(d);
}

function diasRestantes(prazoStr) {
  if (!prazoStr || prazoStr === '-') return null;
  const parts = prazoStr.split('/');
  if (parts.length !== 3) return null;
  const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  if (isNaN(d)) return null;
  return Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
}

function getStatusBadge(status) {
  if (!status) return '<span class="badge badge-cinza">-</span>';
  const s = status.toLowerCase();
  if (s.includes('realiz') || s.includes('conclu') || s.includes('eficaz') || s.includes('encerr'))
    return `<span class="badge badge-verde">✓ ${status}</span>`;
  if (s.includes('andamento') || s.includes('tratativa'))
    return `<span class="badge badge-azul">⟳ ${status}</span>`;
  if (s.includes('pend') || s.includes('aberta') || s.includes('não inici'))
    return `<span class="badge badge-amarelo">⏳ ${status}</span>`;
  if (s.includes('cancel') || s.includes('não eficaz'))
    return `<span class="badge badge-vermelho">✗ ${status}</span>`;
  return `<span class="badge badge-cinza">${status}</span>`;
}

function getPrazoBadge(prazoStr, status) {
  if (!prazoStr || prazoStr === '-') return '<span class="badge badge-cinza">-</span>';
  const s = (status || '').toLowerCase();
  if (s.includes('realiz') || s.includes('conclu') || s.includes('encerr'))
    return `<span class="badge badge-verde">${prazoStr}</span>`;
  const dias = diasRestantes(prazoStr);
  if (dias === null) return `<span class="badge badge-cinza">${prazoStr}</span>`;
  if (dias < 0) return `<span class="badge badge-vermelho">⚠ ${prazoStr} (${Math.abs(dias)}d atraso)</span>`;
  if (dias <= 3) return `<span class="badge badge-laranja">⚡ ${prazoStr} (${dias}d)</span>`;
  if (dias <= 7) return `<span class="badge badge-amarelo">⏰ ${prazoStr} (${dias}d)</span>`;
  return `<span class="badge badge-azul">${prazoStr}</span>`;
}

// ===== TOAST =====
function showToast(msg, type = 'info') {
  let toast = document.getElementById('toast-global');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-global';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  toast.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.className = 'toast'; }, 3500);
}

// ===== MODAL =====
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

// ===== NAVEGAÇÃO =====
function setActiveNav(page) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
}

// ===== PAGINAÇÃO =====
function paginate(data, page, perPage = 15) {
  const total = data.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  return { items: data.slice(start, start + perPage), total, totalPages, page };
}

function renderPagination(containerId, current, total, onPage) {
  const el = document.getElementById(containerId);
  if (!el || total <= 1) { if (el) el.innerHTML = ''; return; }
  let html = '<div style="display:flex;gap:6px;align-items:center;justify-content:flex-end;margin-top:14px;">';
  html += `<button class="btn btn-outline btn-sm" onclick="${onPage}(${current-1})" ${current===1?'disabled':''}>‹ Ant</button>`;
  const start = Math.max(1, current-2), end = Math.min(total, current+2);
  if (start > 1) html += `<button class="btn btn-outline btn-sm" onclick="${onPage}(1)">1</button>`;
  if (start > 2) html += `<span style="padding:0 4px;color:#94a3b8">...</span>`;
  for (let i = start; i <= end; i++)
    html += `<button class="btn btn-sm ${i===current?'btn-primary':'btn-outline'}" onclick="${onPage}(${i})">${i}</button>`;
  if (end < total-1) html += `<span style="padding:0 4px;color:#94a3b8">...</span>`;
  if (end < total) html += `<button class="btn btn-outline btn-sm" onclick="${onPage}(${total})">${total}</button>`;
  html += `<button class="btn btn-outline btn-sm" onclick="${onPage}(${current+1})" ${current===total?'disabled':''}>Próx ›</button>`;
  html += `<span style="font-size:12px;color:#94a3b8;margin-left:6px">${current}/${total}</span></div>`;
  el.innerHTML = html;
}

// ===== EXPORTAR CSV =====
function exportCSV(data, filename) {
  if (!data || !data.length) { showToast('Nenhum dado para exportar','warning'); return; }
  const headers = Object.keys(data[0]).filter(k => k !== '_rowIndex');
  const rows = data.map(r => headers.map(h => `"${(r[h]||'').toString().replace(/"/g,'""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\ufeff'+csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename+'_'+todayISO()+'.csv';
  a.click(); URL.revokeObjectURL(url);
  showToast('Exportado com sucesso!','success');
}

// ===== CHARTS =====
function createBarChart(canvasId, labels, datasets, options={}) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (ctx._chart) ctx._chart.destroy();
  ctx._chart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ display: datasets.length>1 } },
      scales:{ y:{ beginAtZero:true, ticks:{ stepSize:1 } } }, ...options }
  });
}

function createDoughnutChart(canvasId, labels, data, colors) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (ctx._chart) ctx._chart.destroy();
  ctx._chart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets:[{ data, backgroundColor:colors, borderWidth:2, borderColor:'#fff' }] },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ position:'bottom', labels:{ font:{size:11}, padding:12 } } }, cutout:'65%' }
  });
}

function createLineChart(canvasId, labels, datasets) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (ctx._chart) ctx._chart.destroy();
  ctx._chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ display:true } },
      scales:{ y:{ beginAtZero:true } }, tension:0.4 }
  });
}

// ===== STATUS BADGE APPS SCRIPT =====
function updateScriptBadge() {
  const url = localStorage.getItem('fibravit_script_url');
  const badge = document.getElementById('sheetsBadge');
  if (!badge) return;
  if (url) {
    badge.innerHTML = '🟢 Sheets conectado';
    badge.style.background = '#dcfce7';
    badge.style.color = '#166534';
  } else {
    badge.innerHTML = '⬜ Sheets não conectado';
    badge.style.background = '#f1f5f9';
    badge.style.color = '#475569';
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initLocalData();
  APPS_SCRIPT_URL = localStorage.getItem('fibravit_script_url') || '';
});