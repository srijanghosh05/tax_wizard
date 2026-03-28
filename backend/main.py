from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

app = FastAPI(title="Tax Wizard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TaxInput(BaseModel):
    gross_salary: float = Field(..., ge=0, description="Gross annual salary")
    hra: float = Field(0, ge=0, description="House Rent Allowance exemption claimed")
    sec_80c: float = Field(0, ge=0, description="Section 80C deductions (PPF, ELSS, etc.)")
    sec_80d: float = Field(0, ge=0, description="Section 80D deductions (Health Insurance)")
    home_loan_interest: float = Field(0, ge=0, description="Home Loan Interest (Sec 24b)")


class SlabDetail(BaseModel):
    slab: str
    rate: str
    taxable_in_slab: float
    tax_in_slab: float


class RegimeResult(BaseModel):
    regime: str
    gross_salary: float
    standard_deduction: float
    hra_exemption: float
    sec_80c: float
    sec_80d: float
    home_loan_interest: float
    total_deductions: float
    taxable_income: float
    slab_breakdown: list[SlabDetail]
    base_tax: float
    rebate_87a: float
    tax_after_rebate: float
    cess: float
    final_tax: float


class TaxResponse(BaseModel):
    old_regime: RegimeResult
    new_regime: RegimeResult
    recommended_regime: str
    tax_saved: float


def calculate_old_regime(data: TaxInput) -> RegimeResult:
    """Calculate tax under Old Regime for FY 2026-27."""
    gross = data.gross_salary

    # Deductions
    standard_deduction = min(50_000, gross)
    hra_exemption = data.hra
    sec_80c = min(data.sec_80c, 150_000)  # Capped at 1.5L
    sec_80d = data.sec_80d
    home_loan = min(data.home_loan_interest, 200_000)  # Sec 24b cap

    total_deductions = standard_deduction + hra_exemption + sec_80c + sec_80d + home_loan
    taxable_income = max(0, gross - total_deductions)

    # Old Regime Slabs
    slabs = [
        (250_000, 0.00, "₹0 - ₹2,50,000"),
        (250_000, 0.05, "₹2,50,001 - ₹5,00,000"),
        (500_000, 0.20, "₹5,00,001 - ₹10,00,000"),
        (float("inf"), 0.30, "Above ₹10,00,000"),
    ]

    base_tax = 0
    remaining = taxable_income
    slab_breakdown = []

    for limit, rate, label in slabs:
        taxable_in_slab = min(remaining, limit)
        tax_in_slab = taxable_in_slab * rate
        slab_breakdown.append(SlabDetail(
            slab=label,
            rate=f"{int(rate * 100)}%",
            taxable_in_slab=round(taxable_in_slab, 2),
            tax_in_slab=round(tax_in_slab, 2),
        ))
        base_tax += tax_in_slab
        remaining -= taxable_in_slab
        if remaining <= 0:
            break

    # Sec 87A rebate: if taxable income <= 5L, tax = 0
    rebate = base_tax if taxable_income <= 500_000 else 0
    tax_after_rebate = max(0, base_tax - rebate)

    # 4% Health & Education Cess
    cess = round(tax_after_rebate * 0.04, 2)
    final_tax = round(tax_after_rebate + cess, 2)

    return RegimeResult(
        regime="Old Regime",
        gross_salary=gross,
        standard_deduction=standard_deduction,
        hra_exemption=hra_exemption,
        sec_80c=sec_80c,
        sec_80d=sec_80d,
        home_loan_interest=home_loan,
        total_deductions=total_deductions,
        taxable_income=taxable_income,
        slab_breakdown=slab_breakdown,
        base_tax=round(base_tax, 2),
        rebate_87a=round(rebate, 2),
        tax_after_rebate=round(tax_after_rebate, 2),
        cess=cess,
        final_tax=final_tax,
    )


def calculate_new_regime(data: TaxInput) -> RegimeResult:
    """Calculate tax under New Regime for FY 2026-27."""
    gross = data.gross_salary

    # Only standard deduction allowed in new regime
    standard_deduction = min(75_000, gross)
    total_deductions = standard_deduction
    taxable_income = max(0, gross - total_deductions)

    # New Regime Slabs
    slabs = [
        (400_000, 0.00, "₹0 - ₹4,00,000"),
        (400_000, 0.05, "₹4,00,001 - ₹8,00,000"),
        (400_000, 0.10, "₹8,00,001 - ₹12,00,000"),
        (400_000, 0.15, "₹12,00,001 - ₹16,00,000"),
        (400_000, 0.20, "₹16,00,001 - ₹20,00,000"),
        (400_000, 0.25, "₹20,00,001 - ₹24,00,000"),
        (float("inf"), 0.30, "Above ₹24,00,000"),
    ]

    base_tax = 0
    remaining = taxable_income
    slab_breakdown = []

    for limit, rate, label in slabs:
        taxable_in_slab = min(remaining, limit)
        tax_in_slab = taxable_in_slab * rate
        slab_breakdown.append(SlabDetail(
            slab=label,
            rate=f"{int(rate * 100)}%",
            taxable_in_slab=round(taxable_in_slab, 2),
            tax_in_slab=round(tax_in_slab, 2),
        ))
        base_tax += tax_in_slab
        remaining -= taxable_in_slab
        if remaining <= 0:
            break

    # Sec 87A rebate: if taxable income <= 12L, tax = 0
    rebate = base_tax if taxable_income <= 1_200_000 else 0
    tax_after_rebate = max(0, base_tax - rebate)

    # 4% Health & Education Cess
    cess = round(tax_after_rebate * 0.04, 2)
    final_tax = round(tax_after_rebate + cess, 2)

    return RegimeResult(
        regime="New Regime",
        gross_salary=gross,
        standard_deduction=standard_deduction,
        hra_exemption=0,
        sec_80c=0,
        sec_80d=0,
        home_loan_interest=0,
        total_deductions=total_deductions,
        taxable_income=taxable_income,
        slab_breakdown=slab_breakdown,
        base_tax=round(base_tax, 2),
        rebate_87a=round(rebate, 2),
        tax_after_rebate=round(tax_after_rebate, 2),
        cess=cess,
        final_tax=final_tax,
    )


@app.post("/calculate-tax", response_model=TaxResponse)
async def calculate_tax(data: TaxInput):
    old = calculate_old_regime(data)
    new = calculate_new_regime(data)

    if old.final_tax <= new.final_tax:
        recommended = "Old Regime"
        saved = round(new.final_tax - old.final_tax, 2)
    else:
        recommended = "New Regime"
        saved = round(old.final_tax - new.final_tax, 2)

    return TaxResponse(
        old_regime=old,
        new_regime=new,
        recommended_regime=recommended,
        tax_saved=saved,
    )


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Tax Wizard API"}
