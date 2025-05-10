// Copyright (c) 2023-2025, Brandon Lehmann <brandonlehmann@gmail.com>
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

import { CompoundPeriod } from './types';

/**
 * Turns a value into a fixed-length "money" with the specified number of decimals
 *
 * Note: This applies both rounding and fixes the result to the number of decimals
 *
 * @param value the value to format as 'money'
 * @param digits the number of digits to round the result to
 * @ignore
 */
export const toMoney = (value: number, digits = 2): number =>
    parseFloat((Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits)).toFixed(digits));

/**
 * Returns the `n` value based upon the compound cycle
 *
 * @param compound
 * @ignore
 */
export const get_compound_n = (compound: CompoundPeriod): Readonly<number> => {
    switch (compound) {
        case 'daily':
            return 365;
        case 'weekly':
            return 52;
        case 'biweekly':
            return 26;
        case 'semimonthly':
            return 24;
        case 'monthly':
            return 12;
        case 'bimonthly':
            return 6;
        case 'quarterly':
            return 4;
        case 'semiannually':
            return 2;
        case 'annually':
            return 1;
        case 'biannually':
            return 0.5;
    }
};
