import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, getUserByEmail } from "../../models/auth/auth.model.js";
import { ErrorHandler } from "../../helpers/handleError/error.js";

const generateToken = (user) => {
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "10h",
  });
};

export const doRegister = async (req, res, next) => {
  try {
    const { email, password, isManager } = req.body;
    const hashedPassword = bcrypt.hashSync(String(password), 10);
    const result = await createUser(email, hashedPassword, isManager);
    if (result.rowCount > 0)
      res.status(201).json({ message: "Reviewer add sucessfully!" });
    else res.status(201).json({ message: "Email already exists." });
  } catch (error) {
    next(error);
  }
};

export const doLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user) {
      throw new ErrorHandler(203, "Invalid Email or Password!");
    } else {
      if (bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.status(200).json({
          token,
          email: user.email,
          role_id: user.role_type,
        });
      } else {
        throw new ErrorHandler(203, "Invalid Email or Password!");
      }
    }
  } catch (error) {
    next(error);
  }
};
