module.exports = app => {
  const rolePermissions = require("../controllers/rolePermission.controller.js");
  const { authJwt, loadPermissions } = require("../middleware");
  const router = require("express").Router();

  // Apply authentication and permissions middleware to all routes
  router.use(authJwt.verifyToken);
  router.use(loadPermissions);
  
  // Apply admin authorization to create, update, delete operations
  router.use("/", authJwt.isAdmin);

  // Create a new RolePermission
  router.post("/", rolePermissions.create);

  // Retrieve all RolePermissions
  router.get("/", rolePermissions.findAll);

  // Retrieve all permissions for a role
  router.get("/role/:role", rolePermissions.findByRole);

  // Retrieve a single RolePermission with id
  router.get("/:id", rolePermissions.findOne);

  // Delete a RolePermission with id
  router.delete("/:id", rolePermissions.delete);

  // Delete all permissions for a role
  router.delete("/role/:role", rolePermissions.deleteByRole);

  // Check if a role has a specific permission
  router.get("/check/:role/:permissionName", rolePermissions.checkPermission);

  app.use('/api/role-permissions', router);
};
