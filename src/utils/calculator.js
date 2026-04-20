/**
 * Vietnam Salary Calculator Engine
 * Based on current Vietnamese Labor Law, Social Insurance Law, and Tax Law
 * Updated: 2025
 */

// ==================== CONSTANTS ====================
export const BHXH_RATES = {
  employee: 0.08, // BHXH người lao động: 8%
  employer: 0.175, // BHXH công ty: 17.5% (BHXH 14% + BHYT 3% + BHTN 1% = 18% nhưng tính theo quy định mới)
}

// BHXH chi tiết
export const BH_RATES = {
  // Người lao động đóng
  bhxh_employee: 0.08,   // BHXH hưu trí & tử tuất
  bhyt_employee: 0.015,  // BHYT
  bhtn_employee: 0.01,   // BHTN
  // Công ty đóng
  bhxh_employer: 0.14,   // BHXH (hưu trí + ốm đau + tai nạn)
  bhyt_employer: 0.03,   // BHYT
  bhtn_employer: 0.01,   // BHTN
  tnld_employer: 0.005,  // TNLĐ-BNN
}

// Mức lương tối thiểu vùng 2026 (VNĐ/tháng)
// Nghị định 293/2025/NĐ-CP, hiệu lực từ 01/01/2026
export const MINIMUM_WAGES = {
  1: 5310000,  // Vùng I — HN, TP.HCM
  2: 4730000,  // Vùng II
  3: 4140000,  // Vùng III
  4: 3700000,  // Vùng IV
}

// Giảm trừ gia cảnh
// Nghị quyết 110/2025/UBTVQH15: Hiệu lực từ 01/01/2026
export const TAX_DEDUCTIONS = {
  personal: 15500000,    // Bản thân: 15.5 triệu/tháng (tăng từ 11tr)
  dependent: 6200000,   // Mỗi người phụ thuộc: 6.2 triệu/tháng (tăng từ 4.4tr)
}

// Biểu thuế TNCN 7 bậc - áp dụng đến hết 30/06/2026
export const TAX_BRACKETS_7 = [
  { min: 0, max: 5000000, rate: 0.05, prevTax: 0 },
  { min: 5000000, max: 10000000, rate: 0.10, prevTax: 250000 },
  { min: 10000000, max: 18000000, rate: 0.15, prevTax: 750000 },
  { min: 18000000, max: 32000000, rate: 0.20, prevTax: 1950000 },
  { min: 32000000, max: 52000000, rate: 0.25, prevTax: 4750000 },
  { min: 52000000, max: 80000000, rate: 0.30, prevTax: 9750000 },
  { min: 80000000, max: Infinity, rate: 0.35, prevTax: 17550000 },
]

// Biểu thuế TNCN 5 bậc - Luật TNCN 2025 (Luật số 109/2025/QH15)
// Hiệu lực từ kỳ tính thuế 2026 = 01/01/2026
// Thuế suất: 5% – 10% – 20% – 30% – 35%
export const TAX_BRACKETS_5 = [
  { min: 0, max: 10000000, rate: 0.05, prevTax: 0 },
  { min: 10000000, max: 30000000, rate: 0.10, prevTax: 500000 },
  { min: 30000000, max: 60000000, rate: 0.20, prevTax: 2500000 },
  { min: 60000000, max: 100000000, rate: 0.30, prevTax: 8500000 },
  { min: 100000000, max: Infinity, rate: 0.35, prevTax: 20500000 },
]

// Hiệu lực biểu thuế 5 bậc từ kỳ tính thuế 2026
const DATE_5_BRACKET = new Date('2026-01-01')

// Legacy alias
export const TAX_BRACKETS = TAX_BRACKETS_7

/**
 * Tính thuế TNCN từ thu nhập tính thuế.
 * Tự chọn biểu thuế theo ngày hiện tại:
 *   - Trước 01/07/2026: biểu 7 bậc (Thông tư 111/2013)
 *   - Từ 01/07/2026: biểu 5 bậc (Luật TNCN 2025)
 * Giảm trừ gia cảnh mới (Nghị quyết 110/2025) đã áp dụng từ 01/01/2026.
 */
export function calculatePIT(taxableIncome) {
  if (taxableIncome <= 0) return 0
  const brackets = new Date() >= DATE_5_BRACKET ? TAX_BRACKETS_5 : TAX_BRACKETS_7
  let tax = 0
  for (const bracket of brackets) {
    if (taxableIncome > bracket.min) {
      const taxable = Math.min(taxableIncome, bracket.max) - bracket.min
      tax = bracket.prevTax + taxable * bracket.rate
    }
  }
  return Math.max(0, Math.round(tax))
}

/**
 * Tính chi tiết cho 1 offer
 * @param {Object} params
 * @param {number} params.salary - Lương (số tiền)
 * @param {'gross'|'net'} params.salaryType - Loại lương
 * @param {'full'|'minimum'|'custom'|'none'} params.insuranceType - Loại bảo hiểm
 * @param {number} [params.customBhBase] - Mức lương đóng BH tùy chỉnh (khi insuranceType='custom')
 * @param {number} params.region - Vùng (1-4)
 * @param {number} params.dependents - Số người phụ thuộc
 * @param {number} params.bonusMonth - Tháng lương thưởng/năm (0-5)
 * @param {string} params.label - Nhãn offer
 */
export function calculateOffer(params) {
  const {
    salary,
    salaryType = 'gross',
    insuranceType = 'full',
    customBhBase = 0,
    region = 1,
    dependents = 0,
    bonusMonth = 0,
    label = '',
  } = params

  const minWage = MINIMUM_WAGES[region] || MINIMUM_WAGES[1]

  // Xác định mức đóng Bảo hiểm
  let bhBase  // Mức lương cơ sở để đóng BH
  if (insuranceType === 'full') {
    // Đóng full: BH tính trên toàn bộ lương gross
    // (sẽ xác định gross trước, rồi dùng gross làm bhBase)
    bhBase = null // sẽ set sau
  } else if (insuranceType === 'minimum') {
    bhBase = minWage
  } else if (insuranceType === 'custom') {
    // Custom: dùng giá trị người dùng nhập, tối thiểu = lương tối thiểu vùng
    bhBase = Math.max(minWage, customBhBase || minWage)
  } else {
    // none
    bhBase = 0
  }

  // Employee BH rates
  const eBhxh = BH_RATES.bhxh_employee  // 8%
  const eBhyt = BH_RATES.bhyt_employee  // 1.5%
  const eBhtn = BH_RATES.bhtn_employee  // 1%
  const totalEmployeeRate = eBhxh + eBhyt + eBhtn // 10.5%

  // Employer BH rates
  const cBhxh = BH_RATES.bhxh_employer   // 14%
  const cBhyt = BH_RATES.bhyt_employer   // 3%
  const cBhtn = BH_RATES.bhtn_employer   // 1%
  const cTnld = BH_RATES.tnld_employer   // 0.5%
  const totalEmployerRate = cBhxh + cBhyt + cBhtn + cTnld // 18.5%

  let gross, net, pit
  let bhEmployee, bhEmployer  // tổng BH NLĐ và công ty đóng

  if (salaryType === 'gross') {
    gross = salary

    if (insuranceType === 'full') bhBase = gross
    // custom: clamp bhBase to [minWage, gross] so it never exceeds actual gross
    if (insuranceType === 'custom') bhBase = Math.min(bhBase, gross)

    bhEmployee = bhBase * totalEmployeeRate
    const bhxhEmployee = bhBase * eBhxh
    const bhytEmployee = bhBase * eBhyt
    const bhtnEmployee = bhBase * eBhtn

    // Thu nhập tính thuế = Gross - BH NLĐ - Giảm trừ cá nhân - Giảm trừ người phụ thuộc
    const personalDeduction = TAX_DEDUCTIONS.personal
    const dependentDeduction = TAX_DEDUCTIONS.dependent * dependents
    const taxableIncome = Math.max(0, gross - bhEmployee - personalDeduction - dependentDeduction)

    pit = calculatePIT(taxableIncome)
    net = gross - bhEmployee - pit

    bhEmployer = bhBase * totalEmployerRate

    return buildResult({
      label, gross, net, pit, bhBase, insuranceType,
      bhEmployee, bhEmployer,
      bhxhEmployee: bhBase * eBhxh,
      bhytEmployee: bhBase * eBhyt,
      bhtnEmployee: bhBase * eBhtn,
      bhxhEmployer: bhBase * cBhxh,
      bhytEmployer: bhBase * cBhyt,
      bhtnEmployer: bhBase * cBhtn,
      tnldEmployer: bhBase * cTnld,
      personalDeduction, dependentDeduction,
      taxableIncome, dependents, bonusMonth, minWage,
    })

  } else {
    // Net → tìm ngược Gross
    // Net = Gross - BH_NLĐ(bhBase) - PIT(Gross, bhBase)
    // Nếu full: bhBase = Gross → cần giải phương trình
    // Nếu minimum: bhBase = minWage → cố định

    const personalDeduction = TAX_DEDUCTIONS.personal
    const dependentDeduction = TAX_DEDUCTIONS.dependent * dependents

    if (insuranceType === 'minimum' || insuranceType === 'none' || insuranceType === 'custom') {
      if (insuranceType === 'minimum') bhBase = minWage
      else if (insuranceType === 'none') bhBase = 0
      // custom: bhBase already set above (Math.max(minWage, customBhBase))
      const bhFixed = bhBase * totalEmployeeRate

      // Gross = Net + bhFixed + PIT(Gross)
      // Giải bằng binary search
      gross = netToGross(salary, bhFixed, personalDeduction + dependentDeduction)

      bhEmployee = bhFixed
      pit = calculatePIT(Math.max(0, gross - bhFixed - personalDeduction - dependentDeduction))
      net = salary // đúng là net target

      bhEmployer = bhBase * totalEmployerRate

      return buildResult({
        label, gross, net, pit, bhBase, insuranceType,
        bhEmployee,
        bhEmployer,
        bhxhEmployee: bhBase * eBhxh,
        bhytEmployee: bhBase * eBhyt,
        bhtnEmployee: bhBase * eBhtn,
        bhxhEmployer: bhBase * cBhxh,
        bhytEmployer: bhBase * cBhyt,
        bhtnEmployer: bhBase * cBhtn,
        tnldEmployer: bhBase * cTnld,
        personalDeduction, dependentDeduction,
        taxableIncome: Math.max(0, gross - bhFixed - personalDeduction - dependentDeduction),
        dependents, bonusMonth, minWage,
      })
    } else {
      // full: bhBase = gross
      // Net = Gross - Gross*10.5% - PIT(Gross - Gross*10.5% - deductions)
      // = Gross*(1-0.105) - PIT(Gross*0.895 - deductions)
      const deductions = personalDeduction + dependentDeduction

      // Binary search gross
      gross = netToGrossFullBH(salary, totalEmployeeRate, deductions)
      bhBase = gross
      bhEmployee = gross * totalEmployeeRate
      pit = calculatePIT(Math.max(0, gross - bhEmployee - deductions))
      net = gross - bhEmployee - pit
      bhEmployer = gross * totalEmployerRate

      return buildResult({
        label, gross, net, pit, bhBase, insuranceType,
        bhEmployee,
        bhEmployer,
        bhxhEmployee: bhBase * eBhxh,
        bhytEmployee: bhBase * eBhyt,
        bhtnEmployee: bhBase * eBhtn,
        bhxhEmployer: bhBase * cBhxh,
        bhytEmployer: bhBase * cBhyt,
        bhtnEmployer: bhBase * cBhtn,
        tnldEmployer: bhBase * cTnld,
        personalDeduction, dependentDeduction,
        taxableIncome: Math.max(0, gross - bhEmployee - deductions),
        dependents, bonusMonth, minWage,
      })
    }
  }
}

/**
 * Tìm Gross từ Net với BH cố định (binary search)
 */
function netToGross(targetNet, fixedBH, deductions) {
  let lo = targetNet, hi = targetNet * 3
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2
    const taxable = Math.max(0, mid - fixedBH - deductions)
    const pit = calculatePIT(taxable)
    const net = mid - fixedBH - pit
    if (Math.abs(net - targetNet) < 1) break
    if (net < targetNet) lo = mid
    else hi = mid
  }
  return Math.round((lo + hi) / 2)
}

/**
 * Tìm Gross từ Net với BH full (bhBase = gross)
 */
function netToGrossFullBH(targetNet, employeeBHRate, deductions) {
  let lo = targetNet, hi = targetNet * 3
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2
    const bh = mid * employeeBHRate
    const taxable = Math.max(0, mid - bh - deductions)
    const pit = calculatePIT(taxable)
    const net = mid - bh - pit
    if (Math.abs(net - targetNet) < 1) break
    if (net < targetNet) lo = mid
    else hi = mid
  }
  return Math.round((lo + hi) / 2)
}

/**
 * Build kết quả chi tiết
 */
function buildResult(data) {
  const {
    label, gross, net, pit, bhBase, insuranceType,
    bhEmployee, bhEmployer,
    bhxhEmployee, bhytEmployee, bhtnEmployee,
    bhxhEmployer, bhytEmployer, bhtnEmployer, tnldEmployer,
    personalDeduction, dependentDeduction, taxableIncome,
    dependents, bonusMonth, minWage,
  } = data

  // Tổng chi phí công ty thực chi
  const totalCostForEmployer = gross + bhEmployer

  // Tổng giá trị thực nhận hàng tháng (tiền mặt + tích lũy BH)
  // Tích lũy BHXH hưu trí = NLĐ 8% + Công ty 14% = 22% bhBase
  const bhxhAccumulation = bhBase * (BH_RATES.bhxh_employee + BH_RATES.bhxh_employer) // 22%
  const bhtnAccumulation = bhBase * (BH_RATES.bhtn_employee + BH_RATES.bhtn_employer) // 2%

  // Tổng giá trị = Net + BHXH tích lũy (hưu trí) + BHTN tích lũy
  const totalMonthlyValue = net + bhxhAccumulation + bhtnAccumulation

  // Bonus hàng năm (thưởng lương)
  const annualBonus = net * bonusMonth / 12 // quy về tháng

  // Giá trị năm (x12 tháng + bonus)
  const annualTakeHome = net * 12 + net * bonusMonth
  const annualBhxh = bhxhAccumulation * 12
  const annualBhtn = bhtnAccumulation * 12
  const annualTotalValue = annualTakeHome + annualBhxh + annualBhtn

  // Thuế TNCN năm
  const annualPIT = pit * 12

  return {
    label,
    // Input
    gross: Math.round(gross),
    net: Math.round(net),
    bhBase: Math.round(bhBase),
    insuranceType,
    dependents,
    bonusMonth,
    minWage,

    // BH chi tiết
    bhEmployee: Math.round(bhEmployee),
    bhEmployer: Math.round(bhEmployer),
    bhxhEmployee: Math.round(bhxhEmployee),
    bhytEmployee: Math.round(bhytEmployee),
    bhtnEmployee: Math.round(bhtnEmployee),
    bhxhEmployer: Math.round(bhxhEmployer),
    bhytEmployer: Math.round(bhytEmployer),
    bhtnEmployer: Math.round(bhtnEmployer),
    tnldEmployer: Math.round(tnldEmployer),

    // Thuế
    personalDeduction: Math.round(personalDeduction),
    dependentDeduction: Math.round(dependentDeduction),
    taxableIncome: Math.round(taxableIncome),
    pit: Math.round(pit),
    annualPIT: Math.round(annualPIT),

    // Tổng giá trị
    bhxhAccumulation: Math.round(bhxhAccumulation),
    bhtnAccumulation: Math.round(bhtnAccumulation),
    totalMonthlyValue: Math.round(totalMonthlyValue),
    totalCostForEmployer: Math.round(totalCostForEmployer),

    // Năm
    annualTakeHome: Math.round(annualTakeHome),
    annualBhxh: Math.round(annualBhxh),
    annualBhtn: Math.round(annualBhtn),
    annualTotalValue: Math.round(annualTotalValue),
  }
}

/**
 * Format số VNĐ
 */
export function formatVND(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n) {
  if (!n) return '0'
  return new Intl.NumberFormat('vi-VN').format(Math.round(n))
}

/**
 * Tìm mức lương cần deal để tổng giá trị bằng mức tham chiếu
 * @param {Object} referenceResult - Kết quả tính của offer tham chiếu
 * @param {Object} targetParams - Params của offer mới (không có salary)
 * @returns {Object} breakeven - Mức lương và kết quả hòa vốn
 */
export function findBreakEven(referenceResult, targetParams) {
  const targetTotal = referenceResult.totalMonthlyValue

  let lo = targetTotal * 0.5
  let hi = targetTotal * 3

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    const result = calculateOffer({ ...targetParams, salary: mid })
    if (Math.abs(result.totalMonthlyValue - targetTotal) < 100) {
      return { salary: mid, result }
    }
    if (result.totalMonthlyValue < targetTotal) lo = mid
    else hi = mid
  }

  const finalSalary = (lo + hi) / 2
  return { salary: finalSalary, result: calculateOffer({ ...targetParams, salary: finalSalary }) }
}
