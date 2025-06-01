module.exports = app => {
  const permissions = require("../controllers/permission.controller.js");
  const { authJwt, loadPermissions } = require("../middleware");
  const router = require("express").Router();

  // Apply authentication and permissions middleware to all routes
  router.use(authJwt.verifyToken);
  router.use(loadPermissions);
  
  // Apply admin authorization to create, update, delete operations
  router.use("/", authJwt.isAdmin);

  // Create a new Permission
  router.post("/", permissions.create);

  // Retrieve all Permissions
  router.get("/", permissions.findAll);

  // Retrieve a single Permission with id
  router.get("/:id", permissions.findOne);

  // Retrieve Permissions by category
  router.get("/category/:category", permissions.findByCategory);

  // Update a Permission with id
  router.put("/:id", permissions.update);

  // Delete a Permission with id
  router.delete("/:id", permissions.delete);

  // Activate a Permission
  router.put("/:id/activate", permissions.activate);

  // Deactivate a Permission
  router.put("/:id/deactivate", permissions.deactivate);

  app.use('/api/permissions', router);
};
