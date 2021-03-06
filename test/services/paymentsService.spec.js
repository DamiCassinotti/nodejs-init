const expect = require('chai').expect;
const paymentsService = require('../../api/services/paymentsService');
const paymentMocks = require('../mocks/paymentMocks');
const paymentMethodsMock = require('../mocks/paymentMethodsMock');
const app = require('../../server.js').bootstrapApp();
const client = require('mysql-promise')();
const config = require('../../config_test.json');

describe('Payment Service', () => {

	beforeEach((done) => {
		client.configure({
		  host     : config.database.host,
			port		 : config.database.port,
		  user     : config.database.user,
		  password : config.database.pass,
		  database : config.database.schema
		});
		client.query('BEGIN;')
			.then(data => {
				done();
			})
			.catch(err => {
				throw err;
				done();
			});
	});

	afterEach((done) => {
		client.query('ROLLBACK;')
			.then(data => {
				client.end();
				done();
			})
			.catch(err => {
				client.end();
				done();
			});
	});

	it('Add new payment Efectivo', async () => {
		var payment = await paymentsService.addPayment(paymentMocks.efectivo);

		expect(payment).not.to.be.undefined;
		paymentMocks.efectivo.updateat = payment.updateat;
		expect(payment).to.deep.equal(paymentMocks.efectivo);
	});

	it('Add new payment Credito', async () => {
		var payment = await paymentsService.addPayment(paymentMocks.credito);

		expect(payment).not.to.be.undefined;
		paymentMocks.credito.updateat = payment.updateat;
		expect(payment).to.deep.equal(paymentMocks.credito);
	});

	it('Add new payment Debido', async () => {
		var payment = await paymentsService.addPayment(paymentMocks.debito);

		expect(payment).not.to.be.undefined;
		paymentMocks.debito.updateat = payment.updateat;
		expect(payment).to.deep.equal(paymentMocks.debito);
	});

	it('Select all Payments', async () => {
		var payments = await paymentsService.getPayments();

		expect(payments).to.not.be.undefined;
		expect(payments).to.be.an('array').that.is.empty;
	});

	it('Select all payments after inserting', async () => {
		var payment = await paymentsService.addPayment(paymentMocks.debito);

		var payments = await paymentsService.getPayments();

		expect(payments).to.not.be.undefined;
		expect(payments).to.be.an('array');
		expect(payments.length).to.equal(1);
		expect(payments[0].updateat).to.be.a('date');
		paymentMocks.serviceResponseDebito.updateat = payments[0].updateat;
		expect(payments[0]).to.deep.equal(paymentMocks.serviceResponseDebito);
	});

	it('Select one payment after inserting', async () => {
		var payment = await paymentsService.addPayment(paymentMocks.debito);

		var samePayment = await paymentsService.getPayment(paymentMocks.debito.transaction_id);

		expect(samePayment).to.not.be.undefined;
		expect(samePayment).to.be.an('array');
		expect(samePayment.length).to.equal(1);
		expect(samePayment[0].updateat).to.be.a('date');
		paymentMocks.serviceResponseDebito.updateat = samePayment[0].updateat;
		expect(samePayment[0]).to.deep.equal(paymentMocks.serviceResponseDebito);
	});

	it('Select one payment without id throws error', (done) => {
		paymentsService.getPayment()
			.then(payment => {
				expect(true).to.equal(false);
				done();
			})
			.catch(err => {
				expect(err).to.not.be.undefined;
				done();
			});
	});

	it('Select one payment without inserting return empty array', async () => {
		var samePayment = await paymentsService.getPayment(paymentMocks.debito.transaction_id);

		expect(samePayment).to.not.be.undefined;
		expect(samePayment).to.be.an('array').that.is.empty;;
	});

	it('Update one payment after inserting', async () => {
		var payment = await paymentsService.addPayment(paymentMocks.debito);

		var updatedPayment = await paymentsService.updatePayment(payment.transaction_id, 'CONFIRMADO');

		expect(updatedPayment).to.not.be.undefined;
		expect(updatedPayment.transaction_id).to.equal(payment.transaction_id);
		expect(updatedPayment.status).to.equal('CONFIRMADO');
		expect(updatedPayment.updateat).to.be.a('date');
	});

	it('Update one payment without parameters throws error', (done) => {
		paymentsService.updatePayment()
			.then(tracking => {
				expect(true).to.equal(false);
				done();
			})
			.catch(err => {
				expect(err).to.not.be.undefined;
				done();
			});
	});

	it('Select payment after updating', async () => {
		var payment = await paymentsService.addPayment(paymentMocks.debito);
		var updatedPayment = await paymentsService.updatePayment(payment.transaction_id, 'CONFIRMADO');

		var samePayment = await paymentsService.getPayment(payment.transaction_id);

		expect(samePayment).to.not.be.undefined;
		expect(samePayment).to.be.an('array');
		expect(samePayment.length).to.equal(1);
		expect(samePayment).to.deep.equal([updatedPayment]);
	});

	it('Get Payments Methods', async () => {
		var methods = await paymentsService.getPaymentsMethods();

		expect(methods).to.deep.equal(paymentMethodsMock);
	});

});
