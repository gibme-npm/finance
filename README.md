# @gibme/finance

A simple collection of financial equations for Node.js and the browser.

## Documentation

[https://gibme-npm.github.io/finance/](https://gibme-npm.github.io/finance/)

## Requirements

- Node.js >= 22

## Installation

```bash
npm install @gibme/finance
```

```bash
yarn add @gibme/finance
```

## Features

### Amortization

- **Payment** - Calculate monthly payment breakdown (principal, interest, balance)
- **Table** - Generate a full amortization schedule with optional extra payment support
- **Loan Information** - Summarize total interest, savings from extra payments, and effective rates
- **Principal from Payment** - Reverse-calculate the loan principal given a known payment amount

### Interest

- **Annual Percentage Yield (APY)** - Convert a nominal rate to its effective annual yield given a compounding period
- **Compound Interest** - Calculate the future value of a principal using the compound interest formula
- **Simple Interest** - Calculate the future value of a principal using the simple interest formula
- **Simple Interest Loan** - Summarize payment, total interest, and effective rate for a simple interest loan

### Pricing

- **Margin** - Calculate the margin on a product given cost and selling price
- **Markup** - Calculate the markup on a product given cost and selling price

### Valuation

- **Present Value from Future Value** - Discount a future value back to its present value at a constant rate

### Moving Averages

- **SMA** - Simple Moving Average
- **EMA** - Exponential Moving Average
- **LWMA** - Linearly Weighted Moving Average
- **EWMA** - Exponentially Weighted Moving Average
- **CMA** - Cumulative Moving Average

## Usage

```typescript
import {
    calculate_amortization_loan,
    calculate_compound_interest,
    calculate_apy,
    calculate_sma
} from '@gibme/finance';

// 30-year mortgage at 6% with $200 extra/month starting month 1
const loan = calculate_amortization_loan(200000, 0.06, 360, [
    { month: 1, amount: 200, fill: true }
]);
console.log(loan.payment);        // monthly payment
console.log(loan.months_saved);    // months saved by extra payments
console.log(loan.interest_saved);  // interest saved by extra payments

// Compound interest: $10,000 at 5% compounded monthly for 5 years
const futureValue = calculate_compound_interest(10000, 0.05, 'monthly', 60);
console.log(futureValue);

// APY for 5% compounded daily
const apy = calculate_apy(0.05, 'daily');
console.log(apy);

// Simple moving average with a 3-period window
const sma = calculate_sma([10, 20, 30, 40, 50], 3);
console.log(sma); // [20, 30, 40]
```

### Compounding Periods

The following compounding periods are supported wherever a `CompoundPeriod` is accepted:

`daily` | `weekly` | `biweekly` | `semimonthly` | `monthly` | `bimonthly` | `quarterly` | `semiannually` | `annually` | `biannually`

### APR Handling

Functions that accept an `apr` parameter will automatically convert values greater than 1 to a decimal (e.g. `5` becomes `0.05`). You can pass either form.

## License

MIT
