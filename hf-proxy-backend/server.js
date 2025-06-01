require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const HF_API_TOKEN = process.env.HF_API_TOKEN;
const HF_MODEL = process.env.HF_MODEL;

app.post('/api/chat', async (req, res) => {
  const prompt = req.body.prompt;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 100,
          do_sample: true,
          temperature: 0.7,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          Accept: 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error from HF API:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch from Hugging Face API' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend proxy server running on port ${PORT}`);
});
