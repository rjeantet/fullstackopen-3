import { useState, useEffect } from 'react';
import personService from './services/persons';
import Filter from './components/Filter';
import PersonForm from './components/PersonForm';
import Persons from './components/Persons';
import Notification from './components/Notification';

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Get data from server
  useEffect(() => {
    personService.getAll().then((response) => {
      setPersons(response.data);
      console.log('initial phonebook:', response.data);
    });
  }, []);

  // Add new person and store in server
  const addPerson = (event) => {
    event.preventDefault();
    const personObject = {
      id: persons.length + 1,
      name: newName,
      number: newNumber,
    };

    // Check if not already in phonebook
    const personAdded = persons.find(
      (person) => person.name.toLowerCase() === newName.toLowerCase()
    );

    // if already in phonebook, ask if we update number
    if (personAdded) {
      const updateNumber = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      );

      // If user says yes, update number
      if (updateNumber) {
        const id = personAdded.id;
        personService
          .update(id, personObject)
          .then((response) => {
            setPersons(
              persons.map((person) =>
                person.id !== id ? person : response.data
              )
            );
            setMessage(`${newName}'s number updated`);
            setTimeout(() => {
              setMessage(null);
            }, 5000);
          })
          // eslint-disable-next-line no-unused-vars
          .catch((error) => {
            setErrorMessage(
              `Information of ${newName} has already been removed from server`
            );
            setTimeout(() => {
              setErrorMessage(null);
            }, 5000);
          });
      }

      // If user says no, cancel update
      else {
        setMessage(`Update cancelled, ${newName}'s number not updated`);
        setTimeout(() => {
          setMessage(null);
        }, 5000);
      }
    }

    // If not in phonebook, add new person and post to server
    else {
      setPersons([...persons, personObject]);
      personService.create(personObject).then((response) => {
        console.log('New person added:', response.data);
      });
    }
    setNewName('');
    setNewNumber('');
  };

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const handleFilter = (event) => {
    setFilter(event.target.value);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      `Delete ${persons.find((person) => person.id === id).name}?`
    );
    confirmDelete
      ? personService.remove(id).then(() => {
          setPersons(persons.filter((person) => person.id !== id));
          setMessage(
            `${
              persons.find((person) => person.id === id).name
            } deleted from phonebook`
          );
          setTimeout(() => {
            setMessage(null);
          }, 5000);
        })
      : setMessage('User deletion cancelled');
    setTimeout(() => {
      setMessage(null);
    }, 2000);
  };

  const filteredPersons = persons.filter((person) =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} errorMessage={errorMessage} />
      <Filter filter={filter} handleFilter={handleFilter} />

      <h2>Add a new</h2>
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />

      <h2>Numbers</h2>
      <Persons filteredPersons={filteredPersons} handleDelete={handleDelete} />
    </div>
  );
};

export default App;
