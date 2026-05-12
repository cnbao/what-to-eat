import { getAISettings, setAISettings, getPrompts, setPrompts, getDefaultPrompts, getPrefixes, setPrefixes, getDefaultPrefixes, getFoods, getFavorites, setFavorites, getFoodsGroupByCategory, getTagCategory } from './storage.js';
import { getProviderList } from './ai-service.js';
import { simpleChat } from './ai-service.js';

function extractJSON(text) {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

// AI Settings
export function renderAISettings(container) {
  const settings = getAISettings();
  const providers = getProviderList();

  container.innerHTML = `
    <h3 class="settings-section-title">AI 接口设置</h3>
    <div class="provider-tabs">
      ${providers.map(p => `
        <button class="provider-tab ${settings.provider === p.key ? 'active' : ''}" data-provider="${p.key}">${p.name}</button>
      `).join('')}
    </div>
    <div class="provider-config">
      <div class="setting-row">
        <label>API Key</label>
        <input id="inputApiKey" type="password" placeholder="${providers.find(p => p.key === settings.provider)?.keyPlaceholder || ''}" value="${settings.apiKeys[settings.provider] || ''}" />
      </div>
      <div class="setting-row ${settings.provider !== 'custom' ? 'hidden' : ''}" id="customEndpointRow">
        <label>端点 URL</label>
        <input id="inputCustomEndpoint" type="text" placeholder="https://..." value="${settings.customEndpoint || ''}" />
      </div>
      <div class="setting-row ${settings.provider !== 'custom' ? 'hidden' : ''}" id="customModelRow">
        <label>模型名</label>
        <input id="inputCustomModel" type="text" placeholder="model-name" value="${settings.customModel || ''}" />
      </div>
      <button id="btnSaveAI" class="btn-primary">保存设置</button>
    </div>
  `;

  const providerTabs = container.querySelectorAll('.provider-tab');
  const apiKeyInput = container.querySelector('#inputApiKey');
  const endpointRow = container.querySelector('#customEndpointRow');
  const modelRow = container.querySelector('#customModelRow');
  const endpointInput = container.querySelector('#inputCustomEndpoint');
  const modelInput = container.querySelector('#inputCustomModel');

  providerTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      providerTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const provider = tab.dataset.provider;
      const p = providers.find(pr => pr.key === provider);
      apiKeyInput.placeholder = p?.keyPlaceholder || '';
      apiKeyInput.value = getAISettings().apiKeys[provider] || '';
      endpointRow.classList.toggle('hidden', provider !== 'custom');
      modelRow.classList.toggle('hidden', provider !== 'custom');
    });
  });

  container.querySelector('#btnSaveAI').addEventListener('click', () => {
    const activeProvider = container.querySelector('.provider-tab.active')?.dataset.provider;
    if (!activeProvider) return;
    const s = getAISettings();
    s.provider = activeProvider;
    if (!s.apiKeys) s.apiKeys = {};
    s.apiKeys[activeProvider] = apiKeyInput.value.trim();
    s.customEndpoint = endpointInput.value.trim();
    s.customModel = modelInput.value.trim();
    setAISettings(s);
    showToast('AI 设置已保存');
  });
}

// Prompt Editor
export function renderPromptEditor(container) {
  const prompts = getPrompts();
  const defaults = getDefaultPrompts();

  const promptList = [
    { key: 'achievementPrompt', label: '吃饭成就 Prompt' },
    { key: 'healthPrompt', label: '热量估算+健康建议 Prompt' },
    { key: 'tagPrompt', label: '食物打标签 Prompt' },
    { key: 'prefixPrompt', label: '趣味前缀生成 Prompt' },
    { key: 'pairingPrompt', label: '搭配提示 Prompt' },
  ];

  container.innerHTML = `
    <h3 class="settings-section-title">Prompt 管理</h3>
    <div class="prompt-tabs">
      ${promptList.map((p, i) => `
        <button class="prompt-tab ${i === 0 ? 'active' : ''}" data-key="${p.key}">${p.label}</button>
      `).join('')}
    </div>
    <div class="prompt-editor">
      <textarea id="promptTextarea" rows="10">${prompts[promptList[0].key]}</textarea>
      <div class="prompt-actions">
        <button id="btnResetPrompt" class="btn-small">恢复默认</button>
        <button id="btnSavePrompt" class="btn-primary">保存</button>
      </div>
    </div>
  `;

  const textarea = container.querySelector('#promptTextarea');
  const promptTabs = container.querySelectorAll('.prompt-tab');
  let currentKey = promptList[0].key;

  promptTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Auto-save current
      const p = getPrompts();
      p[currentKey] = textarea.value;
      setPrompts(p);

      promptTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentKey = tab.dataset.key;
      textarea.value = getPrompts()[currentKey];
    });
  });

  container.querySelector('#btnResetPrompt').addEventListener('click', () => {
    textarea.value = defaults[currentKey];
  });

  container.querySelector('#btnSavePrompt').addEventListener('click', () => {
    const p = getPrompts();
    p[currentKey] = textarea.value;
    setPrompts(p);
    showToast('Prompt 已保存');
  });
}

// Prefix Manager
export function renderPrefixManager(container) {
  const prefixes = getPrefixes();

  container.innerHTML = `
    <h3 class="settings-section-title">趣味前缀管理</h3>
    <div class="prefix-add-row">
      <input id="inputNewPrefix" type="text" placeholder="添加前缀..." maxlength="10" />
      <button id="btnAddPrefix" class="btn-small">添加</button>
    </div>
    <div class="prefix-actions">
      <button id="btnAIGenPrefix" class="btn-tag-all">🤖 AI 批量刷新前缀</button>
      <button id="btnResetPrefix" class="btn-small">恢复默认</button>
    </div>
    <div id="prefixList" class="prefix-list"></div>
  `;

  const listEl = container.querySelector('#prefixList');
  const inputEl = container.querySelector('#inputNewPrefix');

  function renderList() {
    const current = getPrefixes();
    listEl.innerHTML = current.map((p, i) => `
      <span class="prefix-chip">${p}<button class="prefix-delete" data-index="${i}">✕</button></span>
    `).join('');

    listEl.querySelectorAll('.prefix-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const arr = getPrefixes();
        arr.splice(idx, 1);
        setPrefixes(arr);
        renderList();
      });
    });
  }

  renderList();

  container.querySelector('#btnAddPrefix').addEventListener('click', () => {
    const val = inputEl.value.trim();
    if (!val) return;
    const arr = getPrefixes();
    arr.push(val);
    setPrefixes(arr);
    inputEl.value = '';
    renderList();
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') container.querySelector('#btnAddPrefix').click();
  });

  container.querySelector('#btnResetPrefix').addEventListener('click', () => {
    setPrefixes(getDefaultPrefixes());
    renderList();
    showToast('已恢复默认前缀');
  });

  container.querySelector('#btnAIGenPrefix').addEventListener('click', async () => {
    const btn = container.querySelector('#btnAIGenPrefix');
    btn.disabled = true;
    btn.textContent = '🤖 AI 生成中...';
    try {
      const prompts = getPrompts();
      const result = await simpleChat(prompts.prefixPrompt, prompts.prefixPrompt, 0.9);
      const parsed = extractJSON(result);
      if (parsed && Array.isArray(parsed)) {
        setPrefixes(parsed);
        renderList();
        showToast(`已生成 ${parsed.length} 个新前缀`);
      } else {
        throw new Error('返回格式错误');
      }
    } catch (e) {
      alert('AI 生成前缀失败：' + e.message);
    }
    btn.disabled = false;
    btn.textContent = '🤖 AI 批量刷新前缀';
  });
}

// Favorite Selector (dedicated tab content)
export function renderFavoriteSelector(container, onRebuildSlot) {
  const favorites = getFavorites();
  const groups = getFoodsGroupByCategory();

  // Count how many times each food is in favorites
  const favCount = {};
  favorites.forEach(f => { favCount[f] = (favCount[f] || 0) + 1; });

  container.innerHTML = `
    <h3 class="fav-title">选择你最爱的食物（最多3个，可重复）</h3>
    <div class="fav-selected">
      <span>已选：</span>
      ${[0,1,2].map(i => `<span class="fav-slot" data-slot="${i}">${favorites[i] || '未选择'}</span>`).join('')}
    </div>
    <p class="fav-hint">偏好相同食物会增加选中概率，同类食物也会有一定概率漂移选中</p>
    <div class="fav-groups">
      ${Object.entries(groups).map(([cat, foods]) => `
        <div class="fav-group">
          <h4 class="fav-group-title">${cat}</h4>
          <div class="fav-grid">
            ${foods.map(f => {
              const count = favCount[f.name] || 0;
              const isSelected = count > 0;
              return `<button class="fav-tile ${isSelected ? 'selected' : ''}" data-name="${f.name}" data-count="${count}">${f.name}${count > 0 ? `<span class="fav-badge">×${count}</span>` : ''}</button>`;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.fav-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const name = tile.dataset.name;
      let favs = getFavorites();

      if (favs.includes(name)) {
        // Remove one instance
        const idx = favs.indexOf(name);
        favs.splice(idx, 1);
      } else if (favs.length < 3) {
        favs.push(name);
      } else {
        showToast('最多选3个哦！');
        return;
      }

      setFavorites(favs);
      renderFavoriteSelector(container, onRebuildSlot);
      if (onRebuildSlot) onRebuildSlot();
    });
  });
}

// Toast helper
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
export { showToast };
