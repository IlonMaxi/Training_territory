const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/ml/predict', async (req, res) => {
  const baseUrl = process.env.ML_URL || 'http://127.0.0.1:8001';
  const url = `${baseUrl}/predict`;

  try {
    const response = await axios.post(url, req.body, { timeout: 5000 });
    res.json(response.data);
  } catch (error) {
    const message = error.response?.data?.detail || 'ML service unavailable';
    res.status(502).json({ error: message });
  }
});

module.exports = router;
