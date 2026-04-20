<template>
  <div class="form-card" :class="`theme-${color}`">
    <div class="form-header">
      <div class="form-badge" :class="`badge-${color}`">{{ label }}</div>
      <div v-if="hint" class="hint-text">{{ hint }}</div>
    </div>

    <!-- Nhãn offer -->
    <div class="field">
      <label>Tên offer (tùy chọn)</label>
      <input v-model="local.label" type="text" placeholder="VD: Công ty A" class="inp" />
    </div>

    <!-- Lương -->
    <div class="field">
      <label>Mức lương</label>
      <div class="input-row">
        <div class="salary-input-wrap">
          <input
            v-model.number="local.salary"
            type="number"
            step="500000"
            min="0"
            class="inp salary-inp"
            placeholder="35,000,000"
          />
          <span class="currency-label">VNĐ</span>
        </div>
        <div class="toggle-group">
          <button :class="['tog', { active: local.salaryType === 'gross' }]" @click="local.salaryType = 'gross'">Gross</button>
          <button :class="['tog', { active: local.salaryType === 'net' }]" @click="local.salaryType = 'net'">Net</button>
        </div>
      </div>
      <div class="quick-amounts">
        <button v-for="a in quickAmounts" :key="a" class="quick-btn" @click="local.salary = a">
          {{ formatM(a) }}
        </button>
      </div>
    </div>

    <!-- Bảo hiểm -->
    <div class="field">
      <label>Chế độ đóng Bảo Hiểm</label>
      <div class="insurance-options">
        <label class="insurance-opt" v-for="opt in insuranceOptions" :key="opt.value">
          <input type="radio" v-model="local.insuranceType" :value="opt.value" />
          <div class="opt-card">
            <div class="opt-icon">{{ opt.icon }}</div>
            <div>
              <div class="opt-label">{{ opt.label }}</div>
              <div class="opt-desc">{{ opt.desc }}</div>
            </div>
          </div>
        </label>
      </div>
      <!-- Custom BH base input -->
      <div v-if="local.insuranceType === 'custom'" class="custom-bh-wrap">
        <div class="custom-bh-label">
          <span>💰 Mức lương đóng BH tùy chỉnh</span>
          <span class="custom-hint">Tối thiểu: lương tối thiểu vùng · Tối đa: lương gross</span>
        </div>
        <div class="salary-input-wrap">
          <input
            v-model.number="local.customBhBase"
            type="number"
            step="500000"
            min="0"
            class="inp salary-inp custom-inp"
            placeholder="VD: 10,000,000"
          />
          <span class="currency-label">VNĐ</span>
        </div>
        <div class="quick-amounts">
          <button v-for="a in customQuickAmounts" :key="a" class="quick-btn" @click="local.customBhBase = a">
            {{ formatM(a) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Vùng -->
    <div class="field">
      <label>Vùng lương tối thiểu</label>
      <select v-model.number="local.region" class="inp">
        <option :value="1">Vùng I — HN, TP.HCM (5.310.000đ)</option>
        <option :value="2">Vùng II (4.730.000đ)</option>
        <option :value="3">Vùng III (4.140.000đ)</option>
        <option :value="4">Vùng IV (3.700.000đ)</option>
      </select>
    </div>

    <!-- Người phụ thuộc -->
    <div class="field">
      <label>Số người phụ thuộc <span class="muted">(giảm trừ 4.4tr/người)</span></label>
      <div class="stepper">
        <button class="step-btn" @click="dec('dependents')">−</button>
        <span class="step-val">{{ local.dependents }}</span>
        <button class="step-btn" @click="inc('dependents')">+</button>
      </div>
    </div>

    <!-- Tháng thưởng -->
    <div class="field">
      <label>Tháng lương thưởng/năm <span class="muted">(tháng 13, 14...)</span></label>
      <div class="stepper">
        <button class="step-btn" @click="decBonus">−</button>
        <span class="step-val">{{ local.bonusMonth }} tháng</span>
        <button class="step-btn" @click="incBonus">+</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: Object,
  label: { type: String, default: 'Offer' },
  color: { type: String, default: 'blue' },
  hint: String,
})
const emit = defineEmits(['update:modelValue'])

const local = reactive({ ...props.modelValue })

watch(local, () => emit('update:modelValue', { ...local }), { deep: true })
watch(() => props.modelValue, (v) => { Object.assign(local, v) }, { deep: true })

const quickAmounts = [25000000, 30000000, 35000000, 40000000, 45000000, 50000000]

const insuranceOptions = [
  { value: 'full', label: 'Full lương', icon: '🛡️', desc: 'BH tính trên 100% lương' },
  { value: 'minimum', label: 'Mức tối thiểu', icon: '⚡', desc: 'BH theo lương tối thiểu vùng' },
  { value: 'custom', label: 'Tùy chỉnh', icon: '🎛️', desc: 'Tự nhập mức lương đóng BH' },
  { value: 'none', label: 'Không đóng', icon: '❌', desc: 'Không có bảo hiểm xã hội' },
]

const customQuickAmounts = [5000000, 8000000, 10000000, 15000000, 20000000]

const formatM = (n) => `${(n / 1000000)}tr`

const inc = (k) => { local[k] = (local[k] || 0) + 1 }
const dec = (k) => { if (local[k] > 0) local[k]-- }
const incBonus = () => { if (local.bonusMonth < 6) local.bonusMonth += 0.5 }
const decBonus = () => { if (local.bonusMonth > 0) local.bonusMonth -= 0.5 }
</script>

<style scoped>
.form-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(20px);
  transition: box-shadow 0.3s ease;
}

.form-card:hover {
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.form-card.theme-blue { border-color: rgba(99, 102, 241, 0.3); }
.form-card.theme-purple { border-color: rgba(139, 92, 246, 0.3); }
.form-card.theme-green { border-color: rgba(16, 185, 129, 0.3); }

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.form-badge {
  padding: 0.35rem 1rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.badge-blue { background: rgba(99,102,241,0.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }
.badge-purple { background: rgba(139,92,246,0.2); color: #c4b5fd; border: 1px solid rgba(139,92,246,0.3); }
.badge-green { background: rgba(16,185,129,0.2); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.3); }

.hint-text {
  font-size: 0.75rem;
  color: rgba(148,163,184,0.6);
  font-style: italic;
}

.field {
  margin-bottom: 1.25rem;
}

.field label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(148, 163, 184, 0.8);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.muted { font-weight: 400; text-transform: none; opacity: 0.7; }

.inp {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 0.7rem 1rem;
  color: #e2e8f0;
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.inp:focus {
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.inp option {
  background: #1e1b4b;
  color: #e2e8f0;
}

.input-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.salary-input-wrap {
  position: relative;
  flex: 1;
}

.salary-inp { padding-right: 3rem; }

.currency-label {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: rgba(148,163,184,0.5);
  pointer-events: none;
}

.toggle-group {
  display: flex;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.tog {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: rgba(148,163,184,0.6);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tog.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.quick-amounts {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.quick-btn {
  padding: 0.25rem 0.6rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  color: rgba(148,163,184,0.7);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: rgba(99,102,241,0.2);
  border-color: rgba(99,102,241,0.4);
  color: #a5b4fc;
}

.insurance-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.insurance-opt {
  cursor: pointer;
}

.insurance-opt input[type="radio"] {
  display: none;
}

.opt-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  transition: all 0.2s;
  background: rgba(255,255,255,0.03);
}

.insurance-opt input:checked + .opt-card {
  border-color: rgba(99,102,241,0.5);
  background: rgba(99,102,241,0.1);
}

.custom-bh-wrap {
  margin-top: 0.65rem;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 10px;
  padding: 0.85rem;
}

.custom-bh-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fcd34d;
}

.custom-hint {
  font-size: 0.72rem;
  font-weight: 400;
  color: rgba(252, 211, 77, 0.6);
}

.custom-inp {
  border-color: rgba(245, 158, 11, 0.3) !important;
}
.custom-inp:focus {
  border-color: rgba(245, 158, 11, 0.6) !important;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1) !important;
}

.opt-icon { font-size: 1.2rem; }

.opt-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #e2e8f0;
}

.opt-desc {
  font-size: 0.75rem;
  color: rgba(148,163,184,0.6);
}

.stepper {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 0.5rem 1rem;
  width: fit-content;
}

.step-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: #e2e8f0;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.step-btn:hover {
  background: rgba(99,102,241,0.2);
  border-color: rgba(99,102,241,0.4);
}

.step-val {
  font-size: 1rem;
  font-weight: 700;
  color: #e2e8f0;
  min-width: 60px;
  text-align: center;
}
</style>
