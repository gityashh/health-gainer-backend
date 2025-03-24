const express = require('express');
const router = express.Router();
const { createContact, getAllContacts, updateContact, deleteContact } = require('../controllers/contactController');

// Routes for contacts
router.post('/create', createContact);
router.get('/all', getAllContacts);
router.put('/update/:id', updateContact);
router.delete('/delete/:id', deleteContact);

module.exports = router;