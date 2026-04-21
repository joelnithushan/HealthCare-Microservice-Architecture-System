const axios = require('axios');

async function checkDoctorRequests() {
    try {
        console.log("Logging in as doctor stylerfree29@gmail.com...");
        const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
            email: 'stylerfree29@gmail.com',
            password: 'Nithuqaz123'
        });
        
        const token = loginRes.data.token;
        const userId = loginRes.data.user.id;
        console.log(`Logged in. User ID: ${userId}`);

        console.log(`Fetching appointments for doctor ${userId}...`);
        const requestsRes = await axios.get(`http://localhost:8080/api/appointments/doctor/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const appointments = requestsRes.data;
        console.log(`Found ${appointments.length} appointments.`);
        const myAppt = appointments.find(a => a.id === 1051);
        
        if (myAppt) {
            console.log("SUCCESS: Found the booked appointment in doctor dashboard!");
            console.log(myAppt);
        } else {
            console.error("FAILURE: Booked appointment 1051 not found in doctor's list.");
            console.log(appointments);
        }
    } catch (err) {
        console.error("Check FAILED");
        console.error(err.response ? err.response.data : err.message);
    }
}

checkDoctorRequests();
