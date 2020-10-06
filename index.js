require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
app.use(cors());
const Person = require('./models/person_mongo');
const { response } = require('express');

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
			console.log(err);
		} else {
			response.send(`<p>Phonebook has info for ${res} people </p>
			<p>${new Date()}</p>`);
		}
	});
});

app.get('/api/persons/:id', (req, res, next) => {
	Person.findById(req.params.id)
		.then((person) => {
			console.log('person---', person);
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
	const name = req.body.name;
	const number = req.body.number;
	if (!(name && number)) {
		return res.status(400).json({
			error: 'name/number missing'
		});
	}

	const person = new Person({
		name: name,
		number: number
	});
	person
		.save()
		.then((savedContact) => savedContact.toJSON())
		.then((savedAndFormattedContact) => {
			response.json(savedAndFormattedContact);
		})
		.catch((error) => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
	Person.findByIdAndRemove(req.params.id)
		.then((result) => {
			res.status(204).end();
		})
		.catch((error) => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
	const number = req.body.number;
	const name = req.body.name;
	const person = {
		name: name,
		number: number
	};
	Person.findByIdAndUpdate(req.params.id, person, { new: true })
		.then((updatedContact) => {
			console.log(updatedContact);
			res.json(updatedContact.toJSON());
		})
		.catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
	console.error(error.message);

	if (error.name === 'CastError') {
		return res.status(400).send({ error: 'malformatted id' });
	} else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message });
	}

	next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`server running on port ${PORT}`);
});
