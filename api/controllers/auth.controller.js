import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || 
    !email || 
    !password || 
    username === "" || 
    email === "" || 
    password === "") {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
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
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
  }

} 