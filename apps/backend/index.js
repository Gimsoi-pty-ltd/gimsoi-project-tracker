const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authorize = require('./middleware/authMiddleware');
const ROLES = require('./Roles/roles');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- Routes ---

//  GET /tasks - VIEW_PROGRESS
//  Allowed for: ADMIN, PM, INTERN, CLIENT

app.get('/tasks', authorize('VIEW_PROGRESS'), (req, res) => {
    res.json({ message: 'Viewing progress: Task list retrieved successfully.' });
});


//   POST /tasks - CREATE_TASK
//   Allowed for: ADMIN, PM

app.post('/tasks', authorize('CREATE_TASK'), (req, res) => {
    res.json({ message: 'Task created successfully.' });
});


//  PUT /tasks/:id - UPDATE_TASK
//   Allowed for: ADMIN, PM, INTERN

app.put('/tasks/:id', authorize('UPDATE_TASK'), (req, res) => {
    res.json({ message: `Task ${req.params.id} updated successfully.` });
});

// Basic check
app.get('/', (req, res) => {
    res.send('User Roles Backend is running.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Role-based permissions are active.');
});
