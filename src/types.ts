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

export interface AmortizationPayment {
    /**
     * The payment amount
     */
    payment: number;
    /**
     * The amount of interest included in the payment amount
     */
    interest: number;
    /**
     * The amount of principal included in the payment amount
     */
    principal: number;
    /**
     * The new balance after the payment has been made
     */
    balance: number;

    [key: string]: number;
}

export interface AmortizationTablePaymentEntry extends AmortizationPayment {
    /**
     * The month number of the payment
     */
    month: number;
    /**
     * The total amount paid at this point in the loan
     */
    total_paid: number;
    /**
     * The total principal paid at this point in the loan
     */
    principal_paid: number;
    /**
     * The total interest paid at this point in the loan
     */
    interest_paid: number;
    /**
     * The amount of extra principal applied this payment cycle
     */
    extra_principal: number;
}

export interface ExtraPaymentInformation {
    /**
     * The extra amount to pay
     */
    amount: number;
    /**
     * Pay the extra amount in this month
     */
    month: number;
    /**
     * If set to true, will automatically fill the remainder of the loan with the amount specified
     * starting with the month specified. To override in the future, supply an additional amount (or 0)
     * with the `fill` set to `true` on it
     */
    fill?: boolean;
}

export interface SimpleInterestLoan {
    /**
     * The amount of the payment
     */
    payment: number;
    /**
     * The number of months for the loan
     */
    months: number;
    /**
     * The total principal paid
     */
    total_principal: number;
    /**
     * The total interest paid
     */
    total_interest: number;
    /**
     * The total amount paid
     */
    total_amount: number;
    /**
     * The effective interest rate paid over the entire life of the loan
     */
    interest: number;

    [key: string]: number;
}

export interface AmortizationLoan extends SimpleInterestLoan {
    /**
     * The unadjusted total interest as if no extra payments were supplied
     */
    unadjusted_total_interest: number;
    /**
     * The unadjusted total amount paid as if no extra payments were supplied
     */
    unadjusted_total_amount: number;
    /**
     * The effective interest rate paid over the entire life of the loan as if no extra payments were supplied
     */
    unadjusted_interest: number;
    /**
     * The number of months saved (if extra payments were supplied)
     */
    months_saved: number;
    /**
     * The amount of interest saved (if extra payments were supplied)
     */
    interest_saved: number;
}

/**
 * Acceptable compounding periods
 */
export type CompoundPeriod = 'daily' | 'weekly' | 'biweekly' | 'semimonthly' |
    'monthly' | 'bimonthly' | 'quarterly' | 'semiannually' | 'annually' | 'biannually';
