const axios = require('axios');

async function testBooking() {
    try {
        console.log("Logging in as patient...");
        const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
            email: 'patient@gmail.com',
            password: 'Patient@123'
        });
        
        const token = loginRes.data.token;
        const patientId = loginRes.data.user.id;
        console.log(`Logged in. Patient ID: ${patientId}`);

        console.log("Booking appointment with Dr. Archuna Ramanathan (ID: 216)...");
        const apptRes = await axios.post('http://localhost:8080/api/appointments', {
            patientId: patientId,
            doctorId: 216,
            appointmentDate: '2026-05-15',
            appointmentTime: '14:00:00',
            notes: 'Test clinical workflow sync confirmed',
            appointmentType: 'PHYSICAL',
            status: 'PENDING'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("Booking SUCCESSFUL!");
        console.log(apptRes.data);
    } catch (err) {
        console.error("Booking FAILED");
        console.error(err.response ? err.response.data : err.message);
    }
}

testBooking();
