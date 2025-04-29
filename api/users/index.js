import dbConnect from '../../utils/dbConnect';
import User from '../../models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (user) return res.status(200).json({ user });
    return res.status(404).json({ user: null });
  }

  if (req.method === 'POST') {
    const { userId, email, virtualBalance, createdAt } = req.body;
    const newUser = new User({ userId, email, virtualBalance, createdAt });
    await newUser.save();
    return res.status(201).json({ user: newUser });
  }

  res.status(405).end(); // Method Not Allowed
}
