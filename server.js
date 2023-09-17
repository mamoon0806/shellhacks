const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('js'));
app.use(express.static('css'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'html/index.html')));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

const rout = require('./routes/google.js');
app.use('/api', rout);
