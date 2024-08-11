// Copyright (c) 2023-2024, Brandon Lehmann <brandonlehmann@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import {
    AmortizationPayment,
    ExtraPaymentInformation,
    AmortizationTablePaymentEntry,
    AmortizationLoan,
    CompoundPeriod,
    SimpleInterestLoan
} from './types';
import { toMoney, get_compound_n } from './helpers';
export * from './types';

/**
 * Calculates the Annual Percentage Yield (APY) given the rate and the
 * compounding period
 *
 * @param apr the annual percentage rate
 * @param compound the compounding period
 */
export const calculate_apy = (
    apr: number,
    compound: CompoundPeriod
): Readonly<number> => {
    const n = get_compound_n(compound);

    return Math.pow(1 + (apr / n), n) - 1;
};

/**
 * Calculates the `future value` of the principal amount given the specified
 * rate, the compounding cycle, and the number of months in which the principal
 * is accruing interest using the compound interest formula
 *
 * @param principal the starting principal
 * @param apr the annual percentage rate
 * @param compound the compounding period
 * @param months the number of months in which the principal is held
 * @param digits the number of digits to round the result to
 */
export const calculate_compound_interest = (
    principal: number,
    apr: number,
    compound: CompoundPeriod,
    months: number,
    digits = 2
): Readonly<number> => {
    if (apr > 1) {
        apr /= 100;
    }

    const n = get_compound_n(compound);

    const t = months / 12; // years

    return toMoney(principal * Math.pow(1 + (apr / n), n * t), digits);
};

/**
 * Calculates the payment, interest portion of that payment, principal portion of that payment,
 * and remaining balance after that payment of an amortization loan
 *
 * @param principal the starting principal of the loan
 * @param apr the interest rate of the loan
 * @param months the number of months for the loan
 * @param fixed_payment if provided, uses a fixed monthly payment amount. This is useful for mortgage-style
 * calculations wherein the monthly payment remains the same for the length of the loan. This differs from
 * something like a revolving credit balance where the payment can change every month.
 * @param digits the number of digits to round the result to
 */
export const calculate_amortization_payment = (
    principal: number,
    apr: number,
    months: number,
    fixed_payment?: number,
    digits = 2
): Readonly<AmortizationPayment> => {
    if (apr > 1) {
        apr /= 100;
    }

    const ir = apr / 12;

    const M = fixed_payment ?? (principal * ir * Math.pow(1 + ir, months)) / (Math.pow(1 + ir, months) - 1);

    const I = (principal * apr) / 12;

    const result: AmortizationPayment = {
        payment: toMoney(M, digits),
        principal: 0,
        interest: toMoney(I, digits),
        balance: principal
    };

    result.principal = toMoney(result.payment - result.interest, digits);
    result.balance = toMoney(result.balance - result.principal, digits);

    if (result.balance < 0) {
        result.payment = toMoney(result.payment - Math.abs(result.balance), digits);
        result.principal = toMoney(result.principal - Math.abs(result.balance), digits);
        result.balance = 0;
    }

    if (isNaN(result.payment)) {
        result.payment = toMoney(principal + result.interest, digits);
    }

    return result;
};

/**
 * Calculates the amortization table given the supplied principal, interest rate, number of months
 * of the loan, and any additional extra monthly payment information
 *
 * @param principal the starting principal of the loan
 * @param apr the interest rate of the loan
 * @param months the number of months for the loan
 * @param extra_monthly_payments an array of extra payments made towards the loan
 * @param fixed_payment if set to false, will allow the monthly payment to reduce over time, otherwise it
 * remains fixed like a mortgage-style loan
 * @param digits the number of digits to round the result to
 */
export const calculate_amortization_table = (
    principal: number,
    apr: number,
    months: number,
    extra_monthly_payments: ExtraPaymentInformation[] = [],
    fixed_payment = true,
    digits = 2
): Readonly<AmortizationTablePaymentEntry>[] => {
    extra_monthly_payments = extra_monthly_payments.sort((a, b) =>
        a.month - b.month);
    const extra_amounts = new Map<number, number>();

    extra_monthly_payments.forEach(extra => {
        extra_amounts.set(extra.month, extra.amount);

        if (extra.fill) {
            for (let i = extra.month; i < months; ++i) {
                extra_amounts.set(i, extra.amount);
            }
        }
    });

    const result: AmortizationTablePaymentEntry[] = [];

    let payment_number = 0;
    let fixed_payment_amount: number | undefined;
    let total_paid = 0;
    let principal_paid = 0;
    let interest_paid = 0;

    do {
        const payment_info = calculate_amortization_payment(
            principal, apr, months - payment_number, fixed_payment_amount, digits);

        total_paid = toMoney(total_paid + payment_info.payment, digits);
        principal_paid = toMoney(principal_paid + payment_info.payment, digits);
        interest_paid = toMoney(interest_paid + payment_info.interest, digits);

        const row: AmortizationTablePaymentEntry = {
            month: ++payment_number,
            payment: payment_info.payment,
            principal: payment_info.principal,
            extra_principal: 0,
            interest: payment_info.interest,
            total_paid,
            principal_paid,
            interest_paid,
            balance: payment_info.balance
        };

        principal = payment_info.balance;

        const extra_amount = extra_amounts.get(row.month);

        if (extra_amount) {
            row.extra_principal = extra_amount;
            row.balance = toMoney(row.balance - extra_amount, digits);
            principal = toMoney(principal - extra_amount, digits);
        }

        if (row.balance < 0 && extra_amount) {
            row.extra_principal = toMoney(row.extra_principal - Math.abs(row.balance), digits);
            row.balance = 0;
        }

        if (!fixed_payment_amount && fixed_payment) {
            fixed_payment_amount = payment_info.payment;
        }

        result.push(row);
    } while (principal > 0);

    return result;
};

/**
 * Calculates loan information using the amortization formula
 *
 * Note: This is akin to a mortgage calculator
 *
 * @param principal the starting principal of the loan
 * @param apr the interest rate of the loan
 * @param months the number of months for the loan
 * @param extra_monthly_payments an array of extra payments made towards the loan
 * @param fixed_payment if set to false, will allow the monthly payment to reduce over time, otherwise it
 * remains fixed like a mortgage-style loan
 * @param digits the number of digits to round the result to
 */
export const calculate_amortization_loan = (
    principal: number,
    apr: number,
    months: number,
    extra_monthly_payments: ExtraPaymentInformation[] = [],
    fixed_payment = true,
    digits = 2
): Readonly<AmortizationLoan> => {
    const base = calculate_amortization_table(
        principal, apr, months, [], fixed_payment, digits).pop();

    const adjusted_table = calculate_amortization_table(
        principal, apr, months, extra_monthly_payments, fixed_payment, digits);

    const adjusted = adjusted_table.pop();

    const first = adjusted_table.shift() ?? adjusted;

    if (!base || !adjusted || !first) {
        throw new Error('An error occurred');
    }

    return {
        payment: first.payment,
        months: adjusted.month,
        total_principal: principal,
        total_interest: adjusted.interest_paid,
        total_amount: toMoney(adjusted.interest_paid + principal, digits),
        interest: adjusted.interest_paid / principal,
        months_saved: base.month - adjusted.month,
        interest_saved: toMoney(base.interest_paid - adjusted.interest_paid, digits),
        unadjusted_total_interest: base.interest_paid,
        unadjusted_total_amount: toMoney(base.interest_paid + principal, digits),
        unadjusted_interest: base.interest_paid / principal
    };
};

/**
 * Calculate the markup on a product
 *
 * @param cost the cost of the product
 * @param selling_price the selling price of the product
 */
export const calculate_margin = (
    cost: number,
    selling_price: number
): Readonly<number> => {
    return (selling_price - cost) / selling_price;
};

/**
 * Calculate the margin on a product
 *
 * @param cost the cost of the product
 * @param selling_price the selling price of the product
 */
export const calculate_markup = (
    cost: number,
    selling_price: number
): Readonly<number> => {
    return (selling_price - cost) / cost;
};

/**
 * Calculate the present value of a future value with a constant rate of return over a number of years
 *
 * @param future_value the future value amount
 * @param apr the annual percentage rate
 * @param years the number of years until the future value
 * @param digits the number of digits to round the result to
 */
export const calculate_present_value_from_future_value = (
    future_value: number,
    apr: number,
    years: number,
    digits = 2
): Readonly<number> => {
    if (apr > 1) {
        apr /= 100;
    }

    return toMoney(future_value / Math.pow(1 + apr, years), digits);
};

/**
 * Calculates the initial principal balance given the payment amount, the interest rate, and the number of months
 * of the loan
 *
 * @param payment the monthly payment amount on the loan
 * @param apr the interest rate of the loan
 * @param months the number of months for the loan
 * @param digits the number of digits to round the result to
 */
export const calculate_principal_from_amortization_payment = (
    payment: number,
    apr: number,
    months: number,
    digits = 2
): Readonly<number> => {
    if (apr > 1) {
        apr /= 100;
    }

    const ir = apr / 12;

    return toMoney((payment * (1 - Math.pow((1 + ir), -months))) / ir, digits);
};

/**
 * Calculates the `future value` of the principal amount given the specified
 * rate and the number of months in which the principal is accruing interest
 * using the simple interest formula
 *
 * @param principal the starting principal
 * @param apr the annual percentage rate
 * @param months the number of months in which the principal is held
 * @param digits the number of digits to round the result to
 */
export const calculate_simple_interest = (
    principal: number,
    apr: number,
    months: number,
    digits = 2
): Readonly<number> => {
    if (apr > 1) {
        apr /= 100;
    }

    const ir = apr / 12;

    return toMoney(principal + (principal * ir * months), digits);
};

/**
 * Calculates loan information using the simple interest formula
 *
 * @param principal
 * @param apr
 * @param months
 * @param digits
 */
export const calculate_simple_interest_loan = (
    principal: number,
    apr: number,
    months: number,
    digits = 2
): Readonly<SimpleInterestLoan> => {
    if (months <= 0) {
        months = 1;
    }

    const loan = calculate_simple_interest(principal, apr, months, digits);

    return {
        payment: toMoney(loan / months, 2),
        months,
        total_principal: principal,
        total_interest: toMoney(loan - principal, digits),
        total_amount: loan,
        interest: (loan - principal) / principal
    };
};

export default {
    calculate_amortization_loan,
    calculate_amortization_payment,
    calculate_amortization_table,
    calculate_apy,
    calculate_compound_interest,
    calculate_margin,
    calculate_markup,
    calculate_present_value_from_future_value,
    calculate_principal_from_amortization_payment,
    calculate_simple_interest,
    calculate_simple_interest_loan
};
