import jwt from "jsonwebtoken";
import cookie from "cookie";


function socketAuth(socket, next) {

  try {

    // Get cookie header
    const cookieHeader =
      socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error("No cookies"));
    }

    // Parse cookies
    const cookies =
      cookie.parse(cookieHeader);

    const token = cookies.token;

    if (!token) {
      return next(new Error("No token"));
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.jwtSECRET
    );

    // Attach user to socket
    socket.user = decoded;

    next();

  } catch (err) {

    next(new Error("Authentication error"));

  }

}

export default socketAuth;