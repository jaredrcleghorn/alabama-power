# alabama-power

[![CircleCI](https://circleci.com/gh/jaredrcleghorn/alabama-power.svg?style=shield)](https://circleci.com/gh/jaredrcleghorn/alabama-power)

Unofficial Alabama Power API client library

## Installation

```shell
npm i alabama-power
```

## Usage

```javascript
import AlabamaPower from 'alabama-power'

console.log('Current Alabama Power Bill\n')

const alabamaPower = new AlabamaPower()

alabamaPower.logIn('username', 'password')
	.then(() => alabamaPower.getAccountNumbers())
	.then(accountNumbers => alabamaPower.getCurrentBill(accountNumbers[0]))
	.then(currentBill => {
		const billingPeriod = currentBill.billingPeriod
		const amount = currentBill.amount
		const totalUsage = currentBill.totalUsage
		const averageDailyCost = (amount / currentBill.numberOfDaysInBillingPeriod).toFixed(2)

		console.log(`Billing Period: ${billingPeriod}`)
		console.log(`Amount: $${amount}`)
		console.log(`Total Usage: ${totalUsage} kWh`)
		console.log(`Average Daily Cost: $${averageDailyCost}\n`)
	})
	.catch(console.error)
```

## Contributing

You will need [Node](https://nodejs.org/). To install dependencies, move into
the project folder and run

```shell
npm i
```

To run tests, fill out the `config.json` file with your Alabama Power `username`
and `password` and then run

```shell
npm test
```
