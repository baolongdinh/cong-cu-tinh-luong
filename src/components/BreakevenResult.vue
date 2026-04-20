<template>
  <div class="breakeven-section">
    <div class="be-header">
      <h2>🎯 Kết Quả Điểm Hòa Vốn</h2>
      <div class="be-subtitle">Mức lương tối thiểu cần deal để tổng giá trị bằng offer tham chiếu</div>
    </div>

    <!-- Breakeven Highlight -->
    <div class="be-highlight-grid">
      <div class="be-card primary">
        <div class="be-card-icon">🏆</div>
        <div class="be-card-label">Mức lương cần deal ({{ salaryTypeLabel }})</div>
        <div class="be-card-value">{{ fmt(targetSalary) }}</div>
        <div class="be-card-hint">Để tổng giá trị = Offer tham chiếu</div>
      </div>
      <div class="be-card">
        <div class="be-card-icon">💎</div>
        <div class="be-card-label">Tổng giá trị hòa vốn/tháng</div>
        <div class="be-card-value secondary">{{ fmt(breakeven.result.totalMonthlyValue) }}</div>
        <div class="be-card-hint">≈ {{ fmt(reference.totalMonthlyValue) }} (tham chiếu)</div>
      </div>
      <div class="be-card">
        <div class="be-card-icon">💸</div>
        <div class="be-card-label">Tiền mặt nhận (Net)</div>
        <div class="be-card-value green">{{ fmt(breakeven.result.net) }}</div>
        <div class="be-card-hint">Chênh lệch: {{ diffFmt(breakeven.result.net - reference.net) }} so với ref</div>
      </div>
    </div>

    <!-- Deal Strategy -->
    <div class="strategy-box">
      <div class="strategy-title">📋 Chiến lược đàm phán</div>
      <div class="strategy-steps">
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-content">
            <div class="step-head">Mức hòa vốn (Break-even)</div>
            <div class="step-body">
              Yêu cầu tối thiểu <strong>{{ fmt(targetSalary) }}</strong> {{ salaryTypeLabel.toLowerCase() }} để bù đắp cho chênh lệch bảo hiểm.
            </div>
          </div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-content">
            <div class="step-head">Mức kỳ vọng (+10%)</div>
            <div class="step-body">
              Nên deal ở mức <strong>{{ fmt(targetSalary * 1.1) }}</strong> {{ salaryTypeLabel.toLowerCase() }} để thực sự có lợi hơn (bù thêm rủi ro chuyển việc, gánh nặng thuế cao hơn).
            </div>
          </div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-content">
            <div class="step-head">Lý luận khi đàm phán</div>
            <div class="step-body">
              <em>"Offer hiện tại của tôi là {{ fmt(reference.gross) }} đóng BH full lương — tích lũy hưu trí {{ fmt(reference.bhxhAccumulation) }}/tháng. Để chuyển sang mô hình đóng BH tối thiểu, tôi cần mức lương cao hơn để tự đầu tư bù đắp phần này."</em>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Side by Side -->
    <div class="be-compare">
      <div class="section-title">📊 So sánh: Tham chiếu vs Hòa vốn</div>
      <div class="be-table">
        <div class="be-table-header">
          <div>Hạng mục</div>
          <div>{{ reference.label || 'Offer Tham chiếu' }}</div>
          <div>{{ breakeven.result.label || 'Offer Hòa Vốn' }}</div>
        </div>
        <div class="be-row" v-for="r in rows" :key="r.label">
          <div class="be-cell-label">{{ r.label }}</div>
          <div :class="['be-cell', r.c1]">{{ fmt(r.v1) }}</div>
          <div :class="['be-cell', r.c2]">{{ fmt(r.v2) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatVND } from '../utils/calculator.js'

const props = defineProps({
  reference: Object,
  breakeven: Object,
})

const fmt = formatVND

const diffFmt = (d) => {
  const sign = d >= 0 ? '+' : ''
  return sign + formatVND(d)
}

const targetSalary = computed(() => {
  const s = props.breakeven.result.salaryType === 'net'
    ? props.breakeven.result.net
    : props.breakeven.result.gross
  return Math.round(s)
})

const salaryTypeLabel = computed(() => {
  return props.breakeven.result.salaryType === 'net' ? 'Net' : 'Gross'
})

const rows = computed(() => {
  const r = props.reference
  const b = props.breakeven.result
  return [
    { label: 'Lương Gross', v1: r.gross, v2: b.gross },
    { label: 'Tiền mặt nhận (Net)', v1: r.net, v2: b.net, c1: 'green', c2: 'green' },
    { label: 'BH NLĐ đóng', v1: r.bhEmployee, v2: b.bhEmployee, c1: 'red', c2: 'red' },
    { label: 'Thuế TNCN', v1: r.pit, v2: b.pit, c1: 'red', c2: 'red' },
    { label: 'BHXH tích lũy (22%)', v1: r.bhxhAccumulation, v2: b.bhxhAccumulation, c1: 'accent', c2: 'accent' },
    { label: 'BHTN tích lũy (2%)', v1: r.bhtnAccumulation, v2: b.bhtnAccumulation },
    { label: '💎 Tổng GTriệu/tháng', v1: r.totalMonthlyValue, v2: b.totalMonthlyValue, c1: 'purple', c2: 'purple' },
    { label: '📅 Tổng giá trị/năm', v1: r.annualTotalValue, v2: b.annualTotalValue, c1: 'purple', c2: 'purple' },
  ]
})
</script>

<style scoped>
.breakeven-section { margin-top: 0.5rem; }

.be-header { margin-bottom: 1.5rem; }
.be-header h2 { font-size: 1.3rem; font-weight: 800; color: #e2e8f0; margin: 0 0 0.25rem; }
.be-subtitle { font-size: 0.85rem; color: rgba(148,163,184,0.6); }

.be-highlight-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.be-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.25rem;
  text-align: center;
  transition: all 0.2s;
}

.be-card.primary {
  background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1));
  border-color: rgba(99,102,241,0.35);
  box-shadow: 0 4px 20px rgba(99,102,241,0.2);
}

.be-card-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
.be-card-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(148,163,184,0.6); margin-bottom: 0.5rem; }
.be-card-value { font-size: 1.6rem; font-weight: 900; letter-spacing: -1px; color: #e2e8f0; }
.be-card-value.secondary { color: #a5b4fc; }
.be-card-value.green { color: #34d399; }
.be-card-hint { font-size: 0.72rem; color: rgba(148,163,184,0.5); margin-top: 0.35rem; }

.strategy-box {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.strategy-title { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: rgba(148,163,184,0.7); letter-spacing: 0.5px; margin-bottom: 1rem; }

.strategy-steps { display: flex; flex-direction: column; gap: 0.75rem; }

.step { display: flex; gap: 1rem; align-items: flex-start; }

.step-num {
  width: 28px; height: 28px; border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white; font-size: 0.8rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 0.1rem;
}

.step-head { font-size: 0.9rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.2rem; }
.step-body { font-size: 0.85rem; color: rgba(148,163,184,0.8); line-height: 1.5; }
.step-body strong { color: #6ee7b7; }
.step-body em { color: rgba(148,163,184,0.7); font-style: italic; }

.be-compare {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  overflow: hidden;
}

.section-title { padding: 0.75rem 1.25rem; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(148,163,184,0.6); border-bottom: 1px solid rgba(255,255,255,0.05); }

.be-table { width: 100%; }

.be-table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  background: rgba(255,255,255,0.04);
  padding: 0.6rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: rgba(148,163,184,0.5);
  letter-spacing: 0.3px;
}

.be-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 0.5rem 1.25rem;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  align-items: center;
}

.be-row:last-child { border-bottom: none; }

.be-cell-label { font-size: 0.875rem; color: rgba(148,163,184,0.8); }
.be-cell { font-size: 0.875rem; font-weight: 600; color: #e2e8f0; text-align: right; }
.be-cell.green { color: #34d399; }
.be-cell.red { color: #f87171; }
.be-cell.accent { color: #6ee7b7; }
.be-cell.purple { color: #a5b4fc; }

@media (max-width: 700px) {
  .be-highlight-grid { grid-template-columns: 1fr; }
}
</style>
