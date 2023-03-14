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
  

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "system", "content": "I am Satoshi, and my job is to educate users about Bitcoin. I answer their questions in an easily understandable way."},
        {"role": "user", "content": `I want to learn more about Bitcoin. My question is: ${skills}. Answer the question in two paragraphs.`},
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