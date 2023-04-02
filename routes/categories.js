const router = require("express").Router();

const {
  CreateCategory,
  DeleteCategory,
  GetCategories
} = require('../controllers/Category');

const { protect } = require("../middlewares/protect");
const { checkNecessaryParameters } = require('../middlewares/checkParams');
const { pagination } = require('../middlewares/pagination');

router.post(
    "/add",
    protect,
    checkNecessaryParameters([
        "title", 
    ]), 
    CreateCategory
);

router.post(
    "/delete",
    protect,
    checkNecessaryParameters([
        "categoryId"
    ]), 
    DeleteCategory
);

router.get(
    "/", 
    protect,
    GetCategories,
    pagination
);

module.exports = router;
