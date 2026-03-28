import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCbotIjvaW7u5ML54cwKVywj6NLSzPROLE");

async function listModels() {
  const models = await genAI.getModels();
  console.log(models);
}

listModels().catch(console.error);
