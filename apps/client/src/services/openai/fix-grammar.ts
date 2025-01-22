/* eslint-disable lingui/text-restrictions */

import { axios } from '../../libs/axios';

export const fixGrammar = async (text: string) => {
  const { data } = await axios.post('/openai/fix-grammar', { text });
  return data;
};
