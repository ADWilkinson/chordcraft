import { addWebsites } from "./websites.js";
const websites = require("./websites.json");

addWebsites(websites)
  .then(() => {
    console.log("Websites added");
  })
  .catch((err) => {
    console.log("Error adding websites", err);
  });
