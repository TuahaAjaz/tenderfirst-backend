const mongoose = require("mongoose");
const RolesSchema = require("../models/Roles");
const asyncHandler = require("../middlewares/async");

const CreateRole = asyncHandler(async (req, res, next) => {
    const result = await RolesSchema.create(req.body);
    res.status(200).json({success: true, result: result});
});

const UpdateRole = asyncHandler(async (req, res, next) => {
    const updates = req.body.updates;
    const result = await RolesSchema.findOneAndUpdate(
        { _id: req.body.roleId },
        updates,
        { new: true }
    );
    res.status(200).json({success: true, result: result});
});

const GetRoles = asyncHandler(async (req, res, next) => {
    req.model = RolesSchema;
    next();
});

const DeleteRole = asyncHandler(async (req, res, next) => {
    await RolesSchema.deleteOne({ _id: req.body.roleId });
    res.status(200).json({success: true});
})

exports.CreateRole = CreateRole;
exports.DeleteRole = DeleteRole;
exports.GetRoles = GetRoles;
exports.UpdateRole = UpdateRole;