const Guest = require('../models/Guest');

// @desc    Get all guests with pagination
// @route   GET /api/guests?page=1&limit=10
// @access  Public
exports.getAllGuests = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const guests = await Guest.find()
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Guest.countDocuments();

    res.status(200).json({
      success: true,
      data: guests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single guest by ID
// @route   GET /api/guests/:id
// @access  Public
exports.getGuestById = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);

    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    res.status(200).json({ success: true, data: guest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new guest
// @route   POST /api/guests
// @access  Public
exports.createGuest = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    // Validation
    if (!name || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone, and address',
      });
    }

    const guest = await Guest.create({
      name,
      email,
      phone,
      address,
    });

    res.status(201).json({ success: true, data: guest });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `Email ${error.keyValue.email} already exists`,
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update guest
// @route   PUT /api/guests/:id
// @access  Public
exports.updateGuest = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    let guest = await Guest.findById(req.params.id);

    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    // Update fields
    if (name) guest.name = name;
    if (email) guest.email = email;
    if (phone) guest.phone = phone;
    if (address) guest.address = address;

    await guest.save();

    res.status(200).json({ success: true, data: guest });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `Email ${error.keyValue.email} already exists`,
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete guest
// @route   DELETE /api/guests/:id
// @access  Public
exports.deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id);

    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    res.status(200).json({ success: true, message: 'Guest deleted successfully', data: guest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get guest's bookings
// @route   GET /api/guests/:id/bookings
// @access  Public
exports.getGuestBookings = async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    
    const bookings = await Booking.find({ guestId: req.params.id })
      .populate('roomId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
