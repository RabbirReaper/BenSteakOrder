import express from "express";
import bcrypt from 'bcrypt';
import session from 'express-session';
import Administrator from '../schemas/administratorSchema';


const app = express();
app.use(express.json());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));



app.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    const admin = await Administrator.findOne({ name });

    if (!admin) { // adminname not found
      return res.status(401).send('adminname or password arrors');
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (validPassword) {
      req.session.user_id = admin._id;
      return res.send('Login successful');
    } else { // invalid password
      return res.status(401).send('adminname or password arrors');
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).send('Internal server error');
  }
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.send('Logout successful');
});


app.post('/createUser', async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!req.session.user_id) {
      return res.status(401).send('Unauthorized');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Administrator({
      name,
      password: hashedPassword
    });

    await newAdmin.save();
    res.status(201).send('User created successfully');
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).send('Internal server error');
  }
});

app.delete('/deleteUser/:id', async (req, res) => {
  try {
    if (!req.session.user_id) {
      return res.status(401).send('Unauthorized');
    }

    const userId = req.params.id;
    const result = await Administrator.findByIdAndDelete(userId);

    if (!result) {
      return res.status(404).send('User not found');
    }

    res.send('User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).send('Internal server error');
  }
});

export default router;
