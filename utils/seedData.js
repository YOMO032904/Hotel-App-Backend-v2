const Room = require('../models/Room');
const Guest = require('../models/Guest');
const Booking = require('../models/Booking');

const seedData = async () => {
  try {
    // Clear existing data
    await Room.deleteMany();
    await Guest.deleteMany();
    await Booking.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create rooms
    const rooms = await Room.insertMany([
      {
        number: '21',
        type: 'single',
        price: 100,
        status: 'available',
        capacity: 1,
        amenities: ['WiFi', 'TV'],
      },
      {
        number: '22',
        type: 'double',
        price: 150,
        status: 'available',
        capacity: 2,
        amenities: ['WiFi', 'TV', 'Mini Bar'],
      },
      {
        number: '23',
        type: 'suite',
        price: 300,
        status: 'available',
        capacity: 4,
        amenities: ['WiFi', 'TV', 'Mini Bar', 'Jacuzzi'],
      },
      {
        number: '31',
        type: 'single',
        price: 100,
        status: 'available',
        capacity: 1,
        amenities: ['WiFi', 'TV'],
      },
      {
        number: '32',
        type: 'double',
        price: 150,
        status: 'occupied',
        capacity: 2,
        amenities: ['WiFi', 'TV', 'Mini Bar'],
      },
      {
        number: '33',
        type: 'deluxe',
        price: 250,
        status: 'available',
        capacity: 3,
        amenities: ['WiFi', 'TV', 'Mini Bar', 'Balcony'],
      },
      {
        number: '34',
        type: 'suite',
        price: 350,
        status: 'available',
        capacity: 4,
        amenities: ['WiFi', 'TV', 'Mini Bar', 'Jacuzzi', 'Kitchen'],
      },
      {
        number: '35',
        type: 'deluxe',
        price: 250,
        status: 'maintenance',
        capacity: 3,
        amenities: ['WiFi', 'TV', 'Mini Bar', 'Balcony'],
      },
    ]);

    console.log('✅ Created 8 rooms');

    // Create guests
    const guests = await Guest.insertMany([
      {
        name: 'Juan Bausti',
        email: 'juan.bausti@email.com',
        phone: '+1234567890',
        address: '123 Main St, New York',
      },
      {
        name: 'Jane Yap',
        email: 'jane.yap@email.com',
        phone: '+1234567891',
        address: '456 Oak Ave, Los Angeles',
      },
      {
        name: 'Bob Ong',
        email: 'bob.ong@email.com',
        phone: '+1234567892',
        address: '789 Pine Rd, Chicago',
      },
      {
        name: 'Alice Wis',
        email: 'alice.wis@email.com',
        phone: '+1234567893',
        address: '321 Elm St, Houston',
      },
      {
        name: 'Charlie Puth',
        email: 'charlie.puth@email.com',
        phone: '+1234567894',
        address: '654 Maple Dr, Phoenix',
      },
    ]);

    console.log('✅ Created 5 guests');

    // Create bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    await Booking.insertMany([
      {
        guestId: guests[0]._id,
        roomId: rooms[4]._id,
        checkIn: today,
        checkOut: nextWeek,
        status: 'checked-in',
        totalPrice: 1050,
        notes: 'Early check-in requested',
      },
      {
        guestId: guests[1]._id,
        roomId: rooms[2]._id,
        checkIn: tomorrow,
        checkOut: new Date(tomorrow.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: 'confirmed',
        totalPrice: 900,
      },
      {
        guestId: guests[2]._id,
        roomId: rooms[0]._id,
        checkIn: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        checkOut: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000),
        status: 'pending',
        totalPrice: 300,
      },
    ]);

    console.log('✅ Created 3 bookings');
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    throw error;
  }
};

module.exports = seedData;
