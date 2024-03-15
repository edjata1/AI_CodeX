import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

import OpenAI from 'openai';

dotenv.config();

console.log(process.env.OPENAI_API_KEY)

// function: get key config
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, //'My API Key' //process.env.OPENAI_API_KEY,
});

// create instance of openai
// const openai = new OpenAIApi(configuration);

// initialize express application call express function
const app = express();

// *************setup middlewares*************: 
// cross origin requests: allows server to be called from front-end
app.use(cors());

// pass json from front-end to back-end
app.use(express.json());

// create dummy root route
app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello from CodeX',
    })
});

// create post route allows body with more text
app.post('/', async (req, res) => {
    try {
        // get prompt
        const prompt = req.body.prompt;

        // get response from openai's text-davinci-003 model
        const response = await openai.create({
            model: "gpt-3.5-turbo-instruct",
            prompt: `${prompt}`,
            temperature: 0, // Higher values means the model will take more risks.
            max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
            top_p: 1, // alternative to sampling with temperature, called nucleus sampling
            frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
            presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
          });
      
          // send response back to front-end
          res.status(200).send({
            bot: response.data.choices[0].text
          });
      
    } catch (error) {
        console.log(error)
        res.status(500).send({error} || 'Something went very, very wrong my friend!');
    }
})

app.listen(5002, () => console.log('AI server started on http://localhost:5002'))