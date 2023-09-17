const express = require('express');
const app = express();

let rooms = [];
let bookings = [];

// Middleware to parse JSON in request body
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hall Booking App")
})
// Create a Room
app.post('/createroom', (req, res) => {
    
    const { roomName, noOfSeats, amenities, pricePerHour } = req.body;
    const room = {
        id: rooms.length + 1,
        roomName,
        noOfSeats,
        amenities,
        pricePerHour,
    };

    rooms.push(room);
    // console.log(room);
    res.status(201).json({ message: 'Room created successfully', room });
});

// Create a Booking
app.post('/bookings', (req, res) => {

    const { customerName, date, startTime, endTime, roomId } = req.body;

    // Check if the room is already booked for the given date and time
    const conflictingBooking = bookings.find(
        (booking) =>
            booking.roomId === roomId &&
            booking.date === date &&
            ((startTime >= booking.startTime && startTime < booking.endTime) ||
                (endTime > booking.startTime && endTime <= booking.endTime) ||
                (startTime <= booking.startTime && endTime >= booking.endTime))
    );

    if (conflictingBooking) {
        return res
            .status(409)
            .json({ message: 'The room is already booked for the specified date and time' });
    }

    // Find the room by ID
    const room = rooms.find((room) => room.id === roomId);

    if (!room) {
        return res.status(404).json({ message: 'Room not found' });
    }

    const booking = {
        id: bookings.length + 1,
        customerName,
        date,
        startTime,
        endTime,
        roomId,
    };

    bookings.push(booking);
    // console.log(booking);

    res.status(201).json({ message: 'Booking created successfully', booking });
});

//list all the rooms with booking data
app.get('/rooms/bookings', (req, res) => {
    const roomsWithBookings = rooms.map((room) => {
        const bookingsForRoom = bookings.filter((booking) => booking.roomId === room.id);

        const bookedData = bookingsForRoom.map((booking) => {
            return {
                customerName: booking.customerName,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
            };
        });

        return {
            roomName: room.roomName,
            isBooked: bookedData.length > 0,
            bookings: bookedData,
        };
    });
    // console.log(roomsWithBookings);
    res.json(roomsWithBookings);
});

//list all customers with the booked data
app.get('/customers/bookings', (req, res) => {
    const customersWithBookings = [];

    for (const booking of bookings) {
        const room = rooms.find((room) => room.id === booking.roomId);

        if (room) {
            const customerData = {
                customerName: booking.customerName,
                roomName: room.roomName,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
            };

            customersWithBookings.push(customerData);
        }
    }
    // console.log(customersWithBookings);
    res.json(customersWithBookings);
});

//list how many times a customer has  booked the room

app.get('/customers/booking-history', (req, res) => {
    const customerBookingHistory = {};

    for (const booking of bookings) {
        const room = rooms.find((room) => room.id === booking.roomId);

        if (room) {
            const customerName = booking.customerName;
            const roomName = room.roomName;
            const date = booking.date;
            const startTime = booking.startTime;
            const endTime = booking.endTime;
            const bookingId = booking.id;
            const bookingDate = booking.date;

            if (!customerBookingHistory[customerName]) {
                customerBookingHistory[customerName] = [];
            }

            customerBookingHistory[customerName].push({
                customerName,
                roomName,
                date,
                startTime,
                endTime,
                bookingId,
                bookingDate,
                bookingStatus: 'Booked', // Assuming all bookings are initially considered as "Booked"
            });
        }
    }

    res.json(customerBookingHistory);
});


app.listen(3000, () => console.log("The server started on the port 3000"));