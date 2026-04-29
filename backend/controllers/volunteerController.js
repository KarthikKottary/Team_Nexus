const Volunteer = require('../models/Volunteer');

exports.getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find();
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addVolunteer = async (req, res) => {
  try {
    const newVolunteer = new Volunteer(req.body);
    await newVolunteer.save();
    res.status(201).json(newVolunteer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteVolunteer = async (req, res) => {
  try {
    await Volunteer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Volunteer removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Seed 3 demo volunteers if the database is empty
exports.seedVolunteers = async () => {
  const count = await Volunteer.countDocuments();
  if (count === 0) {
    await Volunteer.insertMany([
      { name: 'Alice (Logistics)', phone: '555-0101' },
      { name: 'Bob (Technical)', phone: '555-0102' },
      { name: 'Charlie (General)', phone: '555-0103' }
    ]);
  }
};
exports.seedVolunteers();
