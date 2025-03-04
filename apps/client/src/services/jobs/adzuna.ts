import { useQuery } from "@tanstack/react-query";
import { axios } from "../../libs/axios";

const ADZUNA_API_BASE_URL = "https://api.adzuna.com/v1/api";

export type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string; area: string[] };
  salary_min: number;
  salary_max: number;
  description: string;
  redirect_url: string;
  contract_type: string;
  created: string;
};

export const useAdzunaJobs = (
  query: string = "",
  country: string = "gb",
  page: number = 1,
  resultsPerPage: number = 10
) => {
  return useQuery({
    queryKey: ["adzuna-jobs", query, country, page, resultsPerPage],
    queryFn: async () => {
      const { data } = await axios.get(`/jobs/adzuna/search`, {
        params: {
          what: query,
          where: country,
          page,
          results_per_page: resultsPerPage,
        },
      });
      return data;
    },
    enabled: !!query,
  });
}; 