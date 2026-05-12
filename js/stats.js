import { getRecords, getFoods, getTagCategory } from './storage.js';

const CATEGORY_COLORS = {
  '面食': '#FF6B6B',
  '粉类': '#EE5A24',
  '米饭': '#FFD93D',
  '粥品': '#6BCB77',
  '小吃': '#4ECDC4',
  '快餐': '#45B7D1',
  '其他': '#96CEB4',
  '甜品': '#DDA0DD',
};

function aggregateFood(records) {
  const countMap = {};
  records.forEach(r => { countMap[r.food] = (countMap[r.food] || 0) + 1; });
  return Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .map(([food, count]) => ({ food, count }));
}

function aggregateByTag(records) {
  const foods = getFoods();
  const foodTagMap = {};
  foods.forEach(f => { foodTagMap[f.name] = f.tag; });

  const countMap = {};
  records.forEach(r => {
    const tag = foodTagMap[r.food] || '其他';
    countMap[tag] = (countMap[tag] || 0) + 1;
  });
  return Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
}

export function renderStats(container, days = 7) {
  const records = getRecords(days);
  const foods = getFoods();
  const foodTagMap = {};
  foods.forEach(f => { foodTagMap[f.name] = f.tag; });

  if (records.length === 0) {
    container.innerHTML = `
      <div class="stats-empty">
        <p>还没有记录，快去选今天吃什么吧！</p>
      </div>
    `;
    return;
  }

  const aggregated = aggregateFood(records);
  const maxCount = aggregated[0]?.count || 1;
  const byTag = aggregateByTag(records);

  // Group records by date for calendar
  const byDate = {};
  records.forEach(r => {
    if (!byDate[r.date]) byDate[r.date] = [];
    byDate[r.date].push(r.food);
  });
  const dates = Object.keys(byDate).sort().reverse();

  container.innerHTML = `
    <div class="stats-header">
      <div class="stats-tabs">
        <button class="stats-tab ${days === 7 ? 'active' : ''}" data-days="7">最近一周</button>
        <button class="stats-tab ${days === 30 ? 'active' : ''}" data-days="30">最近一月</button>
      </div>
      <span class="stats-total">共 ${records.length} 条记录</span>
    </div>

    <h3 class="stats-section-title">食物排行</h3>
    <div class="stats-chart">
      ${aggregated.slice(0, 15).map(item => {
        const tag = foodTagMap[item.food] || '其他';
        const cat = getTagCategory(tag);
        const color = CATEGORY_COLORS[cat] || '#96CEB4';
        const pct = (item.count / maxCount * 100).toFixed(0);
        return `
          <div class="stats-bar-row">
            <span class="stats-bar-label">${item.food}</span>
            <div class="stats-bar-track">
              <div class="stats-bar-fill" style="width:${pct}%;background:${color};" data-width="${pct}"></div>
            </div>
            <span class="stats-bar-count">${item.count}次</span>
          </div>
        `;
      }).join('')}
    </div>

    <h3 class="stats-section-title">分类占比</h3>
    <div class="stats-tag-summary">
      ${byTag.map(item => {
        const cat = getTagCategory(item.tag);
        const color = CATEGORY_COLORS[cat] || '#96CEB4';
        return `<span class="stats-tag-chip" style="background:${color}20;color:${color};border:1px solid ${color}">${item.tag} ${item.count}</span>`;
      }).join('')}
    </div>

    <h3 class="stats-section-title">每日记录</h3>
    <div class="stats-calendar">
      ${dates.map(date => {
        const dayNames = ['日','一','二','三','四','五','六'];
        const d = new Date(date);
        const dayName = dayNames[d.getDay()];
        return `
          <div class="stats-date-row">
            <span class="stats-date">${date} 周${dayName}</span>
            <span class="stats-date-foods">${byDate[date].join('、')}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Animate bars on next frame
  requestAnimationFrame(() => {
    container.querySelectorAll('.stats-bar-fill').forEach(el => {
      const w = el.dataset.width;
      el.style.width = '0%';
      requestAnimationFrame(() => { el.style.width = w + '%'; });
    });
  });

  // Tab switching
  container.querySelectorAll('.stats-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      renderStats(container, parseInt(btn.dataset.days));
    });
  });
}
