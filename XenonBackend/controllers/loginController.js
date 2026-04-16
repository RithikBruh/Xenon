import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getUser } from "../models/userModel.js";

function createJWT(username) {
  const token = jwt.sign({ username }, process.env.jwtSECRET, {
    expiresIn: "6000s",
  });
  return token;
}


export default async function loginController(username, password) {
  const user = await getUser(username);
  console.log("user is " + JSON.stringify(user))
  if (user) {
    if (await bcrypt.compare(password, user.password)) {
      // passwords match : Create JWT and send
      const token = createJWT(username);
      return {code:200,token,msg:"Login Successful" };
    }
  }
  return {code:401,token:null,msg:"Login Failed"}
}
