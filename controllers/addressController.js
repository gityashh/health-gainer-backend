const User = require('../models/user');
const Address = require('../models/addressModel');

exports.addAddress = async (req, res) => {
  try {
    const userId = req.id;
    console.log(userId, "userId");
    
    const {  fullName, phone, street, city, state, zipCode, country, isDefault } = req.body;

    const address = new Address({
      userId,
      fullName,
      phone,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault,
    });

    await address.save();

    const user = await User.findById(userId);
    user.addresses.push(address._id);
    await user.save();

    res.status(201).json({ success: true, message: 'Address added successfully!', address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.setDefaultAddress = async (req, res) => {
    try {
      const { userId, addressId } = req.body;
  
      // Reset all addresses to non-default
      await Address.updateMany({ userId }, { isDefault: false });
  
      // Set the selected address as default
      const address = await Address.findByIdAndUpdate(addressId, { isDefault: true }, { new: true });
  
      res.status(200).json({ success: true, message: 'Default address set successfully!', address });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // In addressController.js

exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.id;

    // Get all addresses for the user
    const addresses = await Address.find({ userId }).select('-userId');;

    if (!addresses || addresses.length === 0) {
      return res.status(404).json({ success: false, message: 'No addresses found for this user.' });
    }

    res.status(200).json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// In addressController.js

exports.getAddressById = async (req, res) => {
  try {

    const userId = req.id;

    // Get the address by ID
   
    const address = await Address.findOne({ userId }).select('-userId');
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    res.status(200).json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// In addressController.js

exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { fullName, phone, street, city, state, zipCode, country, isDefault } = req.body;

    // Find the address and update
    const address = await Address.findByIdAndUpdate(
      addressId,
      { fullName, phone, street, city, state, zipCode, country, isDefault },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    res.status(200).json({ success: true, message: 'Address updated successfully!', address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// In addressController.js

exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    // Delete the address by ID
    const address = await Address.findByIdAndDelete(addressId);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    // Remove address reference from the User model
    const user = await User.findById(address.userId);
    user.addresses = user.addresses.filter((id) => id.toString() !== addressId);
    await user.save();

    res.status(200).json({ success: true, message: 'Address deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
