import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const authenticate = async (req, check = false) => {
  const authHeader = req.headers.get("authorization");

  if (check) {
    if (!authHeader) {
      return { authenticated: true, decoded_Data: { id: null } };
    }
  }

  if (!authHeader) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.split(" ")[1];
      console.log('token', token)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('decoded')
    if (!decoded) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        ),
      };
    }
    return { authenticated: true, decoded_Data: decoded };
  }catch (error) {
  console.error(error);
  console.error(error.name);
  console.error(error.message);

  return {
    authenticated: false,
    response: NextResponse.json(
      {
        error: error.message,
      },
      { status: 401 }
    ),
  };
}
};
