const mongoose = require('mongoose');
const UserModel = require('../models/User');
const asyncHandler = require('../middlewares/async');
const HttpError = require('../utils/httpError');
const { parseNumber } = require('../utils/validateNumber');
const nodemailer = require("nodemailer");
const crypto = require('crypto');

const MAIL_SETTINGS = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL, // generated ethereal user
    pass: process.env.SMTP_PASSWORD, // generated ethereal password
  },
};

const signin = asyncHandler(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const result = await UserModel.findOne({ email: email })
  if (result === null) {
    return next(HttpError.invalidCredentials());
  } else {
    if (result.comparePassword(password)) {
      const { password, ...user } = result.toJSON();
      req.session.user = user._id;
      res.json({ success: true, result: user });
    } else {
      return next(HttpError.invalidCredentials());
    }
  }
});

const createUser = asyncHandler(async (req, res, next) => {
  if (parseNumber(req.body.contactNumber) === 'Invalid Contact Number') {
    res.status(403).json({
      success: false,
      msg: 'Invalid Contact Number',
      code: 'incorrect-number',
    });
  } else {
    const result = (
      await (await UserModel.create(req.body)).populate('permission')
    ).toJSON();
    const { password, ...newUser } = result;
    res.json({ success: true, result: newUser });
  }
});

const signup = asyncHandler(async (req, res, next) => {
  if (parseNumber(req.body.contactNumber) === 'Invalid Contact Number') {
    res.status(403).json({
      success: false,
      msg: 'Invalid Contact Number',
      code: 'incorrect-number',
    });
  } else {
    const user = await UserModel.findOne({ email: req.body.email });
    if(user) {
      return next(new HttpError("Email is already registered", "duplicate-email", 403));
    }
    else {
      const result = (await UserModel.create(req.body)).toJSON();
      const { password, ...newUser } = result;
      res.json({ success: true, result: newUser });
    }
  }
});

const resetpass = asyncHandler(async (req, res, next) => {
  newPassword = req.body.newPassword;
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new HttpError(
        `User ${req.body.email} doesn't exists`,
        'not-found',
        404
      )
    );
  } else {
    user.password = newPassword;
    const result = await user.save();
    await invalidateUserSessions(req.session._id, user._id);
    res.json({ success: true, result: 'Password reset successfull' });
  }
});

const sendMail = asyncHandler(async(req, res, next) => {
  token = crypto.createHash('sha256').update(req.body.email).digest('hex');
  await UserModel.findOneAndUpdate({ email: req.body.email }, { confirmationCode: token });
  const transporter = nodemailer.createTransport(MAIL_SETTINGS);
  await transporter.sendMail({
    from: MAIL_SETTINGS.auth.user,
    to: req.body.email, 
    subject: 'Hello ✔',
    html: `
    <p>Click <a href="http://localhost:3001/user/verify-email/${token}">here</a> to verify your email</p>
    `,
  });
  res.status(200).json({success: true});
})

const verifyEmail = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if(!user) {
    return next(new HttpError("User doesn't exist", "invalid-email", 403));
  }
  else {
    const token = crypto.createHash('sha256').update(req.body.email).digest('hex');
    if(token === req.params['token']) {
      delete user['password'];
      delete user['confirmationCode'];
      res.status(200).json({success: true, result: user});
    }
    else {
      return next(new HttpError("Token is not correct", "invalid-token", 403));
    }
  }
})

const forgetPassword = asyncHandler(async(req, res, next) => {
  token = crypto.createHash('sha256').update(req.body.email).digest('hex');
  await UserModel.findOneAndUpdate({ email: req.body.email }, { confirmationCode: token });
  const transporter = nodemailer.createTransport(MAIL_SETTINGS);
  await transporter.sendMail({
    from: MAIL_SETTINGS.auth.user,
    to: req.body.email, 
    subject: 'Reset Password',
    html: `
    <head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Reset Password Email Template</title>
    <meta name="description" content="Reset Password Email Template.">
    <style type="text/css">
        a:hover {text-decoration: underline !important;}
    </style>
    </head>

    <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
        <!--100% body table-->
        <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
            style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
            <tr>
                <td>
                    <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                        align="center" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td>
                                <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                    style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 35px;">
                                            <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                                requested to reset your password</h1>
                                            <span
                                                style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                            <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                We cannot simply send you your old password. A unique link to reset your
                                                password has been generated for you. To reset your password, click the
                                                following link and follow the instructions.
                                            </p>
                                            <a href="http://localhost:3000/user/verify-email/${token}"
                                                style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                                Password</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                </table>
                            </td>
                        <tr>
                            <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="text-align:center;">
                                <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>www.emergen.com</strong></p>
                            </td>
                        </tr>
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <!--/100% body table-->
    </body>
    `,
  });
  res.status(200).json({success: true});
})

const logout = asyncHandler(async (req, res, next) => {
  req.session.destroy(function () {
    return res.json({ success: true, result: 'User Signed Out' });
  });
});

const getUsers = asyncHandler(async (req, res, next) => {
  req.model = UserModel;
  req.populate = 'permission';
  if (!req.query.select) {
    req.query.select = '';
  }
  req.query.select += ' -password';
  next();
});
const getUser = asyncHandler(async (req, res, next) => {
  const user = (await req.document.populate('permission')).toObject();
  delete user['password'];
  return res.json({ success: true, result: user });
});

const getProfile = asyncHandler(async (req, res, next) => {
  res.send({
    success: true,
    result: await UserModel.findById(req.session.user)
      .select('-password')
      .populate('permission'),
  });
});

const updateProfile = asyncHandler(async (req, res, next) => {
  req.document = await UserModel.findById(req.session.user);
  return updateUser(req, res, next);
});

const updateUser = asyncHandler(async (req, res, next) => {
  const user = req.document;
  let columns = {};
  let updates = req.body.updates;
  delete updates['password'];
  for (const field in updates) {
    {
      columns[field] = updates[field];
      user[field] = updates[field];
    }
  }
  const result = (await user.save()).toObject();
  delete result['password'];
  return res.json({ success: true, result });
});

const deleteUser = asyncHandler(async (req, res, next) => {
  createLogs(req.session.user, 'User', 'DELETE', user._id, {});
  invalidateUserSessions(null, user._id);
  await UserModel.deleteOne({ _id: req.body.userId });
  return res.json({ success: true });
});

const invalidateUserSessions = (sessionId, userId) => {
  return mongoose.connection
    .collection('sessions')
    .deleteMany({ _id: { $ne: sessionId }, 'session.user': userId });
};


exports.getUsers = getUsers;
exports.getUser = getUser;
exports.getProfile = getProfile;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.updateProfile = updateProfile;
exports.signin = signin;
exports.createUser = createUser;
exports.resetpass = resetpass;
exports.logout = logout;
exports.signup = signup;
exports.sendMail = sendMail;
exports.verifyEmail = verifyEmail;
exports.forgetPassword = forgetPassword;
