const router = require("express").Router();

const {
  signin,
  createUser,
  logout,
  resetpass,
  updateUser,
  updateProfile,
  deleteUser,
  getProfile,
  getUsers,
  getUser,
  signup,
  sendMail,
  verifyEmail,
  forgetPassword
} = require('../controllers/User');

const { protect } = require("../middlewares/protect");
const { checkNecessaryParameters } = require('../middlewares/checkParams');
const { pagination } = require('../middlewares/pagination');
const { setDocument } = require('../middlewares/helpers');
const UserModel = require('../models/User');

router.post("/login", checkNecessaryParameters(["email", "password"]), signin);
router.post(
  "/register",
  protect,
  checkNecessaryParameters([
    'email',
    'password',
    'contactNumber',
    'firstName',
    'lastName',
    'permission',
  ]),
  createUser
);
router.post(
  '/signup',
  protect,
  checkNecessaryParameters([
    'email',
    'password',
    'contactNumber',
    'firstName',
    'lastName'
  ]),
  signup
);
router.post(
  '/reset-password',
  checkNecessaryParameters(['email', 'newPassword']),
  resetpass
);
router.post(
  '/send-verification-email',
  protect,
  checkNecessaryParameters(['email']),
  sendMail
);
router.post(
  '/forget-password',
  protect,
  checkNecessaryParameters(['email']),
  forgetPassword
);
router.post(
  '/verify-email/:token',
  protect,
  checkNecessaryParameters(['email']),
  verifyEmail
);
router.post('/logout', protect, logout);
router.get('/', protect, getUsers, pagination);
router.get('/profile', protect, getProfile);
router.get('/user/:userId', protect, setDocument('userId', UserModel), getUser);

router.post("/profile/update", protect, updateProfile);
router.post(
  "/update",
  protect,
  setDocument("userId", UserModel),
  updateUser
);
router.post(
  "/delete",
  protect,
  deleteUser
);

module.exports = router;
