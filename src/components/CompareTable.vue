<template>
  <div class="compare-section">
    <div class="compare-header">
      <h2>⚖️ Bảng So Sánh Chi Tiết</h2>
      <div :class="['winner-badge', winner === 'tie' ? 'tie' : 'win']">
        {{ winnerText }}
      </div>
    </div>

    <!-- Winner Visual -->
    <div class="winner-visual">
      <div :class="['offer-summary', r1.totalMonthlyValue >= r2.totalMonthlyValue ? 'winner' : 'loser']">
        <div class="os-label">{{ r1.label || 'Offer A' }}</div>
        <div class="os-value">{{ fmt(r1.totalMonthlyValue) }}</div>
        <div class="os-sub">Tổng giá trị/tháng</div>
        <div v-if="r1.totalMonthlyValue > r2.totalMonthlyValue" class="crown">👑</div>
      </div>
      <div class="vs-divider">VS</div>
      <div :class="['offer-summary', r2.totalMonthlyValue >= r1.totalMonthlyValue ? 'winner' : 'loser']">
        <div class="os-label">{{ r2.label || 'Offer B' }}</div>
        <div class="os-value">{{ fmt(r2.totalMonthlyValue) }}</div>
        <div class="os-sub">Tổng giá trị/tháng</div>
        <div v-if="r2.totalMonthlyValue > r1.totalMonthlyValue" class="crown">👑</div>
      </div>
    </div>

    <!-- Detailed Table -->
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="row-label">Hạng mục</th>
            <th class="col-a">{{ r1.label || 'Offer A' }}</th>
            <th class="col-b">{{ r2.label || 'Offer B' }}</th>
            <th class="col-diff">Chênh lệch (B - A)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="section-header"><td colspan="4">💳 Thu nhập cơ bản</td></tr>
          <tr v-for="row in incomeRows" :key="row.label">
            <td class="row-label">{{ row.label }}</td>
            <td :class="['val', row.class1]">{{ row.isRaw ? row.v1 : fmt(row.v1) }}{{ row.unit || '' }}</td>
            <td :class="['val', row.class2]">{{ row.isRaw ? row.v2 : fmt(row.v2) }}{{ row.unit || '' }}</td>
            <td :class="['val', diffClass(row.v2 - row.v1, row.positiveDir)]">
              {{ row.isRaw ? diffRaw(row.v2 - row.v1) : diffFmt(row.v2 - row.v1) }}{{ row.unit || '' }}
            </td>
          </tr>

          <tr class="section-header"><td colspan="4">🛡️ Bảo Hiểm xã hội</td></tr>
          <tr v-for="row in insuranceRows" :key="row.label">
            <td class="row-label">{{ row.label }}</td>
            <td :class="['val', row.class1]">{{ row.isRaw ? row.v1 : fmt(row.v1) }}{{ row.unit || '' }}</td>
            <td :class="['val', row.class2]">{{ row.isRaw ? row.v2 : fmt(row.v2) }}{{ row.unit || '' }}</td>
            <td :class="['val', diffClass(row.v2 - row.v1, row.positiveDir)]">
              {{ row.isRaw ? diffRaw(row.v2 - row.v1) : diffFmt(row.v2 - row.v1) }}{{ row.unit || '' }}
            </td>
          </tr>

          <tr class="section-header"><td colspan="4">💰 Thuế TNCN</td></tr>
          <tr v-for="row in taxRows" :key="row.label">
            <td class="row-label">{{ row.label }}</td>
            <td :class="['val', row.class1]">{{ row.isRaw ? row.v1 : fmt(row.v1) }}{{ row.unit || '' }}</td>
            <td :class="['val', row.class2]">{{ row.isRaw ? row.v2 : fmt(row.v2) }}{{ row.unit || '' }}</td>
            <td :class="['val', diffClass(row.v2 - row.v1, row.positiveDir)]">
              {{ row.isRaw ? diffRaw(row.v2 - row.v1) : diffFmt(row.v2 - row.v1) }}{{ row.unit || '' }}
            </td>
          </tr>

          <tr class="section-header"><td colspan="4">📊 Tổng giá trị</td></tr>
          <tr class="total-row" v-for="row in totalRows" :key="row.label">
            <td class="row-label">{{ row.label }}</td>
            <td :class="['val', 'bold', row.class1]">{{ row.isRaw ? row.v1 : fmt(row.v1) }}{{ row.unit || '' }}</td>
            <td :class="['val', 'bold', row.class2]">{{ row.isRaw ? row.v2 : fmt(row.v2) }}{{ row.unit || '' }}</td>
            <td :class="['val', 'bold', diffClass(row.v2 - row.v1, row.positiveDir)]">
              {{ row.isRaw ? diffRaw(row.v2 - row.v1) : diffFmt(row.v2 - row.v1) }}{{ row.unit || '' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Analysis -->
    <div class="analysis-box">
      <div class="analysis-title">🧠 Phân tích</div>
      <div class="analysis-content">
        <div class="insight" v-for="i in insights" :key="i.text" :class="i.type">
          <span class="i-icon">{{ i.icon }}</span>
          <span>{{ i.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatVND } from '../utils/calculator.js'

const props = defineProps({ r1: Object, r2: Object })
const fmt = (n) => formatVND(n)

const diff = (a, b) => Math.round(b - a)

const diffFmt = (d) => {
  if (d === 0) return '±0'
  const sign = d > 0 ? '+' : ''
  return sign + formatVND(d)
}

const diffRaw = (d) => {
  if (d === 0) return '±0'
  return (d > 0 ? '+' : '') + d
}

const diffClass = (d, positiveDir = 1) => {
  if (Math.abs(d) < 1000) return 'neutral'
  return (d * positiveDir) > 0 ? 'positive' : 'negative'
}

const incomeRows = computed(() => [
  { label: 'Lương Gross', v1: props.r1.gross, v2: props.r2.gross, positiveDir: 1 },
  { label: 'Tiền mặt nhận (Net)', v1: props.r1.net, v2: props.r2.net, positiveDir: 1, class1: 'green', class2: 'green' },
  { label: 'Số tháng thưởng/năm', v1: props.r1.bonusMonth, v2: props.r2.bonusMonth, positiveDir: 1, isRaw: true, unit: ' tháng' },
  { label: 'Tiền thưởng năm (Cash)', v1: props.r1.net * props.r1.bonusMonth, v2: props.r2.net * props.r2.bonusMonth, positiveDir: 1, class1: 'green', class2: 'green' },
  { label: 'Mức lương đóng BH', v1: props.r1.bhBase, v2: props.r2.bhBase, positiveDir: 1 },
])

const insuranceRows = computed(() => [
  { label: 'NLĐ đóng BH (10.5%)', v1: props.r1.bhEmployee, v2: props.r2.bhEmployee, positiveDir: -1, class1: 'red', class2: 'red' },
  { label: 'BHXH Hưu trí tích lũy (22%)', v1: props.r1.bhxhAccumulation, v2: props.r2.bhxhAccumulation, positiveDir: 1, class1: 'accent', class2: 'accent' },
  { label: 'BHTN tích lũy (2%)', v1: props.r1.bhtnAccumulation, v2: props.r2.bhtnAccumulation, positiveDir: 1 },
  { label: 'Công ty đóng BH (18.5%)', v1: props.r1.bhEmployer, v2: props.r2.bhEmployer, positiveDir: 1 },
])

const taxRows = computed(() => [
  { label: 'Thu nhập tính thuế', v1: props.r1.taxableIncome, v2: props.r2.taxableIncome, positiveDir: -1 },
  { label: 'Thuế TNCN/tháng', v1: props.r1.pit, v2: props.r2.pit, positiveDir: -1, class1: 'red', class2: 'red' },
  { label: 'Thuế TNCN/năm', v1: props.r1.annualPIT, v2: props.r2.annualPIT, positiveDir: -1, class1: 'red', class2: 'red' },
])

const totalRows = computed(() => [
  { label: '💎 Tổng giá trị/tháng (Net + BH tích lũy)', v1: props.r1.totalMonthlyValue, v2: props.r2.totalMonthlyValue, positiveDir: 1, class1: 'purple', class2: 'purple' },
  { label: '📅 Tổng giá trị năm', v1: props.r1.annualTotalValue, v2: props.r2.annualTotalValue, positiveDir: 1, class1: 'purple', class2: 'purple' },
  { label: '🏢 Chi phí thực của công ty', v1: props.r1.totalCostForEmployer, v2: props.r2.totalCostForEmployer, positiveDir: -1 },
])

const delta = computed(() => props.r2.totalMonthlyValue - props.r1.totalMonthlyValue)

const winner = computed(() => {
  if (Math.abs(delta.value) < 50000) return 'tie'
  return delta.value > 0 ? 'b' : 'a'
})

const winnerText = computed(() => {
  if (winner.value === 'tie') return '🤝 Hai offer gần tương đương'
  const name = winner.value === 'a' ? (props.r1.label || 'Offer A') : (props.r2.label || 'Offer B')
  return `🏆 ${name} có lợi hơn ${formatVND(Math.abs(delta.value))}/tháng`
})

const insights = computed(() => {
  const list = []
  const d = delta.value
  const r1 = props.r1
  const r2 = props.r2

  // Cash difference
  const cashDiff = r2.net - r1.net
  if (Math.abs(cashDiff) > 100000) {
    list.push({
      icon: '💸',
      text: `Tiền mặt: ${formatVND(r2.label || 'Offer B')} ${cashDiff > 0 ? 'cao hơn' : 'thấp hơn'} ${formatVND(Math.abs(cashDiff))}/tháng so với ${r1.label || 'Offer A'}.`,
      type: cashDiff > 0 ? 'good' : 'warn',
    })
  }

  // BH difference  
  const bhDiff = r2.bhxhAccumulation - r1.bhxhAccumulation
  if (Math.abs(bhDiff) > 100000) {
    list.push({
      icon: '🏦',
      text: `Tích lũy BHXH hưu trí: Offer B ${bhDiff > 0 ? 'cao hơn' : 'thấp hơn'} ${formatVND(Math.abs(bhDiff))}/tháng (${formatVND(Math.abs(bhDiff * 12))}/năm).`,
      type: bhDiff > 0 ? 'good' : 'warn',
    })
  }

  // Tax difference
  const taxDiff = r2.pit - r1.pit
  if (Math.abs(taxDiff) > 50000) {
    list.push({
      icon: '🧾',
      text: `Thuế TNCN: Offer B ${taxDiff > 0 ? 'nhiều hơn' : 'ít hơn'} ${formatVND(Math.abs(taxDiff))}/tháng. ${taxDiff > 0 ? 'Gánh nặng thuế cao hơn.' : 'Tiết kiệm thuế hơn.'}`,
      type: taxDiff > 0 ? 'warn' : 'good',
    })
  }

  // Total verdict
  if (Math.abs(d) > 50000) {
    list.push({
      icon: d > 0 ? '✅' : '❌',
      text: `Tổng kết: Offer ${d > 0 ? 'B' : 'A'} có tổng giá trị thực cao hơn ${formatVND(Math.abs(d))}/tháng (${formatVND(Math.abs(d * 12))}/năm).`,
      type: d > 0 ? 'good' : 'neutral',
    })
  }

  return list
})
</script>

<style scoped>
.compare-section {
  margin-top: 0.5rem;
}

.compare-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.compare-header h2 {
  font-size: 1.3rem;
  font-weight: 800;
  color: #e2e8f0;
  margin: 0;
}

.winner-badge {
  padding: 0.4rem 1.25rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
}

.winner-badge.win { background: rgba(16,185,129,0.15); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.3); }
.winner-badge.tie { background: rgba(245,158,11,0.1); color: #fcd34d; border: 1px solid rgba(245,158,11,0.3); }

.winner-visual {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
}

.offer-summary {
  flex: 1;
  text-align: center;
  padding: 1rem;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s;
}

.offer-summary.winner {
  background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1));
  border: 1px solid rgba(99,102,241,0.3);
}

.offer-summary.loser {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  opacity: 0.7;
}

.os-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(148,163,184,0.6); margin-bottom: 0.25rem; }
.os-value { font-size: 1.8rem; font-weight: 900; color: #e2e8f0; letter-spacing: -1px; }
.os-sub { font-size: 0.72rem; color: rgba(148,163,184,0.5); margin-top: 0.25rem; }
.crown { font-size: 1.5rem; margin-top: 0.5rem; }

.vs-divider {
  font-size: 1.2rem;
  font-weight: 900;
  color: rgba(148,163,184,0.3);
  letter-spacing: 1px;
}

.table-wrap {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead tr {
  background: rgba(255,255,255,0.05);
}

th {
  padding: 0.75rem 1rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(148,163,184,0.6);
  text-align: right; /* Changed from left to right for numeric columns */
}

th.row-label {
  text-align: left;
}

th.col-a { color: #a5b4fc; }
th.col-b { color: #c4b5fd; }
th.col-diff { color: rgba(148,163,184,0.5); }

td {
  padding: 0.55rem 1rem;
  font-size: 0.875rem;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  text-align: right;
}

td.row-label {
  text-align: left;
}

tr:last-child td { border-bottom: none; }

.row-label { color: rgba(148,163,184,0.8); }

.val { font-weight: 500; color: #e2e8f0; }
.val.bold { font-weight: 700; }
.val.positive { color: #34d399; }
.val.negative { color: #f87171; }
.val.neutral { color: rgba(148,163,184,0.5); }
.val.green { color: #34d399; }
.val.red { color: #f87171; }
.val.accent { color: #6ee7b7; }
.val.purple { color: #a5b4fc; }

tr.section-header td {
  background: rgba(99,102,241,0.08);
  color: #a5b4fc;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid rgba(99,102,241,0.15);
}

tr.total-row td {
  background: rgba(99,102,241,0.05);
  padding: 0.75rem 1rem;
}

.analysis-box {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 1.25rem;
}

.analysis-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(148,163,184,0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
}

.insight {
  display: flex;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.insight.good { background: rgba(16,185,129,0.07); color: #6ee7b7; }
.insight.warn { background: rgba(245,158,11,0.07); color: #fcd34d; }
.insight.neutral { background: rgba(255,255,255,0.04); color: rgba(148,163,184,0.8); }

.i-icon { flex-shrink: 0; font-size: 1rem; }
</style>
