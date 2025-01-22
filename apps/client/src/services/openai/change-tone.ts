import { axios } from '../../libs/axios';

type Mood = "casual" | "professional" | "confident" | "friendly";

export const changeTone = async (text: string, mood: Mood) => {
  const { data } = await axios.post('/openai/change-tone', { text, mood });
  return data;
};
