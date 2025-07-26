import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  
  if (!username || 
    !email || 
    !password || 
    username === "" || 
    email === "" || 
    password === "") {
    next(errorHandler(400, 'Tous les champs sont obligatoires'));
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = new User({
    username: username,
    email: email,
    password: hashedPassword
  });


  try {
    await newUser.save();
    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur :', error);
    next(errorHandler(500, 'Erreur lors de la création de l\'utilisateur'));
  }

} 