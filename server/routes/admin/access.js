const express = require('express');

const Clients = require('../../../models/Client');

const router = express.Router();

const ADMIN_ID = 1;

router.get('/admin/check-access', async (req, res) => {
  try {
    const userId = req.query.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const client = await Clients.findByPk(userId);

    if (!client) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (client.clientid == ADMIN_ID) {
      res.status(200).json({ access: true });
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
