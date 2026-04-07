const express = require('express')
const app = express();

const hostname = '192.168.4.115';
const port = 8010; 


// Etusivu
app.get('/', (req, res) => {
  res.send('Tervetuloa!');
})

// Reitit
const asiakkaatRouter = require('./routes/asiakkaat');
app.use('/asiakkaat', asiakkaatRouter);

const laskutRouter = require('./routes/laskut')
app.use('/laskut', laskutRouter)


// Serveri
app.listen(port, hostname, () => {
 console.log(`Server running at http://${hostname}:${port}/`);
});