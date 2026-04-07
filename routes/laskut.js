const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
      res.send('laskut');
})

module.exports = router;
