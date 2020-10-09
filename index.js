const express = require('express');

const app = express();

const path = require('path');
app.use(express.static('assets'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'sites/index.html'));
});

app.get('/hinweise', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'sites/hinweise.html'));
});

app.listen(3000, () => {
  console.log('server started');
});