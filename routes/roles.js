const router = require("express").Router();

const {
  CreateRole,
  UpdateRole,
  DeleteRole,
  GetRoles
} = require('../controllers/Roles');

const { protect } = require("../middlewares/protect");
const { checkNecessaryParameters } = require('../middlewares/checkParams');
const { pagination } = require('../middlewares/pagination');

router.post(
    "/add",
    protect,
    checkNecessaryParameters([
        "title", 
        "send",
        "receive",
        "issue",
        "create"
    ]), 
    CreateRole
);

router.post(
    "/update",
    protect,
    checkNecessaryParameters([
        "roleId"
    ]), 
    UpdateRole
);

router.post(
    "/delete",
    protect,
    checkNecessaryParameters([
        "roleId"
    ]), 
    DeleteRole
);

router.get(
    "/", 
    protect,
    GetRoles,
    pagination
);

module.exports = router;
