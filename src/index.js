import fetch from 'node-fetch'
import querystring from 'querystring'

export default class AlabamaPower {
	#jwt

	logIn(username, password) {
		this.#jwt = fetch('https://webauth.southernco.com/account/login')
			.then(response => response.text())
			.then(text => fetch('https://webauth.southernco.com/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					RequestVerificationToken: text.match(/id="webauth-aft" data-aft="(\S+)"/)[1],
				},
				body: JSON.stringify({
					username,
					password,
					targetPage: 1,
					params: {
						ReturnUrl: 'null',
					},
				}),
			}))
			.then(response => response.json())
			.then(json => fetch('https://customerservice2.southerncompany.com/Account/LoginComplete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: querystring.stringify({
					ScWebToken: json.data.html.match(/NAME='ScWebToken' value='(\S+)'/)[1],
				}),
			}))
			.then(response => fetch('https://customerservice2.southerncompany.com/Account/LoginValidated/JwtToken', {
				headers: {
					Cookie: response.headers.get('set-cookie').match(/(ScWebToken=\S+);/)[1],
				},
			}))
			.then(response => response.headers.get('set-cookie').match(/ScJwtToken=(\S+);/)[1])

		return this.#jwt
			.then(() => null)
	}

	getAccountNumbers() {
		return (this.#jwt ?? Promise.reject())
			.then(jwt => fetch('https://customerservice2api.southerncompany.com/api/account/getAllAccounts', {
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			}))
			.then(response => response.json())
			.then(json => json.Data.map(account => account.AccountNumber))
	}

	getCurrentBill(accountNumber) {
		return (this.#jwt ?? Promise.reject())
			.then(jwt => fetch(`https://customerservice2api.southerncompany.com/api/account/getAccountDetailLight/${accountNumber}`, {
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			}))
			.then(response => Promise.all([this.#jwt, response.json()]))
			.then(([jwt, json]) => {
				const accountCategory = json.Data.AccountCategory

				const match = json.Data.AccountOpenedDate.match(/(\d+)-0*(\d+)-0*(\d+)/)
				const startDate = `${match[1]}-${match[3]}-${match[2]}`

				const today = new Date()
				const endDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

				return fetch(`https://customerservice2api.southerncompany.com/api/Billing/getHistory/${accountNumber}/APC/${accountCategory}/${startDate}/${endDate}/false`, {
					headers: {
						Authorization: `Bearer ${jwt}`,
					},
				})
			})
			.then(response => response.json())
			.then(json => {
				const currentBill = json.Data.find(element => element.Description === 'Bill')

				return {
					billingPeriod: currentBill.ServicePeriod,
					amount: currentBill.Amount,
					totalUsage: Number.parseInt(currentBill.TotalUsage1),
					numberOfDaysInBillingPeriod: currentBill.DaysInBillingPeriod,
				}
			})
	}
}
