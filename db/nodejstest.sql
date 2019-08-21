create schema nodejs_test;

use nodejs_test;

create table if not exists payment_methods (
	name varchar(30) primary key,
	type integer,
	image text
);

INSERT into payment_methods (name, type, image) values ('Efectivo', 0, 'http://soloefectivo.com.ar/image.jpg'),
	('Visa', 1, 'https://firebasestorage.googleapis.com/v0/b/comprameli-49a1b.appspot.com/o/images%2Fpayments%2Fvisa.png?alt=media&token=fed5389f-a966-4f22-82e9-0181784667a7'),
	('American Express', 1, 'https://firebasestorage.googleapis.com/v0/b/comprameli-49a1b.appspot.com/o/images%2Fpayments%2Famex.png?alt=media&token=70c950b6-a60e-4bc3-85ee-fb8cb5d4b82b'),
	('Mastercard', 1, 'https://firebasestorage.googleapis.com/v0/b/comprameli-49a1b.appspot.com/o/images%2Fpayments%2Fmastercard.png?alt=media&token=0deb3fdc-db7b-464a-9f0a-f7c4126808f6');


create table if not exists payment (
	transaction_id varchar(50) primary key,
	status varchar(30) default 'PENDIENTE' not null,
	currency text not null,
	value integer not null,
	payment_method text references payment_methods(name),
	updateat timestamp default current_timestamp;
);

create table if not exists payment_method (
	transaction_id varchar(50) primary key references payment(transaction_id),
	expiration_date text not null,
	card_number text not null,
	security_code text not null,
	cardholder_name text not null
)
