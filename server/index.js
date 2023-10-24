const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

const Person = require('./models/person');

app.use(express.static('dist'));
app.use(express.json());
app.use(morgan('tiny'));

morgan.token('body', (req, res) => JSON.stringify(req.body));

app.use(cors());

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :body',
    {
      skip: (req, res) => req.method !== 'POST',
    }
  )
);

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

//[x]: tested ok
app.get('/info', (request, response) => {
  const date = new Date();
  Person.find({}).then((people) => {
    response.send(
      `<p>Phonebook has info for ${people.length} people</p>
    <p>${date}</p>`
    );
  });
});

//[x]: tested ok
app.get('/api/people', (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
    console.log(people);
  });
});

//[x]: tested ok
app.get('/api/people/:id', (request, response) => {
  Person.findById(request.params.id).then((person) => {
    if (person) {
      response.json(person);
    } else {
      response.status(404).end();
    }
  });
});

//[x]: tested ok
app.put('/api/people/:id', (request, response) => {
  const body = request.body;
  const person = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

//[x]: tested ok
app.post('/api/people', (request, response) => {
  const body = request.body;
  Person.find({}).then((people) => {
    if (!body.name) {
      return response.status(400).json({ error: 'name missing' });
    }
    if (!body.number) {
      return response.status(400).json({ error: 'number missing' });
    }
    if (people.some((person) => person.name === body.name)) {
      return response.status(400).json({
        error: 'check the name or number for missing or duplicate values',
      });
    }

    const person = new Person({
      name: body.name,
      number: body.number,
    });

    person.save().then((person) => {
      response.json(person);
    });
  });
});

//[x]: tested ok
app.delete('/api/people/:id', (request, response) => {
  const body = request.body;
  Person.findByIdAndDelete(request.params.id, body)
    .then((person) => {
      response.json(person);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
