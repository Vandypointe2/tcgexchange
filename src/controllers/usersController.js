const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// User Signup
exports.signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // look for existing user,
    // if a user does not exist `created` will be true and the new user instance will be returned
    const [user, created] = await User.findOrCreate({
      where: { username },
      // set the password only if the user does not exist yet.
      defaults: { password: hashedPassword }
    });

    if (!created) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    return res.json({ token });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Token Validation
exports.validate = async (req, res) => {
  res.sendStatus(200); // Token is valid if it passes auth middleware
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'username', 'avatarUrl']
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update profile (username + avatarUrl)
exports.updateProfile = async (req, res) => {
  try {
    const { username, avatarUrl } = req.body;

    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (username !== undefined) {
      const newName = String(username).trim();
      if (newName.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
      if (!/^[a-zA-Z0-9_]+$/.test(newName)) return res.status(400).json({ error: 'Username may only include letters, numbers, and underscore' });

      if (newName !== user.username) {
        const existing = await User.findOne({ where: { username: newName } });
        if (existing) return res.status(409).json({ error: 'Username is already taken' });
        user.username = newName;
      }
    }

    if (avatarUrl !== undefined) {
      const url = String(avatarUrl).trim();
      if (url === '') {
        user.avatarUrl = null;
      } else if (!/^https?:\/\//i.test(url)) {
        return res.status(400).json({ error: 'Avatar URL must start with http:// or https://' });
      } else {
        user.avatarUrl = url;
      }
    }

    await user.save();

    return res.json({ id: user.id, username: user.username, avatarUrl: user.avatarUrl });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }

    if (String(newPassword).length < 10) {
      return res.status(400).json({ error: 'New password must be at least 10 characters' });
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // Issue a fresh token (forces client to update stored token)
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    return res.json({ ok: true, token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
