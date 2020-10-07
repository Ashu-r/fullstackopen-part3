require('dotenv').config();
const express = require('express');

const app = express();
const morgan = require('morgan');
const cors = require('cors');

app.use(cors());
const Person = require('./models/person_mongo');

// eslint-disable-next-line func-names
morgan.token('personsJson', function(req) {
	const iReturn = req.body.name ? JSON.stringify(req.body) : '';
	return iReturn;
});

app.use(express.static('build'));
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :personsJson'));

app.get('/api/persons', (req, res) => {
	Person.find({}).then((persons) => {
		res.json(persons);
	});
});

app.get('/info', (request, response) => {
	Person.count({}, (err, res) => {
		if (err) {
			// console.log(err);
		} else {
			response.send(`<p>Phonebook has info for ${res} people </p>
			<p>${new Date()}</p>`);
		}
	});
});

app.get('/api/persons/:id', (req, res, next) => {
	Person.findById(req.params.id)
		.then((person) => {
			// console.log('person---', person);
			if (person) {
				res.json(person.toJSON());
			} else {
				res.status(404).end();
			}
		})
		.catch((error) => {
			next(error);
		});
});

app.post('/api/persons', (req, res, next) => {
	const { name } = req.body;
	const { number } = req.body;
	if (!(name && number)) {
		return res.status(400).json({
			error: 'name/number missing',
		});
	}

	const person = new Person({
		name,
		number,
	});
	person
		.save()
		.then((savedContact) => savedContact.toJSON())
		.then((savedAndFormattedContact) => {
			res.json(savedAndFormattedContact);
		})
		.catch((error) => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
	Person.findByIdAndRemove(req.params.id)
		.then(() => {
			res.status(204).end();
		})
		.catch((error) => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
	const { number } = req.body;
	const { name } = req.body;
	const person = {
		name,
		number,
	};
	Person.findByIdAndUpdate(req.params.id, person, { new: true })
		.then((updatedContact) => {
			// console.log(updatedContact);
			res.json(updatedContact.toJSON());
		})
		.catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
	// console.error(error.message);

	if (error.name === 'CastError') {
		return res.status(400).send({ error: 'malformatted id' });
	}
	if (error.name === 'ValidationError') {
		return res.status(400).json({ error: error.message });
	}

	next(error);
};
app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
	// console.log(`server running on port ${PORT}`);
});
