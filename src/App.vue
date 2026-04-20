<template>
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <div class="logo-area">
          <div class="logo-icon">₫</div>
          <div>
            <h1>Máy Tính Lương <span class="tag">Việt Nam</span></h1>
            <p class="subtitle">So sánh offer lương · Tính thuế TNCN · Phân tích tổng giá trị nhận được</p>
          </div>
        </div>
        <div class="version-badge">2026</div>
      </div>
    </header>

    <main class="main-content">
      <!-- Mode Switcher -->
      <div class="mode-switcher">
        <button :class="['mode-btn', { active: mode === 'single' }]" @click="mode = 'single'">
          <span class="mode-icon">📊</span>
          Tính 1 Offer
        </button>
        <button :class="['mode-btn', { active: mode === 'compare' }]" @click="mode = 'compare'">
          <span class="mode-icon">⚖️</span>
          So Sánh 2 Offers
        </button>
        <button :class="['mode-btn', { active: mode === 'breakeven' }]" @click="mode = 'breakeven'">
          <span class="mode-icon">🎯</span>
          Tìm Điểm Hòa Vốn
        </button>
      </div>

      <!-- Single Mode -->
      <template v-if="mode === 'single'">
        <div class="single-grid">
          <OfferForm v-model="offer1" label="Offer của bạn" color="blue" />
          <ResultCard v-if="result1" :result="result1" color="blue" />
        </div>
      </template>

      <!-- Compare Mode -->
      <template v-if="mode === 'compare'">
        <div class="compare-grid">
          <OfferForm v-model="offer1" label="Offer A" color="blue" />
          <OfferForm v-model="offer2" label="Offer B" color="purple" />
        </div>
        <CompareTable v-if="result1 && result2" :r1="result1" :r2="result2" />
      </template>

      <!-- Breakeven Mode -->
      <template v-if="mode === 'breakeven'">
        <div class="compare-grid">
          <OfferForm v-model="offer1" label="Offer Tham Chiếu" color="blue" hint="Offer bạn đang có" />
          <BreakevenForm v-model="offer2" :reference="result1" />
        </div>
        <BreakevenResult v-if="result1 && breakeven" :reference="result1" :breakeven="breakeven" />
      </template>
    </main>

    <footer class="app-footer">
      <p>Tính theo Bộ Luật Lao động, Luật BHXH và Luật Thuế TNCN hiện hành · Năm 2026</p>
      <p class="disclaimer">⚠️ Kết quả mang tính tham khảo. Nên xác nhận với phòng HR hoặc đơn vị tư vấn thuế.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import OfferForm from './components/OfferForm.vue'
import ResultCard from './components/ResultCard.vue'
import CompareTable from './components/CompareTable.vue'
import BreakevenForm from './components/BreakevenForm.vue'
import BreakevenResult from './components/BreakevenResult.vue'
import { calculateOffer, findBreakEven } from './utils/calculator.js'

const mode = ref('compare')

const defaultOffer = () => ({
  label: '',
  salary: 35000000,
  salaryType: 'gross',
  insuranceType: 'full',
  customBhBase: 0,
  region: 1,
  dependents: 0,
  bonusMonth: 1,
})

const offer1 = ref(defaultOffer())
const offer2 = ref({
  ...defaultOffer(),
  salary: 40000000,
  salaryType: 'net',
  insuranceType: 'minimum',
})

const result1 = computed(() => {
  try { return calculateOffer(offer1.value) } catch { return null }
})

const result2 = computed(() => {
  if (mode.value === 'single') return null
  try { return calculateOffer(offer2.value) } catch { return null }
})

const breakeven = computed(() => {
  if (mode.value !== 'breakeven' || !result1.value) return null
  try {
    return findBreakEven(result1.value, {
      ...offer2.value,
      salary: undefined,
    })
  } catch { return null }
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
  border-bottom: 1px solid rgba(99, 102, 241, 0.3);
  padding: 1.5rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 900;
  color: white;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}

h1 {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  margin: 0;
  letter-spacing: -0.5px;
}

.tag {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: rgba(148, 163, 184, 0.8);
  font-size: 0.8rem;
  margin: 0.2rem 0 0;
}

.version-badge {
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.main-content {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.mode-switcher {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  padding: 0.5rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: rgba(148, 163, 184, 0.8);
}

.mode-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  color: #a5b4fc;
}

.mode-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.mode-icon {
  font-size: 1.1rem;
}

.single-grid {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.app-footer {
  background: rgba(15, 23, 42, 0.5);
  border-top: 1px solid rgba(255,255,255,0.05);
  padding: 1.5rem 2rem;
  text-align: center;
}

.app-footer p {
  color: rgba(148, 163, 184, 0.5);
  font-size: 0.75rem;
  margin: 0.25rem 0;
}

.disclaimer {
  color: rgba(251, 191, 36, 0.5) !important;
}

@media (max-width: 900px) {
  .compare-grid, .single-grid {
    grid-template-columns: 1fr;
  }
  .mode-switcher {
    flex-direction: column;
  }
}
</style>
