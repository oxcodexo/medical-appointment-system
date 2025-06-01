module.exports = app => {
  const userPermissions = require("../controllers/userPermission.controller.js");
  const { authJwt, loadPermissions } = require("../middleware");
  const router = require("express").Router();

  // Apply authentication and permissions middleware to all routes
  router.use(authJwt.verifyToken);
  router.use(loadPermissions);
  
  // Apply admin authorization to create, update, delete operations
  router.use("/", authJwt.isAdminOrResponsable);

  // Create a new UserPermission
  router.post("/", userPermissions.create);

  // Retrieve all UserPermissions
  router.get("/", userPermissions.findAll);

  // Retrieve all permissions for a user
  router.get("/user/:userId", userPermissions.findByUser);

  // Retrieve a single UserPermission with id
  router.get("/:id", userPermissions.findOne);

  // Update a UserPermission with id
  router.put("/:id", userPermissions.update);

  // Delete a UserPermission with id
  router.delete("/:id", userPermissions.delete);

  // Delete all permissions for a user
  router.delete("/user/:userId", userPermissions.deleteByUser);

  // Check if a user has a specific permission
  router.get("/check/:userId/:permissionName", userPermissions.checkPermission);

  // Activate a UserPermission
  router.put("/:id/activate", userPermissions.activate);

  // Deactivate a UserPermission
  router.put("/:id/deactivate", userPermissions.deactivate);

  app.use('/api/user-permissions', router);
};
