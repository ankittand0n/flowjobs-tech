/* eslint-disable lingui/text-restrictions */

import { axios } from '../../libs/axios';

export const extractAtsKeywords = async (text: string) => {
  const { data } = await axios.post('/openai/extract-keywords', { text });
  return data;
};
