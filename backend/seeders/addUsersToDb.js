import { User } from "../models/user.model.js";
import { users } from "./users.js";

async function addUsers() {
  const userDocs = users.map((user) => {
    return new User(user);
  });

  const savedUsers = await Promise.all(userDocs.map((user) => user.save()));

  return savedUsers;
}

addUsers()
  .then((savedUsers) => {
    console.log("Users added to DB:", savedUsers);
  })
  .catch((error) => {
    console.error("Error adding users to DB:", error);
  });
