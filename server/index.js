const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

//-------------- Models -----------------//
const Person = require('./models/person');

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};

//-------------- Middleware --------------//
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(morgan('tiny'));
app.use(express.static('dist'));

morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :body',
    {
      skip: (req, res) => req.method !== 'POST',
    }
  )
);

//-------------- Routes -----------------//
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
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      console.log(error);
      response.status(500).end();
    });
});

//[x]: tested ok
app.put('/api/people/:id', (request, response, next) => {
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

//[]:
app.delete('/api/people/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((person) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.use(errorHandler);
app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
