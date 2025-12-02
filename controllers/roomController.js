const Room = require('../models/Room');

// @desc    Get all rooms with pagination and filtering
// @route   GET /api/rooms?page=1&limit=10&status=available
// @access  Public
exports.getAllRooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const rooms = await Room.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ number: 1 });

    const total = await Room.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: rooms,
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

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Public
exports.createRoom = async (req, res) => {
  try {
    const { number, type, price, capacity, status, amenities } = req.body;

    // Validation
    if (!number || !type || !price || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide number, type, price, and capacity',
      });
    }

    const room = await Room.create({
      number,
      type,
      price,
      capacity,
      status: status || 'available',
      amenities: amenities || [],
    });

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `Room number ${error.keyValue.number} already exists`,
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Public
exports.updateRoom = async (req, res) => {
  try {
    const { number, type, price, capacity, status, amenities } = req.body;

    let room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Update fields
    if (number) room.number = number;
    if (type) room.type = type;
    if (price !== undefined) room.price = price;
    if (capacity) room.capacity = capacity;
    if (status) room.status = status;
    if (amenities) room.amenities = amenities;

    await room.save();

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `Room number ${error.keyValue.number} already exists`,
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Public
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.status(200).json({ success: true, message: 'Room deleted successfully', data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
