export interface SlabDetail {
  slab: string;
  rate: string;
  taxable_in_slab: number;
  tax_in_slab: number;
}

export interface RegimeResult {
  regime: string;
  gross_salary: number;
  standard_deduction: number;
  hra_exemption: number;
  sec_80c: number;
  sec_80d: number;
  home_loan_interest: number;
  total_deductions: number;
  taxable_income: number;
  slab_breakdown: SlabDetail[];
  base_tax: number;
  rebate_87a: number;
  tax_after_rebate: number;
  cess: number;
  final_tax: number;
}

export interface TaxResponse {
  old_regime: RegimeResult;
  new_regime: RegimeResult;
  recommended_regime: string;
  tax_saved: number;
}

export interface TaxInput {
  gross_salary: number;
  hra: number;
  sec_80c: number;
  sec_80d: number;
  home_loan_interest: number;
}
