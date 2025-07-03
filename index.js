// // backend/index.js
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');


// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const triageRoutes = require('./routes/triageRoutes');
// app.use('/api/triage', triageRoutes);

// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => app.listen(5000, () => console.log("Server running on port 5000")))
//   .catch(err => console.log(err));
// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const triageRoutes = require('./routes/triageRoutes');
app.use('/api/triage', triageRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('✅ AI Triage Backend is Live!');
});


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB Atlas connected');
  app.listen(5000, () => console.log("🚀 Server running on port 5000"));
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});
