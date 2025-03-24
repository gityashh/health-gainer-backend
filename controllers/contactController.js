const Contact = require('../models/contactModel');

exports.createContact = async (req, res) => {
  try {
    const { name, message, email, phone } = req.body;

    // Validate required fields
    if (!name ||  !email ) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // if (!message && !phone) {
    //   return res.status(400).json({ message: 'At least one field (email or phone) is required' });
    // }
    // Create a new contact instance
    const newContact = new Contact({
      name,
      message,
      email,
      phone
    });

    // Save the contact to the database
    await newContact.save();

    return res.status(201).json({
      message: 'Contact created successfully.',
      success: true,
      contact: newContact,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    // Fetch all contacts
    const contacts = await Contact.find();

    return res.status(200).json(contacts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, message, email, phone } = req.body;

    // Check if contact exists
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Update contact fields
    contact.name = name || contact.name;
    contact.message = message || contact.message;
    contact.email = email || contact.email;
    contact.phone = phone || contact.phone;

    // Save updated contact to the database
    await contact.save();

    return res.status(200).json({
      message: 'Contact updated successfully.',
      success: true,
      contact: contact,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if contact exists
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Delete contact from database
    await Contact.findByIdAndDelete(id);

    return res.status(200).json({
      message: 'Contact deleted successfully.',
      success: true,
      contact: contact,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};