
const {authService} = require("./auth-service.js");

const rnPluginConfig = [
  {
    name: "auth-service",
    func: authService,
  },
];
module.exports = { rnPluginConfig };
