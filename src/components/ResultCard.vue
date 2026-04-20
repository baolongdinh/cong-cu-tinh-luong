<template>
  <div class="result-card" :class="`theme-${color}`">
    <div class="result-header">
      <h3>{{ result.label || 'Kết quả' }}</h3>
      <div class="insurance-badge" :class="result.insuranceType">
        {{ insuranceLabel }}
      </div>
    </div>

    <!-- Hero Numbers -->
    <div class="hero-numbers">
      <div class="hero-item">
        <div class="hero-label">Gross</div>
        <div class="hero-value gross">{{ fmt(result.gross) }}</div>
      </div>
      <div class="arrow">→</div>
      <div class="hero-item">
        <div class="hero-label">Net (Tiền mặt)</div>
        <div class="hero-value net">{{ fmt(result.net) }}</div>
      </div>
    </div>

    <!-- Total Value Highlight -->
    <div class="total-value-box">
      <div class="total-label">
        <span class="total-icon">💎</span>
        Tổng Giá Trị Thực (Tháng)
      </div>
      <div class="total-amount">{{ fmt(result.totalMonthlyValue) }}</div>
      <div class="total-hint">Tiền mặt + Tích lũy BHXH + BHTN</div>
    </div>

    <!-- Details -->
    <div class="details-section">
      <div class="section-title">📋 Chi tiết thu nhập</div>

      <div class="detail-row">
        <span class="dl">Lương Gross</span>
        <span class="dv positive">{{ fmt(result.gross) }}</span>
      </div>
      <div class="detail-row indent">
        <span class="dl">− BH người lao động đóng (10.5%)</span>
        <span class="dv negative">{{ fmt(-result.bhEmployee) }}</span>
      </div>
      <div class="detail-row indent sub">
        <span class="dl">· BHXH 8%</span>
        <span class="dv">{{ fmt(result.bhxhEmployee) }}</span>
      </div>
      <div class="detail-row indent sub">
        <span class="dl">· BHYT 1.5%</span>
        <span class="dv">{{ fmt(result.bhytEmployee) }}</span>
      </div>
      <div class="detail-row indent sub">
        <span class="dl">· BHTN 1%</span>
        <span class="dv">{{ fmt(result.bhtnEmployee) }}</span>
      </div>
      <div class="detail-row divider"></div>
      <div class="detail-row">
        <span class="dl">Thu nhập trước thuế</span>
        <span class="dv">{{ fmt(result.gross - result.bhEmployee) }}</span>
      </div>
      <div class="detail-row indent">
        <span class="dl">− Giảm trừ bản thân</span>
        <span class="dv">{{ fmt(result.personalDeduction) }}</span>
      </div>
      <div class="detail-row indent" v-if="result.dependents > 0">
        <span class="dl">− Giảm trừ {{ result.dependents }} người phụ thuộc</span>
        <span class="dv">{{ fmt(result.dependentDeduction) }}</span>
      </div>
      <div class="detail-row indent">
        <span class="dl">= Thu nhập tính thuế TNCN</span>
        <span class="dv highlight">{{ fmt(result.taxableIncome) }}</span>
      </div>
      <div class="detail-row">
        <span class="dl">− Thuế TNCN phải nộp</span>
        <span class="dv negative">{{ fmt(-result.pit) }}</span>
      </div>
      <div class="detail-row total-row">
        <span class="dl">= Tiền mặt nhận (Net)</span>
        <span class="dv net-final">{{ fmt(result.net) }}</span>
      </div>
    </div>

    <!-- BH Tích lũy -->
    <div class="details-section">
      <div class="section-title">🏦 Tích lũy Bảo Hiểm (giá trị thực)</div>
      <div class="detail-row">
        <span class="dl">Mức lương đóng BH</span>
        <span class="dv">{{ fmt(result.bhBase) }}</span>
      </div>
      <div class="detail-row">
        <span class="dl">BHXH hưu trí (NLĐ 8% + Cty 14%)</span>
        <span class="dv accent">{{ fmt(result.bhxhAccumulation) }}/tháng</span>
      </div>
      <div class="detail-row">
        <span class="dl">BHTN (NLĐ 1% + Cty 1%)</span>
        <span class="dv accent">{{ fmt(result.bhtnAccumulation) }}/tháng</span>
      </div>
    </div>

    <!-- Chi phí công ty -->
    <div class="details-section">
      <div class="section-title">🏢 Chi phí công ty thực chi</div>
      <div class="detail-row">
        <span class="dl">Gross</span>
        <span class="dv">{{ fmt(result.gross) }}</span>
      </div>
      <div class="detail-row">
        <span class="dl">+ BH Công ty đóng (18.5% bhBase)</span>
        <span class="dv">{{ fmt(result.bhEmployer) }}</span>
      </div>
      <div class="detail-row total-row">
        <span class="dl">= Tổng CPC thực chi</span>
        <span class="dv">{{ fmt(result.totalCostForEmployer) }}</span>
      </div>
    </div>

    <!-- Thống kê năm -->
    <div class="details-section annual-section">
      <div class="section-title">📅 Quy năm (×12{{ result.bonusMonth > 0 ? ` + ${result.bonusMonth} tháng thưởng` : '' }})</div>
      <div class="annual-grid">
        <div class="annual-item">
          <div class="al">Tiền mặt nhận</div>
          <div class="av">{{ fmt(result.annualTakeHome) }}</div>
        </div>
        <div class="annual-item accent">
          <div class="al">Tích lũy BHXH</div>
          <div class="av">{{ fmt(result.annualBhxh) }}</div>
        </div>
        <div class="annual-item accent2">
          <div class="al">Tích lũy BHTN</div>
          <div class="av">{{ fmt(result.annualBhtn) }}</div>
        </div>
        <div class="annual-item total">
          <div class="al">TỔNG GIÁ TRỊ NĂM</div>
          <div class="av">{{ fmt(result.annualTotalValue) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatVND } from '../utils/calculator.js'

const props = defineProps({
  result: Object,
  color: { type: String, default: 'blue' },
})

const fmt = (n) => formatVND(n)

const insuranceLabel = computed(() => {
  const map = { full: '🛡️ Đóng Full', minimum: '⚡ Tối Thiểu', none: '❌ Không BH' }
  return map[props.result.insuranceType] || ''
})
</script>

<style scoped>
.result-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(20px);
}

.result-card.theme-blue { border-color: rgba(99, 102, 241, 0.25); }
.result-card.theme-purple { border-color: rgba(139, 92, 246, 0.25); }

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.result-header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
}

.insurance-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}
.insurance-badge.full { background: rgba(16,185,129,0.15); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.3); }
.insurance-badge.minimum { background: rgba(245,158,11,0.15); color: #fcd34d; border: 1px solid rgba(245,158,11,0.3); }
.insurance-badge.none { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }

.hero-numbers {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
}

.hero-item { flex: 1; }

.hero-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(148,163,184,0.6);
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.hero-value {
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.hero-value.gross { color: #94a3b8; }
.hero-value.net { color: #34d399; }

.arrow {
  color: rgba(148,163,184,0.3);
  font-size: 1.2rem;
}

.total-value-box {
  background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1));
  border: 1px solid rgba(99,102,241,0.3);
  border-radius: 14px;
  padding: 1.25rem;
  text-align: center;
  margin-bottom: 1.25rem;
}

.total-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #a5b4fc;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.total-icon { margin-right: 0.4rem; }

.total-amount {
  font-size: 2rem;
  font-weight: 900;
  color: #c4b5fd;
  letter-spacing: -1px;
}

.total-hint {
  font-size: 0.72rem;
  color: rgba(148,163,184,0.5);
  margin-top: 0.3rem;
}

.details-section {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 1rem 1.15rem;
  margin-bottom: 0.75rem;
}

.section-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(148,163,184,0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0;
  font-size: 0.875rem;
}

.detail-row.indent { padding-left: 1rem; }
.detail-row.sub { padding-left: 2rem; opacity: 0.7; font-size: 0.81rem; }
.detail-row.divider { border-top: 1px dashed rgba(255,255,255,0.06); margin: 0.25rem 0; }
.detail-row.total-row {
  border-top: 1px solid rgba(255,255,255,0.08);
  margin-top: 0.25rem;
  padding-top: 0.5rem;
  font-weight: 700;
}

.dl { color: rgba(148,163,184,0.8); }
.dv { font-weight: 600; color: #e2e8f0; }
.dv.positive { color: #34d399; }
.dv.negative { color: #f87171; }
.dv.accent { color: #6ee7b7; }
.dv.highlight { color: #fcd34d; }
.dv.net-final { color: #34d399; font-size: 1.05rem; }

.annual-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.annual-item {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 0.65rem 0.85rem;
}

.annual-item.accent { border-color: rgba(16,185,129,0.2); }
.annual-item.accent2 { border-color: rgba(245,158,11,0.2); }
.annual-item.total {
  grid-column: span 2;
  border-color: rgba(99,102,241,0.3);
  background: rgba(99,102,241,0.08);
}

.al {
  font-size: 0.72rem;
  color: rgba(148,163,184,0.6);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.2rem;
}

.av {
  font-size: 0.95rem;
  font-weight: 700;
  color: #e2e8f0;
}

.annual-item.total .av {
  font-size: 1.1rem;
  color: #a5b4fc;
}

.annual-section {}
</style>
