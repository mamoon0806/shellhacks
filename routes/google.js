const express = require('express');
const router = express.Router();

router.get(':zoom/:x/:y', async (req, res) => {
    res.send((
        await fetch('https://airquality.googleapis.com/v1/mapTypes/US_AQI/heatmapTiles/1/0/0?key=AIzaSyDxn11dlm134OPDCeb18AgK5B-rjlQ7msg')
        .then((res) => {
            console.log(res);
        } )))
});

module.exports = router;