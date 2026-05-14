import axios from 'axios';

async function test() {
    try {
        const res = await axios.patch('http://localhost:5001/api/tasks/some-id', {}, {
            headers: {
                // Mock headers if needed, but we just want to see if it 500s
            }
        });
        console.log("Status:", res.status);
    } catch (e) {
        console.log("Status:", e.response?.status);
        console.log("Body:", JSON.stringify(e.response?.data, null, 2));
    }
}

test();
