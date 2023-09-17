const express = require('express');
const router = express.Router();

router.get('/:zoom/:x/:y', async (req, res) => {
    let zoom = req.params.zoom;
    let x = req.params.x;
    let y = req.params.y;
    res.send((
        await fetch(`https://airquality.googleapis.com/v1/mapTypes/US_AQI/heatmapTiles/${zoom}/${x}/${y}?key=AIzaSyDxn11dlm134OPDCeb18AgK5B-rjlQ7msg`)
        .then(res =>  res.blob())
        .then(blob => {
            console.log(blob)
            return blob;
        })
        ))
});

module.exports = router;