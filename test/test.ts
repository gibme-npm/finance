import { describe, it } from 'node:test';
import assert from 'assert';
import {
    calculate_apy,
    calculate_compound_interest,
    calculate_amortization_payment,
    calculate_amortization_table,
    calculate_amortization_loan,
    calculate_margin,
    calculate_markup,
    calculate_present_value_from_future_value,
    calculate_principal_from_amortization_payment,
    calculate_simple_interest,
    calculate_simple_interest_loan,
    calculate_lwma,
    calculate_sma,
    calculate_ema,
    calculate_ewma,
    calculate_cma
} from '../src/index';

describe('APY', () => {
    it('should calculate APY for monthly compounding', () => {
        const apy = calculate_apy(0.05, 'monthly');
        assert.ok(apy > 0.05, 'APY should be greater than the nominal rate');
        assert.ok(apy < 0.06, 'APY should be reasonable');
    });

    it('should calculate APY for daily compounding', () => {
        const apy = calculate_apy(0.05, 'daily');
        assert.ok(apy > calculate_apy(0.05, 'monthly'), 'Daily compounding yields higher APY than monthly');
    });

    it('should calculate APY for annually compounding', () => {
        const apy = calculate_apy(0.05, 'annually');
        assert.strictEqual(apy, 0.050000000000000044);
    });
});

describe('Compound Interest', () => {
    it('should calculate future value with monthly compounding', () => {
        const fv = calculate_compound_interest(10000, 0.05, 'monthly', 12);
        assert.ok(fv > 10000, 'Future value should be greater than principal');
        assert.ok(fv < 11000, 'Future value should be reasonable for 5% over 1 year');
    });

    it('should handle APR > 1 by converting from percentage', () => {
        const fv1 = calculate_compound_interest(10000, 5, 'monthly', 12);
        const fv2 = calculate_compound_interest(10000, 0.05, 'monthly', 12);
        assert.strictEqual(fv1, fv2);
    });

    it('should respect digits parameter', () => {
        const fv = calculate_compound_interest(10000, 0.05, 'monthly', 12, 4);
        const str = fv.toString();
        const decimals = str.includes('.') ? str.split('.')[1].length : 0;
        assert.ok(decimals <= 4);
    });
});

describe('Amortization Payment', () => {
    it('should calculate a single payment breakdown', () => {
        const payment = calculate_amortization_payment(200000, 0.06, 360);
        assert.ok(payment.payment > 0, 'Payment should be positive');
        assert.ok(payment.interest > 0, 'Interest should be positive');
        assert.ok(payment.principal > 0, 'Principal portion should be positive');
        assert.ok(payment.balance < 200000, 'Balance should decrease');
        assert.strictEqual(
            payment.payment,
            parseFloat((payment.principal + payment.interest).toFixed(2)),
            'Payment should equal principal + interest'
        );
    });

    it('should handle APR > 1 by converting from percentage', () => {
        const p1 = calculate_amortization_payment(200000, 6, 360);
        const p2 = calculate_amortization_payment(200000, 0.06, 360);
        assert.strictEqual(p1.payment, p2.payment);
    });

    it('should accept a fixed payment amount', () => {
        const payment = calculate_amortization_payment(200000, 0.06, 360, 1500);
        assert.strictEqual(payment.payment, 1500);
    });
});

describe('Amortization Table', () => {
    it('should generate a full amortization table', () => {
        const table = calculate_amortization_table(10000, 0.05, 12);
        assert.ok(table.length > 0, 'Table should not be empty');
        assert.ok(table.length > 0, 'Table should have entries');

        const last = table[table.length - 1];
        assert.strictEqual(last.balance, 0, 'Final balance should be zero');
    });

    it('should handle extra payments', () => {
        const withExtra = calculate_amortization_table(10000, 0.05, 12, [
            { month: 3, amount: 500 }
        ]);
        const withoutExtra = calculate_amortization_table(10000, 0.05, 12);
        assert.ok(withExtra.length <= withoutExtra.length, 'Extra payments should reduce or maintain term');
    });

    it('should handle extra payments with fill', () => {
        const table = calculate_amortization_table(10000, 0.05, 12, [
            { month: 1, amount: 100, fill: true }
        ]);
        const withoutExtra = calculate_amortization_table(10000, 0.05, 12);
        assert.ok(table.length < withoutExtra.length, 'Filled extra payments should reduce term');
    });

    it('should track cumulative totals correctly', () => {
        const table = calculate_amortization_table(10000, 0.05, 12);
        for (let i = 1; i < table.length; i++) {
            assert.ok(table[i].total_paid >= table[i - 1].total_paid, 'Total paid should increase');
            assert.ok(table[i].interest_paid >= table[i - 1].interest_paid, 'Interest paid should increase');
        }
    });
});

describe('Amortization Loan', () => {
    it('should calculate loan summary information', () => {
        const loan = calculate_amortization_loan(200000, 0.06, 360);
        assert.ok(loan.payment > 0);
        assert.strictEqual(loan.total_principal, 200000);
        assert.ok(loan.total_interest > 0);
        assert.ok(loan.total_amount > 200000);
        assert.strictEqual(loan.months_saved, 0, 'No extra payments means no months saved');
        assert.strictEqual(loan.interest_saved, 0, 'No extra payments means no interest saved');
    });

    it('should show savings with extra payments', () => {
        const loan = calculate_amortization_loan(200000, 0.06, 360, [
            { month: 1, amount: 200, fill: true }
        ]);
        assert.ok(loan.months_saved > 0, 'Extra payments should save months');
        assert.ok(loan.interest_saved > 0, 'Extra payments should save interest');
    });
});

describe('Margin', () => {
    it('should calculate margin correctly', () => {
        const margin = calculate_margin(50, 100);
        assert.strictEqual(margin, 0.5);
    });

    it('should handle equal cost and selling price', () => {
        assert.strictEqual(calculate_margin(100, 100), 0);
    });
});

describe('Markup', () => {
    it('should calculate markup correctly', () => {
        const markup = calculate_markup(50, 100);
        assert.strictEqual(markup, 1);
    });

    it('should handle equal cost and selling price', () => {
        assert.strictEqual(calculate_markup(100, 100), 0);
    });
});

describe('Present Value from Future Value', () => {
    it('should calculate present value', () => {
        const pv = calculate_present_value_from_future_value(10000, 0.05, 10);
        assert.ok(pv < 10000, 'Present value should be less than future value');
        assert.ok(pv > 0, 'Present value should be positive');
    });

    it('should handle APR > 1', () => {
        const pv1 = calculate_present_value_from_future_value(10000, 5, 10);
        const pv2 = calculate_present_value_from_future_value(10000, 0.05, 10);
        assert.strictEqual(pv1, pv2);
    });

    it('should return future value when years is 0', () => {
        const pv = calculate_present_value_from_future_value(10000, 0.05, 0);
        assert.strictEqual(pv, 10000);
    });
});

describe('Principal from Amortization Payment', () => {
    it('should reverse-calculate principal from payment', () => {
        const payment = calculate_amortization_payment(200000, 0.06, 360);
        const principal = calculate_principal_from_amortization_payment(payment.payment, 0.06, 360);
        assert.ok(Math.abs(principal - 200000) < 100, 'Should approximate the original principal');
    });

    it('should handle APR > 1', () => {
        const p1 = calculate_principal_from_amortization_payment(1000, 6, 360);
        const p2 = calculate_principal_from_amortization_payment(1000, 0.06, 360);
        assert.strictEqual(p1, p2);
    });
});

describe('Simple Interest', () => {
    it('should calculate future value with simple interest', () => {
        const fv = calculate_simple_interest(10000, 0.05, 12);
        assert.ok(fv > 10000, 'Future value should be greater than principal');
        assert.strictEqual(fv, 10500);
    });

    it('should handle APR > 1', () => {
        const fv1 = calculate_simple_interest(10000, 5, 12);
        const fv2 = calculate_simple_interest(10000, 0.05, 12);
        assert.strictEqual(fv1, fv2);
    });
});

describe('Simple Interest Loan', () => {
    it('should calculate loan information', () => {
        const loan = calculate_simple_interest_loan(10000, 0.05, 12);
        assert.ok(loan.payment > 0);
        assert.strictEqual(loan.months, 12);
        assert.strictEqual(loan.total_principal, 10000);
        assert.ok(loan.total_interest > 0);
        assert.ok(loan.total_amount > 10000);
    });

    it('should clamp months to 1 when <= 0', () => {
        const loan = calculate_simple_interest_loan(10000, 0.05, 0);
        assert.strictEqual(loan.months, 1);
    });
});

describe('Moving Averages', () => {
    const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    describe('LWMA', () => {
        it('should calculate linearly weighted moving average', () => {
            const result = calculate_lwma(values, 3);
            assert.ok(result.length > 0);
            assert.strictEqual(result.length, values.length - 3 + 1);
        });

        it('should throw if not enough data points', () => {
            assert.throws(() => calculate_lwma([1, 2], 5), /Not enough data points/);
        });
    });

    describe('SMA', () => {
        it('should calculate simple moving average', () => {
            const result = calculate_sma(values, 3);
            assert.ok(result.length > 0);
            assert.strictEqual(result.length, values.length - 3 + 1);
            assert.strictEqual(result[0], 20); // (10+20+30)/3
        });

        it('should throw if not enough data points', () => {
            assert.throws(() => calculate_sma([1, 2], 5), /Not enough data points/);
        });
    });

    describe('EMA', () => {
        it('should calculate exponential moving average', () => {
            const result = calculate_ema(values, 3);
            assert.ok(result.length > 0);
            assert.strictEqual(result.length, values.length - 3 + 1);
        });

        it('should throw if not enough data points', () => {
            assert.throws(() => calculate_ema([1, 2], 5), /Not enough data points/);
        });
    });

    describe('EWMA', () => {
        it('should calculate exponentially weighted moving average', () => {
            const result = calculate_ewma(values, 0.5);
            assert.strictEqual(result.length, values.length);
            assert.strictEqual(result[0], values[0]);
        });

        it('should return [0] for empty input', () => {
            const result = calculate_ewma([]);
            assert.deepStrictEqual(result, [0]);
        });
    });

    describe('CMA', () => {
        it('should calculate cumulative moving average', () => {
            const result = calculate_cma(values);
            assert.strictEqual(result.length, values.length);
            assert.strictEqual(result[0], 10); // first value
        });

        it('should return [0] for empty input', () => {
            const result = calculate_cma([]);
            assert.deepStrictEqual(result, [0]);
        });
    });
});
