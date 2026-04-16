import * as Usermodel from "./models/userModel.js";
import bcrypt from "bcrypt";
const args = process.argv;

// console.log(args);
// // [nodePath, filePath, "10", "20"]

const username = args[2];
const password = args[3];

async function create() {
  await Usermodel.createTableIfnotExists();

  const users = await Usermodel.getUser(username);
  if (users) {
    console.log("username already exists (aborting)");
    process.exit();
  }
  const hash = await bcrypt.hash(password, 10);

  await Usermodel.createUser(username, hash);

  console.log(
    `sucesssfully created \n username : ${username} \n password : ${password} (${hash})`,
  );
  process.exit();
}

create();
