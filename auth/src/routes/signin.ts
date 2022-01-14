import express from 'express'

const router = express.Router();

router.post('/api/users/signin', (req, res) => {
  const { email, password } = req.body;
  res.send(`Signin: ${email}`);
})

export {router as signInRouter};