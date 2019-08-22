exports.getPayments = () => {
	return new Promise((resolve, reject) => {
		var query = {
			text: 'select p.*, pm.expiration_date, pm.card_number, pm.cardholder_name, pm.security_code from payment p left join payment_method pm on p.transaction_id = pm.transaction_id order by p.transaction_id desc;',
		}
		client.query(query.text)
			.spread(results => resolve(results))
			.catch(error => reject(error));
	});
}

exports.addPayment = (payment) => {
	return new Promise((resolve, reject) => {
		var query = {
			text: 'INSERT INTO payment (transaction_id, currency, value, payment_method) VALUES (?, ?, ?, ?);',
			values: [payment.transaction_id, payment.currency, payment.value, payment.paymentMethod.payment_method]
		};
		client.query(query.text, query.values)
			.spread(async results => {
				var isTarjeta = await isPaymentMethodTarjeta(payment.paymentMethod.payment_method);
				if (isTarjeta)
					await addPaymentMethodOfPayment(payment);
				resolve(payment)
			})
			.catch(error => reject(error));;
	})
}

var getPayment = (idPayment) => {
	return new Promise((resolve, reject) => {
		var query = {
			text: 'select p.*, pm.expiration_date, pm.card_number, pm.cardholder_name, pm.security_code from payment p left join payment_method pm on p.transaction_id = pm.transaction_id ' +
				'where p.transaction_id = ?;',
			values: [idPayment]
		}
		client.query(query.text, query.values)
			.spread(results => resolve(results))
			.catch(error => reject(error));
	});
}

exports.getPayment = getPayment;

exports.updatePayment = (idPayment, status) => {
	return new Promise((resolve, reject) => {
		var query = {
			text: 'update payment set status = ?, updateat = current_timestamp where transaction_id = ?;',
			values: [status, idPayment]
		}

		client.query(query.text, query.values)
			.then(() => {
				getPayment(idPayment)
					.then(data => resolve(data[0]))
					.catch(error => reject(error))
			})
			.catch(error => reject(error));
	});
}

exports.getPaymentsMethods = () => {
	var query = {
		text: 'select * from payment_methods;'
	}
	return new Promise((resolve, reject) => {
		client.query(query.text)
			.then(results => resolve(results[0]))
			.catch(error => reject(error));
	});
}

var addPaymentMethodOfPayment = (payment) => {
	var query = {
		text: 'INSERT INTO payment_method (transaction_id, expiration_date, card_number, security_code, cardholder_name) VALUES (?, ?, ?, ?, ?);',
		values: [payment.transaction_id, payment.paymentMethod.expiration_date, payment.paymentMethod.card_number, payment.paymentMethod.security_code, payment.paymentMethod.cardholder_name]
	};
	return new Promise((resolve, reject) => {
		client.query(query.text, query.values)
			.spread(results => resolve(results))
			.catch(error => reject(error));
	});
}

var isPaymentMethodTarjeta = async (paymentMethod) => {
	var query = {
		text: 'select type from payment_methods where name = ?',
		values: [paymentMethod]
	}
	return client.query(query.text, query.values)
		.spread(results => {
			if (results.length > 0 && results[0].type == 1)
				return true;
			return false;
		})
		.catch(error => reject(error));
}

exports.isPaymentMethodTarjeta = isPaymentMethodTarjeta;
