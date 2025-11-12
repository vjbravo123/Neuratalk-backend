import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const testOpenAI = async () => {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello AI!" }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    console.log(res.data.choices[0].message.content);
  } catch (err) {
    console.error(err.response?.status, err.response?.data);
  }
};

testOpenAI();
