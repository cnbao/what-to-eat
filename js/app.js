import { SlotMachine } from './slot-machine.js';
import { getFoods, getRecords, getPrompts, getAchievements, addAchievements, addRecord, hasAPIKey, getFavorites } from './storage.js';
import { simpleChat } from './ai-service.js';
import { renderStats } from './stats.js';
import { renderFoodManager } from './food-manager.js';
import { renderAISettings, renderPromptEditor, renderPrefixManager, renderFavoriteSelector, showToast } from './settings.js';

function extractJSON(text) {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

function formatRecordsForAI(records) {
  const byDate = {};
  records.forEach(r => {
    if (!byDate[r.date]) byDate[r.date] = [];
    byDate[r.date].push(r.food);
  });
  return Object.entries(byDate).sort().map(([date, foods]) => {
    const weekDay = ['日','一','二','三','四','五','六'][new Date(date).getDay()];
    return `${date}(周${weekDay}): ${foods.join('、')}`;
  }).join('\n');
}

function renderRecentAchievements(container) {
  const achs = getAchievements();
  const recent = achs.slice(-3).reverse();
  if (recent.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);font-size:13px;">还没有成就，快去吃饭吧！</p>';
    return;
  }
  container.innerHTML = recent.map(a => `
    <div class="achievement-card">
      <span class="achievement-name">${a.name}</span>
      <span class="rarity-badge rarity-${a.rarity}">${a.rarity}</span>
      <div class="achievement-condition">${a.condition}</div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  // Tab navigation
  const tabs = document.querySelectorAll('.tab');
  const views = document.querySelectorAll('.view');

  function switchView(viewName) {
    views.forEach(v => v.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');
    document.querySelector(`.tab[data-view="${viewName}"]`).classList.add('active');

    // Lazy render on switch
    if (viewName === 'stats') {
      renderStats(document.getElementById('statsContent'));
    } else if (viewName === 'favorites') {
      renderFavoriteSelector(document.getElementById('favContent'), () => slot.rebuild());
    } else if (viewName === 'settings') {
      renderAISettings(document.getElementById('settingsAI'));
      renderFoodManager(document.getElementById('settingsFood'), () => slot.rebuild());
      renderPromptEditor(document.getElementById('settingsPrompts'));
      renderPrefixManager(document.getElementById('settingsPrefixes'));
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });

  // Slot Machine
  const slot = new SlotMachine(
    document.getElementById('slotStrip'),
    document.querySelector('.slot-indicator')
  );

  const btnSpin = document.getElementById('btnSpin');
  const resultBanner = document.getElementById('resultBanner');
  const resultFood = document.getElementById('resultFood');
  const pairingArea = document.getElementById('pairingArea');
  let selectedPairing = null;

  btnSpin.addEventListener('click', async () => {
    btnSpin.disabled = true;
    btnSpin.classList.add('spinning');
    resultBanner.classList.remove('show');
    resultBanner.classList.add('hidden');
    pairingArea.classList.add('hidden');
    selectedPairing = null;

    const chosen = await slot.spin();

    // Show result
    resultFood.textContent = chosen;
    resultBanner.classList.remove('hidden');
    requestAnimationFrame(() => resultBanner.classList.add('show'));
    btnSpin.disabled = false;
    btnSpin.classList.remove('spinning');
  });

  slot.onPairing = (food, pairings) => {
    if (!pairings || pairings.length === 0) return;
    pairingArea.classList.remove('hidden');
    pairingArea.innerHTML = `
      <div class="pairing-title">建议搭配：</div>
      ${pairings.map((p, i) => `
        <span class="pairing-option" data-index="${i}" data-name="${p.pairing}">
          ${p.pairing}<span class="pairing-cal">(+${p.calories}千卡)</span>
        </span>
      `).join('')}
    `;

    pairingArea.querySelectorAll('.pairing-option').forEach(opt => {
      opt.addEventListener('click', () => {
        if (opt.classList.contains('selected')) {
          opt.classList.remove('selected');
          selectedPairing = null;
        } else {
          pairingArea.querySelectorAll('.pairing-option').forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          selectedPairing = opt.dataset.name;
          // Update the record to include pairing
          const records = JSON.parse(localStorage.getItem('wte_records') || '[]');
          if (records.length > 0) {
            const last = records[records.length - 1];
            if (last.food === food) {
              last.food = `${food}+${selectedPairing}`;
              localStorage.setItem('wte_records', JSON.stringify(records));
            }
          }
          showToast(`已搭配：${food}+${selectedPairing}`);
        }
      });
    });
  };

  // Recent achievements on home
  renderRecentAchievements(document.getElementById('recentAchievements'));

  // Unlock achievement button on home
  document.getElementById('btnUnlockAchievement').addEventListener('click', async () => {
    if (!hasAPIKey()) { showToast('请先在设置中配置 API Key'); return; }
    const records = getRecords(7);
    if (records.length === 0) { showToast('还没有饮食记录哦'); return; }

    const btn = document.getElementById('btnUnlockAchievement');
    btn.disabled = true;
    btn.textContent = '正在解锁...';

    try {
      const prompts = getPrompts();
      const recordsText = formatRecordsForAI(records);
      const userPrompt = prompts.achievementPrompt.replace('{records}', recordsText);
      const result = await simpleChat(prompts.achievementPrompt, userPrompt, 0.9);
      const parsed = extractJSON(result);

      if (parsed && Array.isArray(parsed)) {
        const achievements = parsed.map(a => ({
          name: a.name || a.成就名 || '未知成就',
          condition: a.condition || a.解锁条件 || '',
          rarity: a.rarity || a.稀有度 || '普通',
        }));
        addAchievements(achievements);
        renderRecentAchievements(document.getElementById('recentAchievements'));
        showToast(`解锁了 ${achievements.length} 个成就！`);
      } else {
        showToast('AI 返回格式有误，再试一次吧');
      }
    } catch (e) {
      showToast('解锁失败：' + e.message);
    }

    btn.disabled = false;
    btn.textContent = '解锁新成就';
  });

  // AI Tab buttons
  document.getElementById('btnAchievement').addEventListener('click', async () => {
    if (!hasAPIKey()) { showToast('请先在设置中配置 API Key'); return; }
    const records = getRecords(7);
    if (records.length === 0) { showToast('还没有饮食记录哦'); return; }

    const btn = document.getElementById('btnAchievement');
    const resultEl = document.getElementById('achievementResult');
    btn.disabled = true;
    resultEl.className = 'ai-result loading';
    resultEl.textContent = '正在生成成就...';

    try {
      const prompts = getPrompts();
      const recordsText = formatRecordsForAI(records);
      const userPrompt = prompts.achievementPrompt.replace('{records}', recordsText);
      const result = await simpleChat(prompts.achievementPrompt, userPrompt, 0.9);

      // Try parse and save achievements
      const parsed = extractJSON(result);
      if (parsed && Array.isArray(parsed)) {
        const achievements = parsed.map(a => ({
          name: a.name || a.成就名 || '未知成就',
          condition: a.condition || a.解锁条件 || '',
          rarity: a.rarity || a.稀有度 || '普通',
        }));
        addAchievements(achievements);
        renderRecentAchievements(document.getElementById('recentAchievements'));
      }

      resultEl.className = 'ai-result';
      resultEl.textContent = result;
    } catch (e) {
      resultEl.className = 'ai-result';
      resultEl.textContent = '生成失败：' + e.message;
    }
    btn.disabled = false;
  });

  document.getElementById('btnHealth').addEventListener('click', async () => {
    if (!hasAPIKey()) { showToast('请先在设置中配置 API Key'); return; }
    const records = getRecords(7);
    if (records.length === 0) { showToast('还没有饮食记录哦'); return; }

    const btn = document.getElementById('btnHealth');
    const resultEl = document.getElementById('healthResult');
    btn.disabled = true;
    resultEl.className = 'ai-result loading';
    resultEl.textContent = '正在分析...';

    try {
      const prompts = getPrompts();
      const recordsText = formatRecordsForAI(records);
      const userPrompt = prompts.healthPrompt.replace('{records}', recordsText);
      const result = await simpleChat(prompts.healthPrompt, userPrompt, 0.7);
      resultEl.className = 'ai-result';
      resultEl.textContent = result;
    } catch (e) {
      resultEl.className = 'ai-result';
      resultEl.textContent = '分析失败：' + e.message;
    }
    btn.disabled = false;
  });
});
