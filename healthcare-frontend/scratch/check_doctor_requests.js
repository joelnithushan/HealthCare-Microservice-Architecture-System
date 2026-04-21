const axios = require('axios');

async function checkDoctorRequests() {
    try {
        console.log("Logging in as doctor styelrfree29@gmail.com...");
        const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
            email: 'stylerfree29@gmail.com',
            password: 'Nithuqaz123'
        });
        
        const token = loginRes.data.token;
        const doctorId = 216; // We know this ID
        console.log(`Logged in. Doctor ID should be reflected in requests.`);

        console.log("Fetching appointments for doctor 216...");
        const requestsRes = await axios.get(`http://localhost:8080/api/appointments/doctor/216`, {
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
        }
    } catch (err) {
        console.error("Check FAILED");
        console.error(err.response ? err.response.data : err.message);
    }
}

checkDoctorRequests();
