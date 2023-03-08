import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from Career Path AI!'
  })
})

app.post('/', async (req, res) => {
  try {
    const skills = req.body.skills;
    const enjoys = req.body.enjoys;
    const balance = req.body.balance;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "system", "content": "As an expert experienced sage, I can produce incredible detailed summaries of books, allowing users to speed consume information. People use me to supplement reading fuul books"},
        {"role": "user", "content": `Please write a very detailed informative sumarry of the following book. This should supplement reading the whole book. The title is ${skills} and the author is ${balance}. Include a detailed main explaination titled "Overview" and bullet pointed info and teachings found within, titled "Key Takeaways". Do not include any other text outside these parameters, do not include title and author above`},
      ],
  
      
    });
    

    res.status(200).send({
      bot: response.data.choices[0].message.content,
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})

app.listen(5003, () => console.log('Career Path AI server started on http://localhost:5003'));