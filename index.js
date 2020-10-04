const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
app.use(cors());

morgan.token('personsJson', function(req) {
	const iReturn = req.body.name ? JSON.stringify(req.body) : '';
	return iReturn;
});

app.use(express.static('build'));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :personsJson'));
// app.use(morgan('tiny'));

let persons = [
	{
		name: 'back Arto Hellas',
		number: '040-123456',
		id: 1
	},
	{
		name: 'Ada Lovelace',
		number: '39-44-5323523',
		id: 2
	},
	{
		name: 'Dan Abramov',
		number: '12-43-234345',
		id: 3
	},
	{
		name: 'Mary Poppendieck',
		number: '39-23-6423122',
		id: 4
	},
	{
		name: 'Juan Somethingo',
		number: '233-324-3838',
		id: 5
	},
	{
		name: 'Caveeeefef',
		number: '3244',
		id: 6
	}
];

app.use(express.json());

const randomInt = () => {
	return Math.floor(Math.random() * 10000);
};

app.get('/api/persons', (req, res) => {
	res.json(persons);
});

app.get('/info', (req, res) => {
	res.send(`<p>Phonebook has info for ${persons.length} people </p>
    <p>${new Date()}</p>`);
});

app.get('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id);
	const person = persons.find((person) => person.id === id);

	if (person) {
		res.json(person);
	} else {
		res.status(404).end();
	}
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

	if (persons.find((person) => person.name === name)) {
		return res.status(400).json({
			error: 'name must be unique'
		});
	}
	const person = { ...req.body, id: randomInt() };
	persons = persons.concat(person);
	res.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`server running on port ${PORT}`);
});
