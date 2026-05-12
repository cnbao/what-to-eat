import { getFoods, getFavorites, getPrefixes, getTagCategory, getTagFlavor, addRecord, getPairings, setPairing, hasAPIKey, getPrompts } from './storage.js';
import { simpleChat } from './ai-service.js';

const ITEM_HEIGHT = 80;
const VISIBLE_ITEMS = 3;
const REPEAT_COUNT = 15;
const SPIN_DURATION = 4000;

function weightedRandom(foods, favorites) {
  if (!favorites || favorites.length === 0) {
    return foods[Math.floor(Math.random() * foods.length)];
  }

  // Count frequencies
  const freq = {};
  favorites.forEach(f => { freq[f] = (freq[f] || 0) + 1; });
  const uniqueFavs = Object.keys(freq);
  const totalSlots = favorites.length; // always 3

  // Build weight for each food
  const weights = foods.map(food => {
    let w = 0;
    const foodCat = getTagCategory(food.tag);
    const foodFlavor = getTagFlavor(food.tag);

    Object.entries(freq).forEach(([favName, count]) => {
      const favFood = foods.find(f => f.name === favName);
      if (!favFood) return;
      const favCat = getTagCategory(favFood.tag);
      const favFlavor = getTagFlavor(favFood.tag);
      const ratio = count / totalSlots;

      if (food.name === favName) {
        // Scenario A: all same → 60%, B: 2 same → 40%, etc.
        if (uniqueFavs.length === 1) w += 0.6;
        else w += ratio * 0.6;
      } else if (foodCat === favCat && favCat !== '其他') {
        // Same category drift
        w += ratio * 0.2;
      } else if (foodFlavor === favFlavor && favFlavor !== '咸香') {
        // Same flavor drift (fallback)
        w += ratio * 0.1;
      }
    });

    return w;
  });

  // Add base "other" weight
  const hasAnyWeight = weights.some(w => w > 0);
  const otherWeight = hasAnyWeight ? 0.2 / Math.max(1, foods.length) : 1 / foods.length;
  const finalWeights = weights.map(w => w + (w === 0 ? otherWeight : w * 0.05));

  // Normalize
  const total = finalWeights.reduce((a, b) => a + b, 0);
  const normalized = finalWeights.map(w => w / total);

  // Weighted random selection
  let rand = Math.random();
  for (let i = 0; i < foods.length; i++) {
    rand -= normalized[i];
    if (rand <= 0) return foods[i];
  }
  return foods[foods.length - 1];
}

function buildDisplayItems(foods) {
  const prefixes = getPrefixes();
  const displayItems = [];

  if (foods.length >= 15) {
    foods.forEach(food => {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      displayItems.push({ displayName: `${prefix}${food.name}`, originalName: food.name });
    });
  } else {
    // Fill to at least 15 items with different prefixes
    while (displayItems.length < 18) {
      foods.forEach(food => {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        displayItems.push({ displayName: `${prefix}${food.name}`, originalName: food.name });
      });
    }
  }
  return displayItems.slice(0, Math.max(displayItems.length, 18));
}

function extractJSON(text) {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

async function fetchPairing(food) {
  const cache = getPairings();
  if (cache[food]) return cache[food];
  if (!hasAPIKey()) return null;

  try {
    const prompts = getPrompts();
    const userPrompt = prompts.pairingPrompt.replace('{food}', food);
    const result = await simpleChat(prompts.pairingPrompt, userPrompt, 0.5);
    const parsed = extractJSON(result);
    if (parsed && Array.isArray(parsed)) {
      setPairing(food, parsed);
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to fetch pairing:', e);
  }
  return null;
}

export class SlotMachine {
  constructor(stripEl, indicatorEl) {
    this.strip = stripEl;
    this.indicator = indicatorEl;
    this.isSpinning = false;
    this.onResult = null;
    this.onPairing = null;
    this.displayItems = [];
    this.rebuild();
  }

  rebuild() {
    const foods = getFoods();
    this.displayItems = buildDisplayItems(foods);
    const repeated = [];
    for (let i = 0; i < REPEAT_COUNT; i++) {
      repeated.push(...this.displayItems);
    }
    this.repeatedItems = repeated;
    this.strip.innerHTML = repeated.map(item =>
      `<div class="slot-item" style="height:${ITEM_HEIGHT}px">${item.displayName}</div>`
    ).join('');
    // Reset position
    this.strip.classList.remove('spinning');
    this.strip.style.transform = 'translateY(0)';
  }

  async spin() {
    if (this.isSpinning) return null;
    this.isSpinning = true;

    const foods = getFoods();
    const favorites = getFavorites();

    // Pick target using weighted random
    const targetFood = weightedRandom(foods, favorites);

    // Find target in displayItems to get its displayName
    const targetDisplay = this.displayItems.find(d => d.originalName === targetFood.name)
      || { displayName: targetFood.name, originalName: targetFood.name };

    // Calculate stop position
    const targetIndex = this.displayItems.indexOf(targetDisplay);
    const stopCycle = REPEAT_COUNT - 2;
    const stopItemGlobalIndex = stopCycle * this.displayItems.length + (targetIndex >= 0 ? targetIndex : 0);
    const centerOffset = Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT;
    const targetTranslateY = -(stopItemGlobalIndex * ITEM_HEIGHT) + centerOffset;

    // Reset
    this.strip.classList.remove('spinning');
    this.strip.style.transform = 'translateY(0)';
    void this.strip.offsetHeight; // Force reflow

    // Animate
    this.strip.classList.add('spinning');
    this.strip.style.transform = `translateY(${targetTranslateY}px)`;

    return new Promise(resolve => {
      setTimeout(() => {
        this.isSpinning = false;
        // Record
        addRecord(targetFood.name);
        // Callback with result
        if (this.onResult) this.onResult(targetFood.name);

        // Fetch pairing suggestion
        fetchPairing(targetFood.name).then(pairings => {
          if (this.onPairing) this.onPairing(targetFood.name, pairings);
        });

        resolve(targetFood.name);
      }, SPIN_DURATION);
    });
  }
}

export { weightedRandom };
