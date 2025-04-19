import express from 'express';
import trackHandler from './track.js';

const app = express();
const port = process.env.PORT || 3000;

// Add root route
app.get('/', (req, res) => {
  res.send('FY Cargo Tracker API is running');
});

// Add your tracking route
app.get('/api/track', trackHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});