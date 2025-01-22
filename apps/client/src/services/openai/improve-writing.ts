/* eslint-disable lingui/text-restrictions */

import { axios } from '../../libs/axios';

export const improveWriting = async (text: string) => {
  const { data } = await axios.post('/openai/improve-writing', { text });
  return data;
};
