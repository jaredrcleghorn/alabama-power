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
}
