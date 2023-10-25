const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
console.log('connecting to', MONGODB_URI);

mongoose.set('strictQuery', false);
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const personSchema = new mongoose.Schema({
  name: { type: String, minLength: 3, required: [true, 'name required'] },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function (v) {
        return /\d{2,3}-\d+/.test(v);
        console.log('v', v);
      },
      message: (props) =>
        `${props.value} is not a valid phone number! It should be in the format XX-XXXX... or XXX-XXXX...`,
    },
    required: [true, 'phone number required'],
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
