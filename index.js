require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
app.use(cors());

// using es6 import changed { "type": "module" } in the package.json
const Person = require('./models/person_mongo');

morgan.token('personsJson', function(req) {
	const iReturn = req.body.name ? JSON.stringify(req.body) : '';
	return iReturn;
});

app.use(express.static('build'));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :personsJson'));
// app.use(morgan('tiny'));

app.use(express.json());

const randomInt = () => {
	return Math.floor(Math.random() * 10000);
};

app.get('/api/persons', (req, res) => {
	Person.find({}).then((persons) => {
		res.json(persons);
	});
});

app.get('/info', (req, res) => {
	res.send(`<p>Phonebook has info for ${persons.length} people </p>
    <p>${new Date()}</p>`);
});

app.get('/api/persons/:id', (req, res) => {
	Person.findById(req.params.id)
		.then((person) => {
			res.json(person);
		})
		.catch((error) => {
			console.log(error.message);
			res.status(404).end();
		});
});

app.delete('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id);
	persons = persons.filter((person) => person.id !== id);

	res.status(204).end();
});

app.post('/api/persons', (req, res) => {
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
	person.save().then((savedContact) => {
		res.json(savedContact);
	});
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`server running on port ${PORT}`);
});
