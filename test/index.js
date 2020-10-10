import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import config from '../config.json'
import AlabamaPower from '../lib'

chai.use(chaiAsPromised)

chai.should()

describe('AlabamaPower', function() {
	describe('#logIn', function() {
		let alabamaPower

		beforeEach(function() {
			alabamaPower = new AlabamaPower()
		})

		context('when username and password are valid', function() {
			it('should return a promise that resolves to null', function() {
				return alabamaPower.logIn(config.username, config.password).should.eventually.equal(null)
			})
		})
		context('when username is valid and password is invalid', function() {
			it('should return a promise that rejects', function() {
				return alabamaPower.logIn(config.username, '').should.be.rejected
			})
		})
		context('when username is invalid and password is valid', function() {
			it('should return a promise that rejects', function() {
				return alabamaPower.logIn('', config.password).should.be.rejected
			})
		})
		context('when username and password are invalid', function() {
			it('should return a promise that rejects', function() {
				return alabamaPower.logIn('', '').should.be.rejected
			})
		})
	})
})
