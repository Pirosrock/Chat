const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const User = require('../models/user.model')

router.post('/create', async (req, res) => {
  // Encriptar el password
  req.body.password = bcrypt.hashSync(req.body.password, 8)
  try {
    await User.create(req.body)
    res.redirect('/login')
  } catch (err) {
    console.log(err.message)
  }
})

router.post('/login', async (req, res) => {
  // Comrpuebo si el email está en la BD
  const user = await User.findOne({email: req.body.email})  

  if(!user) return res.redirect('/login?error=true')
  // Comprobamos si las password coinciden
  const iguales = bcrypt.compareSync(req.body.password, user.password)
  if (!iguales) return res.redirect('/login?error=true')
  
  // Login correcto
  res.cookie('chat_login', user._id)
  res.redirect('/chat')  
})


module.exports = router;
