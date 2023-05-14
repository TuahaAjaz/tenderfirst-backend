const router = require('express').Router();
const {
    CreateRating
} = require('../controllers/Rating');
const { checkNecessaryParameters } = require('../middlewares/checkParams');
const { protect } = require('../middlewares/protect');

router.post(
    "/add",
    protect,
    checkNecessaryParameters([
        'userId',
        'rating'
    ]),
    CreateRating
);

module.exports = router;