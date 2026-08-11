# 🏢 Grupo Fibravit — Sistema de Gestão de Qualidade

Sistema web completo para gestão de qualidade, anomalias, não conformidades, reclamações e plano de ação.

---

## 🚀 Como publicar no GitHub Pages

### 1. Criar repositório
1. Acesse [github.com](https://github.com) e faça login
2. Clique em **New repository**
3. Nome: `fibravit-sgq` (ou outro de sua preferência)
4. Marque como **Public**
5. Clique em **Create repository**

### 2. Fazer upload dos arquivos
1. Clique em **uploading an existing file**
2. Arraste todos os arquivos e pastas do sistema:
   - `index.html`
   - `css/` (pasta)
   - `js/` (pasta)
   - `README.md`
3. Clique em **Commit changes**

### 3. Ativar GitHub Pages
1. Vá em **Settings → Pages**
2. Em **Source**, selecione: `Deploy from a branch`
3. Branch: `main` | Folder: `/ (root)`
4. Clique em **Save**
5. Aguarde 1-2 minutos
6. O sistema estará disponível em: `https://SEU_USUARIO.github.io/fibravit-sgq`

---

## 🔗 Configurar Google Sheets + Apps Script

### 1. Importar planilha unificada
1. Acesse [sheets.google.com](https://sheets.google.com)
2. Crie uma nova planilha
3. **Arquivo → Importar → Fazer upload**
4. Selecione `Sistema_Fibravit_Unificado.xlsx`
5. Escolha **"Substituir planilha"**
6. Renomeie para **"Sistema Fibravit"**

### 2. Adicionar o Apps Script
1. Na planilha: **Extensões → Apps Script**
2. Apague o código existente
3. Cole o conteúdo de `codigo.gs`
4. Salve (Ctrl+S)
5. Execute `testarScript` para verificar

### 3. Publicar o Apps Script
1. **Implantar → Nova implantação**
2. Tipo: **Aplicativo da Web**
3. Executar como: **Eu**
4. Quem tem acesso: **Qualquer pessoa**
5. Clique em **Implantar**
6. Copie a **URL gerada**

### 4. Conectar ao sistema
1. Abra o sistema no GitHub Pages
2. Faça login
3. Vá em **🔗 Google Sheets** no menu lateral
4. Cole a URL do Apps Script
5. Clique em **✅ Conectar**

---

## 🔐 Usuários e Senhas

| Usuário | Senha | Perfil |
|---------|-------|--------|
| `admin` | `fibravit2026` | Administrador |
| `jose` | `jose2026` | José Afonso |
| `jhully` | `jhully2026` | Jhully |
| `davi` | `davi2026` | Davi |
| `gabriel` | `gabriel2026` | Gabriel |
| `gilmar` | `diretor2026` | Gilmar (Diretor) |

---

## 📋 Módulos do Sistema

| Módulo | Descrição |
|--------|-----------|
| 📊 Dashboard | KPIs e gráficos em tempo real |
| ⚠️ Anomalias | Registro, filtros e relatório de reincidências |
| 🔴 Não Conformidades | Registro e controle de eficácia |
| 📣 Reclamações | Registro e análise de procedência |
| 📋 Plano de Ação | Acompanhamento com alertas de vencimento |
| ✅ Atividades | Entregas por coordenador |
| 📈 Rel. Anomalias | Análise de reincidências e eficácia |
| 📉 Rel. Qualidade | NCs e reclamações consolidadas |
| 👥 Avaliação Coordenadores | Modelo Gilmar com notas ponderadas |
| ⚙️ Cadastros | Coordenadores e setores |
| 🔗 Google Sheets | Configuração da integração |

---

## 🏗️ Arquitetura

```
GitHub Pages (index.html)
        ↓
Google Apps Script (codigo.gs) — API intermediária
        ↓
Google Sheets (Sistema_Fibravit_Unificado.xlsx)
├── Anomalias
├── Nao_Conformidades
├── Reclamacoes
├── Plano_de_Acao
├── Atividades
├── Coordenadores
└── Setores
```

---

## 📁 Estrutura de Arquivos

```
fibravit-sgq/
├── index.html              ← Sistema principal + Login
├── README.md               ← Este arquivo
├── css/
│   └── style.css           ← Estilos (paleta Fibravit)
└── js/
    ├── dados.js            ← Dados iniciais das planilhas
    ├── app.js              ← Funções globais + API Apps Script
    └── pages.js            ← Todas as páginas e formulários
```

---

## 📞 Suporte

Sistema desenvolvido para o **Grupo Fibravit** — 2026