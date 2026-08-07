// ============================================================
// GRUPO FIBRAVIT — PAGES.JS — Todas as páginas do sistema
// ============================================================

let currentPage = 'dashboard';
let currentPageNum = 1;

function navigate(page) {
  currentPage = page;
  currentPageNum = 1;
  setActiveNav(page);

  const titles = {
    dashboard: ['Dashboard Geral', 'Visão consolidada do sistema'],
    anomalias: ['Anomalias', 'Registro e acompanhamento de anomalias'],
    ncs: ['Não Conformidades', 'Registro e tratativa de NCs'],
    reclamacoes: ['Reclamações de Clientes', 'Registro e análise de reclamações'],
    plano_acao: ['Plano de Ação', 'Acompanhamento das ações empresariais'],
    atividades: ['Atividades / Entregas', 'Principais entregas por coordenador'],
    rel_anomalias: ['Relatório de Anomalias', 'Análise de reincidências e eficácia'],
    rel_qualidade: ['Relatório de Qualidade', 'NCs e Reclamações consolidadas'],
    coordenadores: ['Avaliação de Coordenadores', 'Desempenho e eficiência da equipe'],
    cadastros: ['Cadastros', 'Coordenadores, setores e configurações'],
    google_sheets: ['Google Sheets', 'Configuração da integração com Google Sheets']
  };

  const [title, subtitle] = titles[page] || ['Página', ''];
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageSubtitle').textContent = subtitle;

  const pages = {
    dashboard: renderDashboard,
    anomalias: renderAnomalias,
    ncs: renderNCs,
    reclamacoes: renderReclamacoes,
    plano_acao: renderPlanoAcao,
    atividades: renderAtividades,
    rel_anomalias: renderRelAnomalias,
    rel_qualidade: renderRelQualidade,
    coordenadores: renderCoordenadores,
    cadastros: renderCadastros,
    google_sheets: renderGoogleSheets
  };

  const fn = pages[page];
  if (fn) fn();
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const anomalias = getLocalData('anomalias') || [];
  const ncs = getLocalData('ncs') || [];
  const reclamacoes = getLocalData('reclamacoes') || [];
  const plano = getLocalData('plano_acao') || [];
  const atividades = getLocalData('atividades') || [];

  const anomaliasAbertas = anomalias.filter(a => !a.status_acao || a.status_acao === '' || a.status_acao.toLowerCase().includes('pend') || a.status_acao.toLowerCase().includes('andamento')).length;
  const ncsAbertas = ncs.filter(n => !n.eficaz || n.eficaz === '').length;
  const recProced = reclamacoes.filter(r => (r.procede || '').toUpperCase() === 'SIM').length;
  const acoesVencidas = plano.filter(a => {
    const s = (a.status || '').toLowerCase();
    return !s.includes('realiz') && !s.includes('conclu') && isVencido(a.prazo);
  }).length;
  const atividadesPend = atividades.filter(a => {
    const s = (a.status || '').toLowerCase();
    return !s.includes('realiz') && !s.includes('conclu');
  }).length;
  const reincidentes = anomalias.filter(a => (a.reincidencia || '').toUpperCase() === 'SIM').length;

  document.getElementById('pageContent').innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card" onclick="navigate('anomalias')" style="cursor:pointer">
        <div class="kpi-icon amarelo">⚠️</div>
        <div class="kpi-info">
          <h3>${anomalias.length}</h3>
          <p>Total de Anomalias</p>
          <small style="color:#f59e0b;font-weight:600">${anomaliasAbertas} em aberto</small>
        </div>
      </div>
      <div class="kpi-card" onclick="navigate('ncs')" style="cursor:pointer">
        <div class="kpi-icon vermelho">🔴</div>
        <div class="kpi-info">
          <h3>${ncs.length}</h3>
          <p>Não Conformidades</p>
          <small style="color:#ef4444;font-weight:600">${ncsAbertas} sem eficácia</small>
        </div>
      </div>
      <div class="kpi-card" onclick="navigate('reclamacoes')" style="cursor:pointer">
        <div class="kpi-icon laranja">📣</div>
        <div class="kpi-info">
          <h3>${reclamacoes.length}</h3>
          <p>Reclamações</p>
          <small style="color:#f97316;font-weight:600">${recProced} procedentes</small>
        </div>
      </div>
      <div class="kpi-card" onclick="navigate('plano_acao')" style="cursor:pointer">
        <div class="kpi-icon azul">📋</div>
        <div class="kpi-info">
          <h3>${plano.length}</h3>
          <p>Ações no Plano</p>
          <small style="color:#ef4444;font-weight:600">${acoesVencidas} vencidas</small>
        </div>
      </div>
      <div class="kpi-card" onclick="navigate('atividades')" style="cursor:pointer">
        <div class="kpi-icon verde">✅</div>
        <div class="kpi-info">
          <h3>${atividades.length}</h3>
          <p>Atividades</p>
          <small style="color:#f59e0b;font-weight:600">${atividadesPend} pendentes</small>
        </div>
      </div>
      <div class="kpi-card" onclick="navigate('rel_anomalias')" style="cursor:pointer">
        <div class="kpi-icon roxo">🔁</div>
        <div class="kpi-info">
          <h3>${reincidentes}</h3>
          <p>Reincidências</p>
          <small style="color:#8b5cf6;font-weight:600">anomalias repetidas</small>
        </div>
      </div>
    </div>

    ${acoesVencidas > 0 ? `<div class="alert alert-danger">⚠️ <strong>${acoesVencidas} ações vencidas</strong> no Plano de Ação precisam de atenção imediata!</div>` : ''}
    ${reincidentes > 0 ? `<div class="alert alert-warning">🔁 <strong>${reincidentes} anomalias reincidentes</strong> identificadas — verifique as ações corretivas.</div>` : ''}

    <div class="charts-grid">
      <div class="chart-card">
        <h3>📊 Anomalias por Setor</h3>
        <div style="height:220px"><canvas id="chartAnomaliaSetor"></canvas></div>
      </div>
      <div class="chart-card">
        <h3>📊 Status do Plano de Ação</h3>
        <div style="height:220px"><canvas id="chartStatusPlano"></canvas></div>
      </div>
      <div class="chart-card">
        <h3>📈 Anomalias por Mês</h3>
        <div style="height:220px"><canvas id="chartAnomaliasMes"></canvas></div>
      </div>
      <div class="chart-card">
        <h3>👥 Atividades por Coordenador</h3>
        <div style="height:220px"><canvas id="chartAtivCoord"></canvas></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>⚠️ Últimas Anomalias Registradas</h2>
        <button class="btn btn-outline btn-sm" onclick="navigate('anomalias')">Ver todas →</button>
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>#</th><th>Data</th><th>Setor</th><th>Tipo</th><th>Descrição</th><th>Status</th></tr></thead>
          <tbody>
            ${anomalias.slice(-5).reverse().map(a => `
              <tr>
                <td><strong>${a.numero}</strong></td>
                <td>${a.data}</td>
                <td>${a.setor}</td>
                <td>${a.tipo}</td>
                <td style="max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.descricao}</td>
                <td>${getStatusBadge(a.status_acao || 'Pendente')}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Charts
  setTimeout(() => {
    // Anomalias por setor
    const setorCount = {};
    anomalias.forEach(a => { setorCount[a.setor] = (setorCount[a.setor] || 0) + 1; });
    const setores = Object.keys(setorCount).slice(0, 8);
    createBarChart('chartAnomaliaSetor', setores, [{
      label: 'Anomalias', data: setores.map(s => setorCount[s]),
      backgroundColor: '#205587', borderRadius: 6
    }]);

    // Status plano
    const statusCount = {};
    plano.forEach(a => { const s = a.status || 'Sem status'; statusCount[s] = (statusCount[s] || 0) + 1; });
    createDoughnutChart('chartStatusPlano', Object.keys(statusCount), Object.values(statusCount),
      ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#94a3b8']);

    // Anomalias por mês
    const mesesOrder = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
    const mesCount = {};
    anomalias.forEach(a => { if (a.mes) mesCount[a.mes] = (mesCount[a.mes] || 0) + 1; });
    const mesesPresentes = mesesOrder.filter(m => mesCount[m]);
    createLineChart('chartAnomaliasMes', mesesPresentes.map(m => m.substring(0,3)), [{
      label: 'Anomalias', data: mesesPresentes.map(m => mesCount[m]),
      borderColor: '#245E94', backgroundColor: 'rgba(36,94,148,0.1)', fill: true
    }]);

    // Atividades por coordenador
    const coordCount = {};
    atividades.forEach(a => { coordCount[a.coordenador] = (coordCount[a.coordenador] || 0) + 1; });
    createBarChart('chartAtivCoord', Object.keys(coordCount), [{
      label: 'Atividades', data: Object.values(coordCount),
      backgroundColor: ['#205587','#245E94','#1a4a7a','#10243A'], borderRadius: 6
    }]);
  }, 100);
}

// ============================================================
// ANOMALIAS
// ============================================================
function renderAnomalias() {
  const anomalias = getLocalData('anomalias') || [];
  const setores = getLocalData('setores') || SETORES;
  renderAnomaliasTable(anomalias, 1);
}

function renderAnomaliasTable(data, page) {
  const anomalias = getLocalData('anomalias') || [];
  const setores = getLocalData('setores') || SETORES;

  // Filtros ativos
  const fSetor = document.getElementById('fAnomSetor')?.value || '';
  const fStatus = document.getElementById('fAnomStatus')?.value || '';
  const fMes = document.getElementById('fAnomMes')?.value || '';
  const fReincid = document.getElementById('fAnomReincid')?.value || '';
  const fBusca = document.getElementById('fAnomBusca')?.value?.toLowerCase() || '';

  let filtered = anomalias.filter(a => {
    if (fSetor && a.setor !== fSetor) return false;
    if (fStatus && a.status_acao !== fStatus) return false;
    if (fMes && a.mes !== fMes) return false;
    if (fReincid && (a.reincidencia || '').toUpperCase() !== fReincid) return false;
    if (fBusca && !JSON.stringify(a).toLowerCase().includes(fBusca)) return false;
    return true;
  });

  const { items, total, totalPages } = paginate(filtered, page, 15);

  document.getElementById('pageContent').innerHTML = `
    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="openModal('modalNovaAnomalia')">➕ Nova Anomalia</button>
      <button class="btn btn-outline" onclick="exportCSV(getLocalData('anomalias'),'anomalias')">📥 Exportar CSV</button>
      <button class="btn btn-outline" onclick="navigate('rel_anomalias')">📈 Ver Relatório</button>
    </div>

    <div class="filtros-bar">
      <div class="form-group">
        <label>Buscar</label>
        <input type="text" id="fAnomBusca" placeholder="Buscar..." value="${fBusca}" oninput="aplicarFiltrosAnom()">
      </div>
      <div class="form-group">
        <label>Setor</label>
        <select id="fAnomSetor" onchange="aplicarFiltrosAnom()">
          <option value="">Todos</option>
          ${setores.map(s => `<option value="${s}" ${fSetor===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="fAnomStatus" onchange="aplicarFiltrosAnom()">
          <option value="">Todos</option>
          ${['Realizado','Em andamento','Pendente','Cancelado'].map(s => `<option value="${s}" ${fStatus===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Mês</label>
        <select id="fAnomMes" onchange="aplicarFiltrosAnom()">
          <option value="">Todos</option>
          ${MESES.map(m => `<option value="${m}" ${fMes===m?'selected':''}>${m}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Reincidência</label>
        <select id="fAnomReincid" onchange="aplicarFiltrosAnom()">
          <option value="">Todas</option>
          <option value="SIM" ${fReincid==='SIM'?'selected':''}>Sim</option>
          <option value="NÃO" ${fReincid==='NÃO'?'selected':''}>Não</option>
        </select>
      </div>
      <button class="btn btn-outline btn-sm" onclick="limparFiltrosAnom()">✕ Limpar</button>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>⚠️ Anomalias <span style="font-size:13px;font-weight:400;color:#64748b">(${total} registros)</span></h2>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Mês</th><th>Data</th><th>Setor</th><th>Tipo</th>
              <th>Descrição</th><th>Status</th><th>Reincid.</th><th>Prazo</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${items.length === 0 ? `<tr><td colspan="10"><div class="empty-state"><div class="icon">🔍</div><h3>Nenhum registro encontrado</h3></div></td></tr>` :
              items.map((a, i) => `
                <tr>
                  <td><strong>${a.numero || (i+1)}</strong></td>
                  <td><span style="font-size:11px">${(a.mes||'').substring(0,3)}</span></td>
                  <td style="white-space:nowrap">${a.data}</td>
                  <td>${a.setor}</td>
                  <td style="font-size:12px">${a.tipo}</td>
                  <td style="max-width:250px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${a.descricao}">${a.descricao}</td>
                  <td>${getStatusBadge(a.status_acao || 'Pendente')}</td>
                  <td>${a.reincidencia === 'SIM' ? '<span class="badge badge-vermelho">🔁 Sim</span>' : '<span class="badge badge-cinza">Não</span>'}</td>
                  <td>${getPrazoBadge('', a.status_acao)}</td>
                  <td>
                    <button class="btn btn-outline btn-sm" onclick="verAnomalia(${anomalias.indexOf(a)})">👁</button>
                    <button class="btn btn-outline btn-sm" onclick="editarAnomalia(${anomalias.indexOf(a)})">✏️</button>
                  </td>
                </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div id="paginacaoAnom"></div>
    </div>

    <!-- MODAL NOVA ANOMALIA -->
    <div class="modal-overlay" id="modalNovaAnomalia">
      <div class="modal">
        <div class="modal-header">
          <h3>➕ Registrar Nova Anomalia</h3>
          <button class="modal-close" onclick="closeModal('modalNovaAnomalia')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Mês *</label>
              <select id="naMes">
                ${MESES.map(m => `<option value="${m}">${m}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Data *</label>
              <input type="date" id="naData" value="${todayISO()}">
            </div>
            <div class="form-group">
              <label>Setor *</label>
              <select id="naSetor">
                ${setores.map(s => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Tipo *</label>
              <select id="naTipo">
                ${TIPOS_ANOMALIA.map(t => `<option value="${t}">${t}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Origem</label>
              <input type="text" id="naOrigem" placeholder="Ex: Inspeção de pneu">
            </div>
            <div class="form-group">
              <label>Status da Ação</label>
              <select id="naStatus">
                <option value="Pendente">Pendente</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Realizado">Realizado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div class="form-group">
              <label>Reincidência?</label>
              <select id="naReincid">
                <option value="">Não</option>
                <option value="SIM">SIM</option>
              </select>
            </div>
            <div class="form-group full">
              <label>Descrição da Anomalia *</label>
              <textarea id="naDescricao" placeholder="Descreva a anomalia detalhadamente..."></textarea>
            </div>
            <div class="form-group full">
              <label>Análise da Anomalia</label>
              <textarea id="naAnalise" placeholder="Análise da causa raiz..."></textarea>
            </div>
            <div class="form-group full">
              <label>Ações para Correção</label>
              <textarea id="naAcoes" placeholder="Descreva as ações corretivas..."></textarea>
            </div>
            <div class="form-group full">
              <label>Impacto / Registro</label>
              <textarea id="naImpacto" placeholder="Impacto gerado..."></textarea>
            </div>
            <div class="form-group full">
              <label>Observação</label>
              <input type="text" id="naObs" placeholder="Observações adicionais">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('modalNovaAnomalia')">Cancelar</button>
          <button class="btn btn-primary" onclick="salvarAnomalia()">💾 Salvar Anomalia</button>
        </div>
      </div>
    </div>

    <!-- MODAL VER/EDITAR -->
    <div class="modal-overlay" id="modalVerAnomalia">
      <div class="modal">
        <div class="modal-header">
          <h3 id="modalVerAnomaliaTitle">Detalhes da Anomalia</h3>
          <button class="modal-close" onclick="closeModal('modalVerAnomalia')">✕</button>
        </div>
        <div class="modal-body" id="modalVerAnomaliaBody"></div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('modalVerAnomalia')">Fechar</button>
        </div>
      </div>
    </div>
  `;

  renderPagination('paginacaoAnom', page, totalPages, 'goPageAnom');
  window._anomFiltrados = filtered;
}

function aplicarFiltrosAnom() { renderAnomaliasTable(getLocalData('anomalias') || [], 1); }
function limparFiltrosAnom() {
  ['fAnomBusca','fAnomSetor','fAnomStatus','fAnomMes','fAnomReincid'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  renderAnomaliasTable(getLocalData('anomalias') || [], 1);
}
function goPageAnom(p) { renderAnomaliasTable(getLocalData('anomalias') || [], p); }

function salvarAnomalia() {
  const anomalias = getLocalData('anomalias') || [];
  const desc = document.getElementById('naDescricao').value.trim();
  if (!desc) { showToast('Preencha a descrição da anomalia!', 'error'); return; }
  const dataVal = document.getElementById('naData').value;
  const dataBR = dataVal ? dataVal.split('-').reverse().join('/') : today();
  const novo = {
    numero: String(anomalias.length + 1),
    mes: document.getElementById('naMes').value,
    data: dataBR,
    setor: document.getElementById('naSetor').value,
    tipo: document.getElementById('naTipo').value,
    origem: document.getElementById('naOrigem').value,
    descricao: desc,
    analise: document.getElementById('naAnalise').value,
    acoes_correcao: document.getElementById('naAcoes').value,
    impacto: document.getElementById('naImpacto').value,
    status_acao: document.getElementById('naStatus').value,
    reincidencia: document.getElementById('naReincid').value,
    observacao: document.getElementById('naObs').value
  };
  anomalias.push(novo);
  setLocalData('anomalias', anomalias);
  // Tentar gravar no Sheets
  const row = [novo.numero, novo.mes, novo.data, novo.setor, novo.tipo, novo.origem, novo.descricao, novo.analise, novo.acoes_correcao, novo.impacto, novo.status_acao, novo.reincidencia, novo.observacao];
  appendToSheet(SHEET_TABS.anomalias, row).then(ok => {
    if (ok) showToast('Anomalia salva no Google Sheets!', 'success');
    else showToast('Anomalia salva localmente!', 'success');
  });
  closeModal('modalNovaAnomalia');
  renderAnomaliasTable(anomalias, 1);
}

function verAnomalia(idx) {
  const a = (getLocalData('anomalias') || [])[idx];
  if (!a) return;
  document.getElementById('modalVerAnomaliaTitle').textContent = `Anomalia #${a.numero} — ${a.setor}`;
  document.getElementById('modalVerAnomaliaBody').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      ${[['Número',a.numero],['Mês',a.mes],['Data',a.data],['Setor',a.setor],['Tipo',a.tipo],['Origem',a.origem],['Status',a.status_acao],['Reincidência',a.reincidencia]].map(([l,v])=>`
        <div><strong style="font-size:11px;color:#64748b;text-transform:uppercase">${l}</strong><p style="margin-top:4px">${v||'-'}</p></div>
      `).join('')}
    </div>
    <hr style="margin:16px 0;border-color:#e2e8f0">
    ${[['Descrição',a.descricao],['Análise',a.analise],['Ações para Correção',a.acoes_correcao],['Impacto',a.impacto],['Observação',a.observacao]].map(([l,v])=>v?`
      <div style="margin-bottom:12px"><strong style="font-size:11px;color:#64748b;text-transform:uppercase">${l}</strong><p style="margin-top:4px;font-size:13px;line-height:1.6">${v}</p></div>
    `:'').join('')}
  `;
  openModal('modalVerAnomalia');
}

function editarAnomalia(idx) { verAnomalia(idx); }

// ============================================================
// NÃO CONFORMIDADES
// ============================================================
function renderNCs() {
  const ncs = getLocalData('ncs') || [];
  const setores = getLocalData('setores') || SETORES;

  document.getElementById('pageContent').innerHTML = `
    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="openModal('modalNovaNC')">➕ Nova NC</button>
      <button class="btn btn-outline" onclick="exportCSV(getLocalData('ncs'),'nao_conformidades')">📥 Exportar CSV</button>
    </div>

    <div class="filtros-bar">
      <div class="form-group">
        <label>Buscar</label>
        <input type="text" id="fNCBusca" placeholder="Buscar..." oninput="filtrarNCs()">
      </div>
      <div class="form-group">
        <label>Área</label>
        <select id="fNCArea" onchange="filtrarNCs()">
          <option value="">Todas</option>
          ${setores.map(s=>`<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Eficácia</label>
        <select id="fNCEficaz" onchange="filtrarNCs()">
          <option value="">Todas</option>
          <option value="Sim">Eficaz</option>
          <option value="Não">Não Eficaz</option>
        </select>
      </div>
      <button class="btn btn-outline btn-sm" onclick="limparFiltrosNC()">✕ Limpar</button>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>🔴 Não Conformidades <span style="font-size:13px;font-weight:400;color:#64748b">(${ncs.length} registros)</span></h2>
      </div>
      <div class="table-wrapper" id="tabelaNCs">
        ${renderNCsTabela(ncs)}
      </div>
      <div id="paginacaoNCs"></div>
    </div>

    <!-- MODAL NOVA NC -->
    <div class="modal-overlay" id="modalNovaNC">
      <div class="modal" style="max-width:800px">
        <div class="modal-header">
          <h3>➕ Registrar Nova Não Conformidade</h3>
          <button class="modal-close" onclick="closeModal('modalNovaNC')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Data de Registro *</label>
              <input type="date" id="ncData" value="${todayISO()}">
            </div>
            <div class="form-group">
              <label>Área *</label>
              <select id="ncArea">
                ${setores.map(s=>`<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Origem</label>
              <select id="ncOrigem">
                <option>Reclamação de Cliente</option>
                <option>Serviço NC</option>
                <option>Auditoria Interna</option>
                <option>Auditoria Externa</option>
                <option>Outras</option>
              </select>
            </div>
            <div class="form-group">
              <label>Responsável *</label>
              <select id="ncResponsavel">
                ${COORDENADORES.map(c=>`<option value="${c.nome}">${c.nome}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Prazo</label>
              <input type="date" id="ncPrazo">
            </div>
            <div class="form-group">
              <label>Eficaz?</label>
              <select id="ncEficaz">
                <option value="">Em avaliação</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>
            <div class="form-group full">
              <label>Descrição da NC *</label>
              <textarea id="ncDescricao" placeholder="Descreva a não conformidade..."></textarea>
            </div>
            <div class="form-group full">
              <label>Correção Imediata</label>
              <textarea id="ncCorrecao" placeholder="Ação imediata tomada..."></textarea>
            </div>
            <div class="form-group full">
              <label>Causas da NC</label>
              <textarea id="ncCausas" placeholder="Análise de causa raiz..."></textarea>
            </div>
            <div class="form-group full">
              <label>Ações Corretivas</label>
              <textarea id="ncAcoes" placeholder="Plano de ação corretiva..."></textarea>
            </div>
            <div class="form-group full">
              <label>Resultados Obtidos</label>
              <textarea id="ncResultados" placeholder="Resultados após implementação..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('modalNovaNC')">Cancelar</button>
          <button class="btn btn-primary" onclick="salvarNC()">💾 Salvar NC</button>
        </div>
      </div>
    </div>
  `;
}

function renderNCsTabela(ncs) {
  if (!ncs.length) return `<div class="empty-state"><div class="icon">✅</div><h3>Nenhuma NC registrada</h3></div>`;
  return `<table>
    <thead><tr><th>#</th><th>Data</th><th>Área</th><th>Origem</th><th>Responsável</th><th>Descrição</th><th>Prazo</th><th>Eficácia</th><th>Ações</th></tr></thead>
    <tbody>
      ${ncs.map((n,i)=>`<tr>
        <td><strong>${n.numero_nc||i+1}</strong></td>
        <td style="white-space:nowrap">${n.data_registro}</td>
        <td>${n.area}</td>
        <td style="font-size:12px">${n.origem}</td>
        <td>${n.responsavel}</td>
        <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${n.descricao}">${n.descricao}</td>
        <td>${getPrazoBadge(n.prazo, n.eficaz)}</td>
        <td>${n.eficaz === 'Sim' ? '<span class="badge badge-verde">✓ Eficaz</span>' : n.eficaz === 'Não' ? '<span class="badge badge-vermelho">✗ Não Eficaz</span>' : '<span class="badge badge-amarelo">⏳ Avaliando</span>'}</td>
        <td><button class="btn btn-outline btn-sm" onclick="verNC(${i})">👁</button></td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function filtrarNCs() {
  const busca = (document.getElementById('fNCBusca')?.value||'').toLowerCase();
  const area = document.getElementById('fNCArea')?.value||'';
  const eficaz = document.getElementById('fNCEficaz')?.value||'';
  let ncs = getLocalData('ncs')||[];
  if (area) ncs = ncs.filter(n=>n.area===area);
  if (eficaz) ncs = ncs.filter(n=>(n.eficaz||'').includes(eficaz));
  if (busca) ncs = ncs.filter(n=>JSON.stringify(n).toLowerCase().includes(busca));
  document.getElementById('tabelaNCs').innerHTML = renderNCsTabela(ncs);
}

function limparFiltrosNC() {
  ['fNCBusca','fNCArea','fNCEficaz'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  filtrarNCs();
}

function salvarNC() {
  const ncs = getLocalData('ncs')||[];
  const desc = document.getElementById('ncDescricao').value.trim();
  if (!desc) { showToast('Preencha a descrição!','error'); return; }
  const dataVal = document.getElementById('ncData').value;
  const prazoVal = document.getElementById('ncPrazo').value;
  const novo = {
    numero_nc: String(ncs.length+1),
    data_registro: dataVal ? dataVal.split('-').reverse().join('/') : today(),
    area: document.getElementById('ncArea').value,
    origem: document.getElementById('ncOrigem').value,
    responsavel: document.getElementById('ncResponsavel').value,
    descricao: desc,
    correcao_imediata: document.getElementById('ncCorrecao').value,
    causas: document.getElementById('ncCausas').value,
    acoes_corretivas: document.getElementById('ncAcoes').value,
    prazo: prazoVal ? prazoVal.split('-').reverse().join('/') : '',
    resultados: document.getElementById('ncResultados').value,
    eficaz: document.getElementById('ncEficaz').value
  };
  ncs.push(novo);
  setLocalData('ncs', ncs);
  const row = Object.values(novo);
  appendToSheet(SHEET_TABS.ncs, row).then(ok => {
    showToast(ok ? 'NC salva no Google Sheets!' : 'NC salva localmente!', 'success');
  });
  closeModal('modalNovaNC');
  renderNCs();
}

function verNC(idx) {
  const n = (getLocalData('ncs')||[])[idx];
  if (!n) return;
  alert(`NC #${n.numero_nc}\n\nÁrea: ${n.area}\nOrigem: ${n.origem}\nResponsável: ${n.responsavel}\nDescrição: ${n.descricao}\nEficácia: ${n.eficaz||'Em avaliação'}`);
}

// ============================================================
// RECLAMAÇÕES
// ============================================================
function renderReclamacoes() {
  const recs = getLocalData('reclamacoes')||[];
  const setores = getLocalData('setores')||SETORES;

  document.getElementById('pageContent').innerHTML = `
    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="openModal('modalNovaRec')">➕ Nova Reclamação</button>
      <button class="btn btn-outline" onclick="exportCSV(getLocalData('reclamacoes'),'reclamacoes')">📥 Exportar CSV</button>
    </div>

    <div class="filtros-bar">
      <div class="form-group">
        <label>Buscar</label>
        <input type="text" id="fRecBusca" placeholder="Cliente, reclamante..." oninput="filtrarRecs()">
      </div>
      <div class="form-group">
        <label>Procede?</label>
        <select id="fRecProcede" onchange="filtrarRecs()">
          <option value="">Todas</option>
          <option value="SIM">Procedente</option>
          <option value="NÃO">Não Procedente</option>
        </select>
      </div>
      <div class="form-group">
        <label>Setor</label>
        <select id="fRecSetor" onchange="filtrarRecs()">
          <option value="">Todos</option>
          ${setores.map(s=>`<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-outline btn-sm" onclick="limparFiltrosRec()">✕ Limpar</button>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>📣 Reclamações <span style="font-size:13px;font-weight:400;color:#64748b">(${recs.length} registros)</span></h2>
      </div>
      <div class="table-wrapper" id="tabelaRecs">
        ${renderRecsTabela(recs)}
      </div>
    </div>

    <!-- MODAL NOVA RECLAMAÇÃO -->
    <div class="modal-overlay" id="modalNovaRec">
      <div class="modal" style="max-width:800px">
        <div class="modal-header">
          <h3>➕ Registrar Nova Reclamação</h3>
          <button class="modal-close" onclick="closeModal('modalNovaRec')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Reclamante *</label>
              <input type="text" id="recReclamante" placeholder="Nome do reclamante">
            </div>
            <div class="form-group">
              <label>Telefone</label>
              <input type="text" id="recTelefone" placeholder="(XX) XXXXX-XXXX">
            </div>
            <div class="form-group">
              <label>Cliente *</label>
              <input type="text" id="recCliente" placeholder="Nome do cliente/empresa">
            </div>
            <div class="form-group">
              <label>Localização</label>
              <input type="text" id="recLocal" placeholder="Ex: Vale, Seatrium...">
            </div>
            <div class="form-group">
              <label>Data da Reclamação *</label>
              <input type="date" id="recData" value="${todayISO()}">
            </div>
            <div class="form-group">
              <label>Registrado Por</label>
              <select id="recRegistradoPor">
                ${COORDENADORES.map(c=>`<option value="${c.nome}">${c.nome}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Setor Responsável</label>
              <select id="recSetor">
                ${setores.map(s=>`<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Procede?</label>
              <select id="recProcede">
                <option value="SIM">SIM</option>
                <option value="NÃO">NÃO</option>
                <option value="">Em análise</option>
              </select>
            </div>
            <div class="form-group full">
              <label>Descrição da Reclamação *</label>
              <textarea id="recDescricao" placeholder="Descreva a reclamação detalhadamente..."></textarea>
            </div>
            <div class="form-group full">
              <label>Análise da Reclamação</label>
              <textarea id="recAnalise" placeholder="Análise realizada..."></textarea>
            </div>
            <div class="form-group full">
              <label>Resposta Dada ao Cliente</label>
              <textarea id="recResposta" placeholder="Como foi respondido ao cliente..."></textarea>
            </div>
            <div class="form-group">
              <label>Responsável pela Resposta</label>
              <select id="recResponsavel">
                ${COORDENADORES.map(c=>`<option value="${c.nome}">${c.nome}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Número da NC (se procedente)</label>
              <input type="text" id="recNumNC" placeholder="Ex: NC-001">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('modalNovaRec')">Cancelar</button>
          <button class="btn btn-primary" onclick="salvarReclamacao()">💾 Salvar Reclamação</button>
        </div>
      </div>
    </div>
  `;
}

function renderRecsTabela(recs) {
  if (!recs.length) return `<div class="empty-state"><div class="icon">📣</div><h3>Nenhuma reclamação registrada</h3></div>`;
  return `<table>
    <thead><tr><th>#</th><th>Data</th><th>Reclamante</th><th>Cliente</th><th>Localização</th><th>Descrição</th><th>Procede?</th><th>Responsável</th><th>NC</th></tr></thead>
    <tbody>
      ${recs.map((r,i)=>`<tr>
        <td><strong>${i+1}</strong></td>
        <td style="white-space:nowrap">${r.data_reclamacao}</td>
        <td>${r.reclamante}</td>
        <td>${r.cliente}</td>
        <td>${r.localizacao}</td>
        <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${r.descricao}">${r.descricao}</td>
        <td>${(r.procede||'').toUpperCase()==='SIM'?'<span class="badge badge-vermelho">⚠ Sim</span>':'<span class="badge badge-verde">✓ Não</span>'}</td>
        <td>${r.responsavel}</td>
        <td>${r.numero_nc?`<span class="badge badge-azul">${r.numero_nc}</span>`:'-'}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function filtrarRecs() {
  const busca = (document.getElementById('fRecBusca')?.value||'').toLowerCase();
  const procede = document.getElementById('fRecProcede')?.value||'';
  const setor = document.getElementById('fRecSetor')?.value||'';
  let recs = getLocalData('reclamacoes')||[];
  if (procede) recs = recs.filter(r=>(r.procede||'').toUpperCase()===procede);
  if (setor) recs = recs.filter(r=>r.setor_responsavel===setor);
  if (busca) recs = recs.filter(r=>JSON.stringify(r).toLowerCase().includes(busca));
  document.getElementById('tabelaRecs').innerHTML = renderRecsTabela(recs);
}

function limparFiltrosRec() {
  ['fRecBusca','fRecProcede','fRecSetor'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  filtrarRecs();
}

function salvarReclamacao() {
  const recs = getLocalData('reclamacoes')||[];
  const desc = document.getElementById('recDescricao').value.trim();
  if (!desc) { showToast('Preencha a descrição!','error'); return; }
  const dataVal = document.getElementById('recData').value;
  const novo = {
    reclamante: document.getElementById('recReclamante').value,
    telefone: document.getElementById('recTelefone').value,
    cliente: document.getElementById('recCliente').value,
    localizacao: document.getElementById('recLocal').value,
    descricao: desc,
    data_reclamacao: dataVal ? dataVal.split('-').reverse().join('/') : today(),
    registrado_por: document.getElementById('recRegistradoPor').value,
    setor_responsavel: document.getElementById('recSetor').value,
    analise: document.getElementById('recAnalise').value,
    procede: document.getElementById('recProcede').value,
    responsavel: document.getElementById('recResponsavel').value,
    resposta: document.getElementById('recResposta').value,
    numero_nc: document.getElementById('recNumNC').value
  };
  recs.push(novo);
  setLocalData('reclamacoes', recs);
  appendToSheet(SHEET_TABS.reclamacoes, Object.values(novo)).then(ok => {
    showToast(ok ? 'Reclamação salva no Google Sheets!' : 'Reclamação salva localmente!', 'success');
  });
  closeModal('modalNovaRec');
  renderReclamacoes();
}

// ============================================================
// PLANO DE AÇÃO
// ============================================================
function renderPlanoAcao() {
  const plano = getLocalData('plano_acao')||[];
  const setores = getLocalData('setores')||SETORES;
  const coords = getLocalData('coordenadores')||COORDENADORES;

  const vencidas = plano.filter(a=>!['realizada','concluída'].includes((a.status||'').toLowerCase()) && isVencido(a.prazo)).length;

  document.getElementById('pageContent').innerHTML = `
    ${vencidas>0?`<div class="alert alert-danger">⚠️ <strong>${vencidas} ações vencidas</strong> precisam de atenção!</div>`:''}

    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="openModal('modalNovaAcao')">➕ Nova Ação</button>
      <button class="btn btn-outline" onclick="exportCSV(getLocalData('plano_acao'),'plano_acao')">📥 Exportar CSV</button>
    </div>

    <div class="filtros-bar">
      <div class="form-group">
        <label>Buscar</label>
        <input type="text" id="fPABusca" placeholder="Buscar ação..." oninput="filtrarPA()">
      </div>
      <div class="form-group">
        <label>Responsável</label>
        <select id="fPAResp" onchange="filtrarPA()">
          <option value="">Todos</option>
          ${coords.map(c=>`<option value="${c.nome||c}">${c.nome||c}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="fPAStatus" onchange="filtrarPA()">
          <option value="">Todos</option>
          ${STATUS_ACAO.map(s=>`<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Área</label>
        <select id="fPAArea" onchange="filtrarPA()">
          <option value="">Todas</option>
          ${setores.map(s=>`<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-outline btn-sm" onclick="limparFiltrosPA()">✕ Limpar</button>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>📋 Plano de Ação <span style="font-size:13px;font-weight:400;color:#64748b">(${plano.length} registros)</span></h2>
      </div>
      <div class="table-wrapper" id="tabelaPA">
        ${renderPATabela(plano)}
      </div>
      <div id="paginacaoPA"></div>
    </div>

    <!-- MODAL NOVA AÇÃO -->
    <div class="modal-overlay" id="modalNovaAcao">
      <div class="modal">
        <div class="modal-header">
          <h3>➕ Nova Ação no Plano</h3>
          <button class="modal-close" onclick="closeModal('modalNovaAcao')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Reunião / Origem</label>
              <input type="text" id="paReuniao" placeholder="Ex: Orçamento, Operacional...">
            </div>
            <div class="form-group">
              <label>Área Relacionada</label>
              <select id="paArea">
                ${setores.map(s=>`<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Responsável *</label>
              <select id="paResp">
                ${coords.map(c=>`<option value="${c.nome||c}">${c.nome||c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Data do Registro</label>
              <input type="date" id="paDataReg" value="${todayISO()}">
            </div>
            <div class="form-group">
              <label>Prazo *</label>
              <input type="date" id="paPrazo">
            </div>
            <div class="form-group">
              <label>Status</label>
              <select id="paStatus">
                ${STATUS_ACAO.map(s=>`<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group full">
              <label>Ação *</label>
              <textarea id="paAcao" placeholder="Descreva a ação a ser realizada..."></textarea>
            </div>
            <div class="form-group full">
              <label>Observação</label>
              <input type="text" id="paObs" placeholder="Observações adicionais">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('modalNovaAcao')">Cancelar</button>
          <button class="btn btn-primary" onclick="salvarAcao()">💾 Salvar Ação</button>
        </div>
      </div>
    </div>
  `;
}

function renderPATabela(plano) {
  if (!plano.length) return `<div class="empty-state"><div class="icon">📋</div><h3>Nenhuma ação registrada</h3></div>`;
  return `<table>
    <thead><tr><th>Reunião</th><th>Ação</th><th>Área</th><th>Responsável</th><th>Prazo</th><th>Conclusão</th><th>Status</th></tr></thead>
    <tbody>
      ${plano.map(a=>`<tr>
        <td style="white-space:nowrap;font-size:12px">${a.reuniao}</td>
        <td style="max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${a.acao}">${a.acao}</td>
        <td style="font-size:12px">${a.area}</td>
        <td>${a.responsavel}</td>
        <td>${getPrazoBadge(a.prazo, a.status)}</td>
        <td style="white-space:nowrap">${a.data_conclusao||'-'}</td>
        <td>${getStatusBadge(a.status)}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function filtrarPA() {
  const busca = (document.getElementById('fPABusca')?.value||'').toLowerCase();
  const resp = document.getElementById('fPAResp')?.value||'';
  const status = document.getElementById('fPAStatus')?.value||'';
  const area = document.getElementById('fPAArea')?.value||'';
  let plano = getLocalData('plano_acao')||[];
  if (resp) plano = plano.filter(a=>a.responsavel===resp);
  if (status) plano = plano.filter(a=>a.status===status);
  if (area) plano = plano.filter(a=>a.area===area);
  if (busca) plano = plano.filter(a=>JSON.stringify(a).toLowerCase().includes(busca));
  document.getElementById('tabelaPA').innerHTML = renderPATabela(plano);
}

function limparFiltrosPA() {
  ['fPABusca','fPAResp','fPAStatus','fPAArea'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  filtrarPA();
}

function salvarAcao() {
  const plano = getLocalData('plano_acao')||[];
  const acao = document.getElementById('paAcao').value.trim();
  if (!acao) { showToast('Preencha a ação!','error'); return; }
  const drVal = document.getElementById('paDataReg').value;
  const prVal = document.getElementById('paPrazo').value;
  const novo = {
    reuniao: document.getElementById('paReuniao').value,
    acao,
    area: document.getElementById('paArea').value,
    responsavel: document.getElementById('paResp').value,
    data_registro: drVal ? drVal.split('-').reverse().join('/') : today(),
    prazo: prVal ? prVal.split('-').reverse().join('/') : '',
    data_conclusao: '',
    status: document.getElementById('paStatus').value,
    observacao: document.getElementById('paObs').value
  };
  plano.push(novo);
  setLocalData('plano_acao', plano);
  appendToSheet(SHEET_TABS.plano_acao, Object.values(novo)).then(ok => {
    showToast(ok ? 'Ação salva no Google Sheets!' : 'Ação salva localmente!', 'success');
  });
  closeModal('modalNovaAcao');
  renderPlanoAcao();
}

// ============================================================
// ATIVIDADES
// ============================================================
function renderAtividades() {
  const atividades = getLocalData('atividades')||[];
  const coords = getLocalData('coordenadores')||COORDENADORES;

  document.getElementById('pageContent').innerHTML = `
    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="openModal('modalNovaAtiv')">➕ Nova Atividade</button>
      <button class="btn btn-outline" onclick="exportCSV(getLocalData('atividades'),'atividades')">📥 Exportar CSV</button>
    </div>

    <div class="filtros-bar">
      <div class="form-group">
        <label>Coordenador</label>
        <select id="fAtivCoord" onchange="filtrarAtiv()">
          <option value="">Todos</option>
          ${coords.map(c=>`<option value="${c.nome||c}">${c.nome||c}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="fAtivStatus" onchange="filtrarAtiv()">
          <option value="">Todos</option>
          ${STATUS_ACAO.map(s=>`<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Buscar</label>
        <input type="text" id="fAtivBusca" placeholder="Buscar atividade..." oninput="filtrarAtiv()">
      </div>
      <button class="btn btn-outline btn-sm" onclick="limparFiltrosAtiv()">✕ Limpar</button>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>✅ Atividades / Entregas <span style="font-size:13px;font-weight:400;color:#64748b">(${atividades.length} registros)</span></h2>
      </div>
      <div class="table-wrapper" id="tabelaAtiv">
        ${renderAtivTabela(atividades)}
      </div>
    </div>

    <!-- MODAL NOVA ATIVIDADE -->
    <div class="modal-overlay" id="modalNovaAtiv">
      <div class="modal">
        <div class="modal-header">
          <h3>➕ Registrar Nova Atividade</h3>
          <button class="modal-close" onclick="closeModal('modalNovaAtiv')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Coordenador *</label>
              <select id="ativCoord">
                ${coords.map(c=>`<option value="${c.nome||c}">${c.nome||c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Prazo *</label>
              <input type="date" id="ativPrazo">
            </div>
            <div class="form-group">
              <label>Data de Conclusão</label>
              <input type="date" id="ativConclusao">
            </div>
            <div class="form-group">
              <label>Status</label>
              <select id="ativStatus">
                ${STATUS_ACAO.map(s=>`<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group full">
              <label>Ação Planejada *</label>
              <textarea id="ativAcao" placeholder="Descreva a atividade planejada..."></textarea>
            </div>
            <div class="form-group full">
              <label>Resultado Gerado</label>
              <textarea id="ativResultado" placeholder="Qual foi o resultado obtido..."></textarea>
            </div>
            <div class="form-group full">
              <label>Motivo da Pendência</label>
              <textarea id="ativMotivo" placeholder="Se pendente, qual o motivo..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('modalNovaAtiv')">Cancelar</button>
          <button class="btn btn-primary" onclick="salvarAtividade()">💾 Salvar Atividade</button>
        </div>
      </div>
    </div>
  `;
}

function renderAtivTabela(atividades) {
  if (!atividades.length) return `<div class="empty-state"><div class="icon">✅</div><h3>Nenhuma atividade registrada</h3></div>`;
  return `<table>
    <thead><tr><th>Coordenador</th><th>Ação Planejada</th><th>Prazo</th><th>Conclusão</th><th>Status</th><th>Resultado</th><th>Motivo Pendência</th></tr></thead>
    <tbody>
      ${atividades.map(a=>`<tr>
        <td><strong>${a.coordenador}</strong></td>
        <td style="max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${a.acao}">${a.acao}</td>
        <td>${getPrazoBadge(a.prazo, a.status)}</td>
        <td style="white-space:nowrap">${a.data_conclusao||'-'}</td>
        <td>${getStatusBadge(a.status)}</td>
        <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px">${a.resultado||'-'}</td>
        <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;color:#f59e0b">${a.motivo_pendencia||'-'}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function filtrarAtiv() {
  const coord = document.getElementById('fAtivCoord')?.value||'';
  const status = document.getElementById('fAtivStatus')?.value||'';
  const busca = (document.getElementById('fAtivBusca')?.value||'').toLowerCase();
  let ativ = getLocalData('atividades')||[];
  if (coord) ativ = ativ.filter(a=>a.coordenador===coord);
  if (status) ativ = ativ.filter(a=>a.status===status);
  if (busca) ativ = ativ.filter(a=>JSON.stringify(a).toLowerCase().includes(busca));
  document.getElementById('tabelaAtiv').innerHTML = renderAtivTabela(ativ);
}

function limparFiltrosAtiv() {
  ['fAtivCoord','fAtivStatus','fAtivBusca'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  filtrarAtiv();
}

function salvarAtividade() {
  const atividades = getLocalData('atividades')||[];
  const acao = document.getElementById('ativAcao').value.trim();
  if (!acao) { showToast('Preencha a ação planejada!','error'); return; }
  const prVal = document.getElementById('ativPrazo').value;
  const conVal = document.getElementById('ativConclusao').value;
  const novo = {
    coordenador: document.getElementById('ativCoord').value,
    acao,
    prazo: prVal ? prVal.split('-').reverse().join('/') : '',
    data_conclusao: conVal ? conVal.split('-').reverse().join('/') : '',
    status: document.getElementById('ativStatus').value,
    resultado: document.getElementById('ativResultado').value,
    motivo_pendencia: document.getElementById('ativMotivo').value
  };
  atividades.push(novo);
  setLocalData('atividades', atividades);
  appendToSheet(SHEET_TABS.atividades, Object.values(novo)).then(ok => {
    showToast(ok ? 'Atividade salva no Google Sheets!' : 'Atividade salva localmente!', 'success');
  });
  closeModal('modalNovaAtiv');
  renderAtividades();
}

// ============================================================
// RELATÓRIO DE ANOMALIAS
// ============================================================
function renderRelAnomalias() {
  const anomalias = getLocalData('anomalias')||[];
  const total = anomalias.length;
  const reincidentes = anomalias.filter(a=>(a.reincidencia||'').toUpperCase()==='SIM');
  const realizadas = anomalias.filter(a=>(a.status_acao||'').toLowerCase().includes('realiz'));
  const pendentes = anomalias.filter(a=>!(a.status_acao||'').toLowerCase().includes('realiz'));
  const taxaEficacia = total > 0 ? Math.round((realizadas.length/total)*100) : 0;
  const taxaReincid = total > 0 ? Math.round((reincidentes.length/total)*100) : 0;

  // Reincidências por setor
  const reincidPorSetor = {};
  reincidentes.forEach(a => { reincidPorSetor[a.setor] = (reincidPorSetor[a.setor]||0)+1; });

  // Anomalias por tipo
  const porTipo = {};
  anomalias.forEach(a => { porTipo[a.tipo] = (porTipo[a.tipo]||0)+1; });

  document.getElementById('pageContent').innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon azul">📊</div>
        <div class="kpi-info"><h3>${total}</h3><p>Total de Anomalias</p></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon verde">✅</div>
        <div class="kpi-info"><h3>${taxaEficacia}%</h3><p>Taxa de Eficácia</p><small style="color:#22c55e">${realizadas.length} resolvidas</small></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon vermelho">🔁</div>
        <div class="kpi-info"><h3>${reincidentes.length}</h3><p>Reincidências</p><small style="color:#ef4444">${taxaReincid}% do total</small></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon amarelo">⏳</div>
        <div class="kpi-info"><h3>${pendentes.length}</h3><p>Pendentes</p></div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <h3>🔁 Reincidências por Setor</h3>
        <div style="height:220px"><canvas id="chartReincidSetor"></canvas></div>
      </div>
      <div class="chart-card">
        <h3>📊 Anomalias por Tipo</h3>
        <div style="height:220px"><canvas id="chartAnomalTipo"></canvas></div>
      </div>
      <div class="chart-card">
        <h3>📈 Evolução Mensal</h3>
        <div style="height:220px"><canvas id="chartEvolMensal"></canvas></div>
      </div>
      <div class="chart-card">
        <h3>✅ Eficácia das Ações</h3>
        <div style="height:220px"><canvas id="chartEficacia"></canvas></div>
      </div>
    </div>

    ${reincidentes.length > 0 ? `
    <div class="card">
      <div class="card-header">
        <h2>🔁 Anomalias Reincidentes</h2>
        <button class="btn btn-outline btn-sm" onclick="exportCSV(${JSON.stringify(reincidentes).replace(/'/g,"\\'")},'reincidencias')">📥 Exportar</button>
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>#</th><th>Mês</th><th>Setor</th><th>Tipo</th><th>Descrição</th><th>Status</th></tr></thead>
          <tbody>
            ${reincidentes.map(a=>`<tr>
              <td><strong>${a.numero}</strong></td>
              <td>${(a.mes||'').substring(0,3)}</td>
              <td>${a.setor}</td>
              <td>${a.tipo}</td>
              <td style="max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.descricao}</td>
              <td>${getStatusBadge(a.status_acao||'Pendente')}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}
  `;

  setTimeout(() => {
    // Reincidências por setor
    const setores = Object.keys(reincidPorSetor);
    if (setores.length) {
      createBarChart('chartReincidSetor', setores, [{
        label: 'Reincidências', data: setores.map(s=>reincidPorSetor[s]),
        backgroundColor: '#ef4444', borderRadius: 6
      }]);
    }

    // Por tipo
    createDoughnutChart('chartAnomalTipo', Object.keys(porTipo), Object.values(porTipo),
      ['#205587','#245E94','#f59e0b','#ef4444','#22c55e','#8b5cf6']);

    // Evolução mensal
    const mesesOrder = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
    const mesCount = {};
    anomalias.forEach(a => { if(a.mes) mesCount[a.mes]=(mesCount[a.mes]||0)+1; });
    const mesesPresentes = mesesOrder.filter(m=>mesCount[m]);
    createLineChart('chartEvolMensal', mesesPresentes.map(m=>m.substring(0,3)), [{
      label: 'Anomalias', data: mesesPresentes.map(m=>mesCount[m]),
      borderColor: '#205587', backgroundColor: 'rgba(32,85,135,0.1)', fill: true
    }]);

    // Eficácia
    createDoughnutChart('chartEficacia',
      ['Resolvidas','Pendentes'],
      [realizadas.length, pendentes.length],
      ['#22c55e','#f59e0b']);
  }, 100);
}

// ============================================================
// RELATÓRIO DE QUALIDADE
// ============================================================
function renderRelQualidade() {
  const ncs = getLocalData('ncs')||[];
  const recs = getLocalData('reclamacoes')||[];
  const eficazes = ncs.filter(n=>(n.eficaz||'').toLowerCase()==='sim').length;
  const naoEficazes = ncs.filter(n=>(n.eficaz||'').toLowerCase()==='não').length;
  const emAval = ncs.filter(n=>!n.eficaz||n.eficaz==='').length;
  const recProced = recs.filter(r=>(r.procede||'').toUpperCase()==='SIM').length;

  document.getElementById('pageContent').innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon azul">🔴</div>
        <div class="kpi-info"><h3>${ncs.length}</h3><p>Total de NCs</p></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon verde">✅</div>
        <div class="kpi-info"><h3>${eficazes}</h3><p>NCs Eficazes</p></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon vermelho">❌</div>
        <div class="kpi-info"><h3>${naoEficazes}</h3><p>NCs Não Eficazes</p></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon amarelo">⏳</div>
        <div class="kpi-info"><h3>${emAval}</h3><p>Em Avaliação</p></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon laranja">📣</div>
        <div class="kpi-info"><h3>${recs.length}</h3><p>Reclamações</p></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon vermelho">⚠️</div>
        <div class="kpi-info"><h3>${recProced}</h3><p>Procedentes</p></div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <h3>📊 Eficácia das NCs</h3>
        <div style="height:220px"><canvas id="chartEficNCs"></canvas></div>
      </div>
      <div class="chart-card">
        <h3>📣 Reclamações — Procede?</h3>
        <div style="height:220px"><canvas id="chartRecProcede"></canvas></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><h2>🔴 Não Conformidades em Aberto</h2></div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>#</th><th>Data</th><th>Área</th><th>Origem</th><th>Responsável</th><th>Descrição</th><th>Prazo</th><th>Eficácia</th></tr></thead>
          <tbody>
            ${ncs.filter(n=>!n.eficaz||n.eficaz==='').slice(0,20).map((n,i)=>`<tr>
              <td><strong>${n.numero_nc||i+1}</strong></td>
              <td>${n.data_registro}</td>
              <td>${n.area}</td>
              <td style="font-size:12px">${n.origem}</td>
              <td>${n.responsavel}</td>
              <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n.descricao}</td>
              <td>${getPrazoBadge(n.prazo,'')}</td>
              <td><span class="badge badge-amarelo">⏳ Em avaliação</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  setTimeout(() => {
    createDoughnutChart('chartEficNCs',
      ['Eficaz','Não Eficaz','Em Avaliação'],
      [eficazes, naoEficazes, emAval],
      ['#22c55e','#ef4444','#f59e0b']);
    createDoughnutChart('chartRecProcede',
      ['Procedente','Não Procedente'],
      [recProced, recs.length - recProced],
      ['#ef4444','#22c55e']);
  }, 100);
}

// ============================================================
// AVALIAÇÃO DE COORDENADORES
// ============================================================
function renderCoordenadores() {
  const coords = getLocalData('coordenadores')||COORDENADORES;
  const atividades = getLocalData('atividades')||[];
  const plano = getLocalData('plano_acao')||[];

  // Calcular métricas por coordenador
  const metricas = coords.map(c => {
    const nome = c.nome || c;
    const atv = atividades.filter(a => a.coordenador === nome);
    const pa = plano.filter(a => a.responsavel === nome);
    const atvTotal = atv.length;
    const atvRealizadas = atv.filter(a => (a.status||'').toLowerCase().includes('realiz') || (a.status||'').toUpperCase()==='REALIZADO').length;
    const atvPendentes = atv.filter(a => {
      const s = (a.status||'').toLowerCase();
      return !s.includes('realiz') && !s.includes('conclu');
    }).length;
    const paTotal = pa.length;
    const paRealizadas = pa.filter(a => (a.status||'').toLowerCase().includes('realiz')).length;
    const produtividade = atvTotal > 0 ? Math.round((atvRealizadas/atvTotal)*100) : 0;
    const eficaciaPA = paTotal > 0 ? Math.round((paRealizadas/paTotal)*100) : 0;
    return { nome, atvTotal, atvRealizadas, atvPendentes, paTotal, paRealizadas, produtividade, eficaciaPA };
  });

  // Ranking por produtividade
  const ranking = [...metricas].sort((a,b) => b.produtividade - a.produtividade);

  document.getElementById('pageContent').innerHTML = `
    <div class="alert alert-info">ℹ️ Avaliação baseada nos dados das planilhas. Para avaliação completa (modelo Gilmar), preencha as notas manualmente abaixo.</div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:24px">
      ${ranking.map((c,i) => `
        <div class="ranking-card">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
            <div class="ranking-pos pos-${i+1}">${i+1}º</div>
            <div>
              <strong style="font-size:15px">${c.nome}</strong>
              <p style="font-size:12px;color:#64748b">${c.atvTotal} atividades registradas</p>
            </div>
          </div>
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
              <span>Produtividade</span><strong>${c.produtividade}%</strong>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${c.produtividade}%"></div></div>
          </div>
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
              <span>Eficácia Plano de Ação</span><strong>${c.eficaciaPA}%</strong>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${c.eficaciaPA}%;background:linear-gradient(90deg,#22c55e,#16a34a)"></div></div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
            <span class="badge badge-verde">✓ ${c.atvRealizadas} realizadas</span>
            <span class="badge badge-amarelo">⏳ ${c.atvPendentes} pendentes</span>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="card">
      <div class="card-header">
        <h2>📋 Avaliação Detalhada — Modelo Gilmar</h2>
        <button class="btn btn-primary btn-sm" onclick="salvarAvaliacoes()">💾 Salvar Avaliações</button>
      </div>
      <p style="font-size:13px;color:#64748b;margin-bottom:20px">Preencha as notas (0-100) para cada critério conforme avaliação do diretor.</p>
      <div style="overflow-x:auto">
        <table>
          <thead>
            <tr>
              <th>Coordenador</th>
              <th>Pontualidade REPORTs (15%)</th>
              <th>Produtividade (30%)</th>
              <th>Diretrizes (25%)</th>
              <th>Cliente (15%)</th>
              <th>Liderança (10%)</th>
              <th>Qualidade REPORTs (5%)</th>
              <th>Nota Final</th>
            </tr>
          </thead>
          <tbody>
            ${coords.map(c => {
              const nome = c.nome||c;
              const saved = JSON.parse(localStorage.getItem('fibravit_aval_'+nome)||'{}');
              const p1 = saved.p1||0, p2 = saved.p2||0, p3 = saved.p3||0, p4 = saved.p4||0, p5 = saved.p5||0, p6 = saved.p6||0;
              const nota = ((p1*0.15)+(p2*0.30)+(p3*0.25)+(p4*0.15)+(p5*0.10)+(p6*0.05)).toFixed(1);
              return `<tr>
                <td><strong>${nome}</strong></td>
                <td><input type="number" min="0" max="100" value="${p1}" id="aval_${nome}_p1" onchange="calcNota('${nome}')" style="width:70px;padding:6px;border:1.5px solid #e2e8f0;border-radius:6px;text-align:center"></td>
                <td><input type="number" min="0" max="100" value="${p2}" id="aval_${nome}_p2" onchange="calcNota('${nome}')" style="width:70px;padding:6px;border:1.5px solid #e2e8f0;border-radius:6px;text-align:center"></td>
                <td><input type="number" min="0" max="100" value="${p3}" id="aval_${nome}_p3" onchange="calcNota('${nome}')" style="width:70px;padding:6px;border:1.5px solid #e2e8f0;border-radius:6px;text-align:center"></td>
                <td><input type="number" min="0" max="100" value="${p4}" id="aval_${nome}_p4" onchange="calcNota('${nome}')" style="width:70px;padding:6px;border:1.5px solid #e2e8f0;border-radius:6px;text-align:center"></td>
                <td><input type="number" min="0" max="100" value="${p5}" id="aval_${nome}_p5" onchange="calcNota('${nome}')" style="width:70px;padding:6px;border:1.5px solid #e2e8f0;border-radius:6px;text-align:center"></td>
                <td><input type="number" min="0" max="100" value="${p6}" id="aval_${nome}_p6" onchange="calcNota('${nome}')" style="width:70px;padding:6px;border:1.5px solid #e2e8f0;border-radius:6px;text-align:center"></td>
                <td><strong id="nota_${nome}" style="font-size:18px;color:${nota>=80?'#22c55e':nota>=60?'#f59e0b':'#ef4444'}">${nota}</strong></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <h3>📊 Produtividade por Coordenador</h3>
        <div style="height:220px"><canvas id="chartProdCoord"></canvas></div>
      </div>
      <div class="chart-card">
        <h3>📋 Atividades Realizadas vs Pendentes</h3>
        <div style="height:220px"><canvas id="chartAtivCoordComp"></canvas></div>
      </div>
    </div>
  `;

  setTimeout(() => {
    createBarChart('chartProdCoord',
      metricas.map(c=>c.nome),
      [{ label: 'Produtividade %', data: metricas.map(c=>c.produtividade), backgroundColor: '#205587', borderRadius: 6 }]
    );
    createBarChart('chartAtivCoordComp',
      metricas.map(c=>c.nome),
      [
        { label: 'Realizadas', data: metricas.map(c=>c.atvRealizadas), backgroundColor: '#22c55e', borderRadius: 4 },
        { label: 'Pendentes', data: metricas.map(c=>c.atvPendentes), backgroundColor: '#f59e0b', borderRadius: 4 }
      ]
    );
  }, 100);
}

function calcNota(nome) {
  const get = id => parseFloat(document.getElementById(id)?.value||0);
  const p1=get(`aval_${nome}_p1`), p2=get(`aval_${nome}_p2`), p3=get(`aval_${nome}_p3`);
  const p4=get(`aval_${nome}_p4`), p5=get(`aval_${nome}_p5`), p6=get(`aval_${nome}_p6`);
  const nota = ((p1*0.15)+(p2*0.30)+(p3*0.25)+(p4*0.15)+(p5*0.10)+(p6*0.05)).toFixed(1);
  const el = document.getElementById(`nota_${nome}`);
  if (el) {
    el.textContent = nota;
    el.style.color = nota>=80?'#22c55e':nota>=60?'#f59e0b':'#ef4444';
  }
}

function salvarAvaliacoes() {
  const coords = getLocalData('coordenadores')||COORDENADORES;
  coords.forEach(c => {
    const nome = c.nome||c;
    const get = id => parseFloat(document.getElementById(id)?.value||0);
    const data = {
      p1: get(`aval_${nome}_p1`), p2: get(`aval_${nome}_p2`), p3: get(`aval_${nome}_p3`),
      p4: get(`aval_${nome}_p4`), p5: get(`aval_${nome}_p5`), p6: get(`aval_${nome}_p6`)
    };
    localStorage.setItem('fibravit_aval_'+nome, JSON.stringify(data));
  });
  showToast('Avaliações salvas!', 'success');
}

// ============================================================
// CADASTROS
// ============================================================
function renderCadastros() {
  const coords = getLocalData('coordenadores')||COORDENADORES;
  const setores = getLocalData('setores')||SETORES;

  document.getElementById('pageContent').innerHTML = `
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('tabCoords','tabSetores',this)">👥 Coordenadores</button>
      <button class="tab-btn" onclick="switchTab('tabSetores','tabCoords',this)">🏢 Setores</button>
    </div>

    <div id="tabCoords">
      <div style="display:flex;gap:10px;margin-bottom:16px">
        <button class="btn btn-primary" onclick="openModal('modalNovoCoord')">➕ Novo Coordenador</button>
      </div>
      <div class="card">
        <div class="card-header"><h2>👥 Coordenadores Cadastrados</h2></div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Nome</th><th>Área</th><th>Usuário</th><th>Ações</th></tr></thead>
            <tbody>
              ${coords.map((c,i)=>`<tr>
                <td>${i+1}</td>
                <td><strong>${c.nome||c}</strong></td>
                <td>${c.area||'-'}</td>
                <td><span class="badge badge-azul">${(c.nome||c).toLowerCase().split(' ')[0]}</span></td>
                <td>
                  <button class="btn btn-danger btn-sm" onclick="removerCoord(${i})">🗑</button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="tabSetores" style="display:none">
      <div style="display:flex;gap:10px;margin-bottom:16px">
        <button class="btn btn-primary" onclick="openModal('modalNovoSetor')">➕ Novo Setor</button>
      </div>
      <div class="card">
        <div class="card-header"><h2>🏢 Setores Cadastrados</h2></div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;padding:8px">
          ${setores.map((s,i)=>`
            <div style="display:flex;align-items:center;gap:8px;background:#f1f5f9;padding:8px 14px;border-radius:8px">
              <span style="font-size:13px;font-weight:600">${s}</span>
              <button onclick="removerSetor(${i})" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:14px">✕</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- MODAL NOVO COORDENADOR -->
    <div class="modal-overlay" id="modalNovoCoord">
      <div class="modal" style="max-width:480px">
        <div class="modal-header">
          <h3>➕ Novo Coordenador</h3>
          <button class="modal-close" onclick="closeModal('modalNovoCoord')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group full">
              <label>Nome Completo *</label>
              <input type="text" id="coordNome" placeholder="Nome do coordenador">
            </div>
            <div class="form-group full">
              <label>Área de Atuação</label>
              <input type="text" id="coordArea" placeholder="Ex: Operações, Frota...">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('modalNovoCoord')">Cancelar</button>
          <button class="btn btn-primary" onclick="salvarCoord()">💾 Salvar</button>
        </div>
      </div>
    </div>

    <!-- MODAL NOVO SETOR -->
    <div class="modal-overlay" id="modalNovoSetor">
      <div class="modal" style="max-width:400px">
        <div class="modal-header">
          <h3>➕ Novo Setor</h3>
          <button class="modal-close" onclick="closeModal('modalNovoSetor')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nome do Setor *</label>
            <input type="text" id="setorNome" placeholder="Ex: Logística, Qualidade...">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('modalNovoSetor')">Cancelar</button>
          <button class="btn btn-primary" onclick="salvarSetor()">💾 Salvar</button>
        </div>
      </div>
    </div>
  `;
}

function switchTab(show, hide, btn) {
  document.getElementById(show).style.display = 'block';
  document.getElementById(hide).style.display = 'none';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function salvarCoord() {
  const nome = document.getElementById('coordNome').value.trim();
  if (!nome) { showToast('Preencha o nome!','error'); return; }
  const coords = getLocalData('coordenadores')||COORDENADORES;
  coords.push({ id: Date.now(), nome, area: document.getElementById('coordArea').value });
  setLocalData('coordenadores', coords);
  showToast('Coordenador cadastrado!','success');
  closeModal('modalNovoCoord');
  renderCadastros();
}

function removerCoord(idx) {
  if (!confirm('Remover este coordenador?')) return;
  const coords = getLocalData('coordenadores')||COORDENADORES;
  coords.splice(idx, 1);
  setLocalData('coordenadores', coords);
  showToast('Coordenador removido!','success');
  renderCadastros();
}

function salvarSetor() {
  const nome = document.getElementById('setorNome').value.trim();
  if (!nome) { showToast('Preencha o nome do setor!','error'); return; }
  const setores = getLocalData('setores')||SETORES;
  setores.push(nome);
  setLocalData('setores', setores);
  showToast('Setor cadastrado!','success');
  closeModal('modalNovoSetor');
  renderCadastros();
}

function removerSetor(idx) {
  if (!confirm('Remover este setor?')) return;
  const setores = getLocalData('setores')||SETORES;
  setores.splice(idx, 1);
  setLocalData('setores', setores);
  showToast('Setor removido!','success');
  renderCadastros();
}

// ============================================================
// GOOGLE SHEETS / APPS SCRIPT
// ============================================================
function renderGoogleSheets() {
  const savedUrl = localStorage.getItem('fibravit_script_url')||'';

  document.getElementById('pageContent').innerHTML = `
    <div class="sheets-config">
      <h3>🔗 Conectar ao Google Apps Script</h3>
      <p>Cole a URL do Apps Script publicado para sincronizar os dados com o Google Sheets automaticamente.</p>
      <div class="sheets-input">
        <input type="text" id="gsScriptUrl" placeholder="https://script.google.com/macros/s/XXXXXXX/exec" value="${savedUrl}" style="flex:3">
        <button class="btn btn-success" onclick="salvarConfigScript()">✅ Conectar</button>
        <button class="btn btn-outline" style="background:rgba(255,255,255,0.2);color:white;border-color:rgba(255,255,255,0.4)" onclick="testarConexao()">🔍 Testar</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><h2>📋 Passo a Passo — Configuração Completa</h2></div>
      <div style="font-size:13.5px;line-height:1.9;color:#374151">

        <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:14px 18px;border-radius:8px;margin-bottom:20px">
          <strong>✅ Planilha unificada já está pronta!</strong><br>
          Baixe o arquivo <code>Sistema_Fibravit_Unificado.xlsx</code> e importe no Google Sheets.
        </div>

        <p><strong>📌 PASSO 1 — Importar a planilha no Google Sheets:</strong></p>
        <ol style="margin-left:20px;margin-bottom:16px">
          <li>Acesse <a href="https://sheets.google.com" target="_blank" style="color:#205587">sheets.google.com</a></li>
          <li>Clique em <strong>+ Nova planilha</strong></li>
          <li>Vá em <strong>Arquivo → Importar → Fazer upload</strong></li>
          <li>Selecione o arquivo <code>Sistema_Fibravit_Unificado.xlsx</code></li>
          <li>Escolha <strong>"Substituir planilha"</strong> e clique em Importar</li>
          <li>Renomeie a planilha para <strong>"Sistema Fibravit"</strong></li>
        </ol>

        <p><strong>📌 PASSO 2 — Adicionar o Apps Script:</strong></p>
        <ol style="margin-left:20px;margin-bottom:16px">
          <li>Na planilha, clique em <strong>Extensões → Apps Script</strong></li>
          <li>Apague todo o código existente</li>
          <li>Cole o conteúdo do arquivo <code>codigo.gs</code> (incluído no ZIP)</li>
          <li>Clique em <strong>💾 Salvar</strong> (Ctrl+S)</li>
          <li>Clique em <strong>▶ Executar → testarScript</strong> para verificar</li>
          <li>Autorize as permissões quando solicitado</li>
        </ol>

        <p><strong>📌 PASSO 3 — Publicar o Apps Script:</strong></p>
        <ol style="margin-left:20px;margin-bottom:16px">
          <li>Clique em <strong>Implantar → Nova implantação</strong></li>
          <li>Tipo: <strong>Aplicativo da Web</strong></li>
          <li>Executar como: <strong>Eu (seu e-mail)</strong></li>
          <li>Quem tem acesso: <strong>Qualquer pessoa</strong></li>
          <li>Clique em <strong>Implantar</strong></li>
          <li>Copie a <strong>URL do aplicativo da web</strong></li>
        </ol>

        <p><strong>📌 PASSO 4 — Conectar ao sistema:</strong></p>
        <ol style="margin-left:20px;margin-bottom:16px">
          <li>Cole a URL copiada no campo acima</li>
          <li>Clique em <strong>✅ Conectar</strong></li>
          <li>Clique em <strong>🔍 Testar</strong> para verificar a conexão</li>
        </ol>

        <p><strong>📌 PASSO 5 — Publicar no GitHub Pages:</strong></p>
        <ol style="margin-left:20px;margin-bottom:16px">
          <li>Crie um repositório no GitHub (ex: <code>fibravit-sgq</code>)</li>
          <li>Faça upload de todos os arquivos do sistema</li>
          <li>Vá em <strong>Settings → Pages → Branch: main → /root</strong></li>
          <li>O sistema ficará disponível em: <code>https://seuusuario.github.io/fibravit-sgq</code></li>
        </ol>

        <div class="alert alert-info" style="margin-top:16px">
          💡 <strong>Dica:</strong> Após qualquer alteração no Apps Script, clique em <strong>Implantar → Gerenciar implantações → Editar → Nova versão</strong> para atualizar.
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><h2>📊 Estrutura da Planilha Unificada</h2></div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Aba</th><th>Origem</th><th>Registros</th><th>Módulo</th></tr></thead>
          <tbody>
            <tr><td><code>Anomalias</code></td><td>FOR-QUA-016</td><td>37</td><td>⚠️ Anomalias</td></tr>
            <tr><td><code>Nao_Conformidades</code></td><td>FOR-QUA-009 (NCs)</td><td>0</td><td>🔴 Não Conformidades</td></tr>
            <tr><td><code>Reclamacoes</code></td><td>FOR-QUA-009 (Reclamações)</td><td>1</td><td>📣 Reclamações</td></tr>
            <tr><td><code>Plano_de_Acao</code></td><td>Plano de Ação Empresarial</td><td>131</td><td>📋 Plano de Ação</td></tr>
            <tr><td><code>Atividades</code></td><td>Entregas dos Coordenadores</td><td>64</td><td>✅ Atividades</td></tr>
            <tr><td><code>Coordenadores</code></td><td>Cadastro</td><td>4</td><td>⚙️ Cadastros</td></tr>
            <tr><td><code>Setores</code></td><td>Cadastro</td><td>13</td><td>⚙️ Cadastros</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div id="testeResultado"></div>
  `;
}

function salvarConfigScript() {
  const url = document.getElementById('gsScriptUrl').value.trim();
  if (!url || !url.includes('script.google.com')) {
    showToast('Cole uma URL válida do Apps Script!','error'); return;
  }
  localStorage.setItem('fibravit_script_url', url);
  APPS_SCRIPT_URL = url;
  showToast('URL salva! Testando conexão...','success');
  updateScriptBadge();
  testarConexao();
}

async function testarConexao() {
  const url = localStorage.getItem('fibravit_script_url');
  if (!url) { showToast('Configure a URL do Apps Script primeiro!','warning'); return; }
  const el = document.getElementById('testeResultado');
  if (el) el.innerHTML = '<div class="alert alert-info">🔄 Testando conexão...</div>';
  try {
    const res = await fetch(`${url}?action=stats`);
    const data = await res.json();
    if (data.status === 'ok') {
      const s = data.stats;
      if (el) el.innerHTML = `
        <div class="alert alert-success">✅ Conexão estabelecida com sucesso!</div>
        <div class="card">
          <div class="card-header"><h2>📊 Dados no Google Sheets</h2></div>
          <div class="kpi-grid" style="margin:0">
            ${Object.entries(s).map(([k,v])=>`
              <div class="kpi-card">
                <div class="kpi-icon azul">📋</div>
                <div class="kpi-info"><h3>${v}</h3><p>${k}</p></div>
              </div>`).join('')}
          </div>
        </div>`;
      showToast('✅ Conectado ao Google Sheets!','success');
      updateScriptBadge();
      clearCache();
    } else {
      if (el) el.innerHTML = `<div class="alert alert-danger">❌ Erro: ${data.message}</div>`;
      showToast('Erro na conexão: ' + data.message,'error');
    }
  } catch(e) {
    if (el) el.innerHTML = `<div class="alert alert-danger">❌ Erro de conexão: ${e.message}<br><small>Verifique se o Apps Script está publicado como "Qualquer pessoa".</small></div>`;
    showToast('Erro de conexão','error');
  }
}