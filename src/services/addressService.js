import { config } from "@/config/site";

const fetchJson = async (path) => {
  const response = await fetch(`${config.email.backendUrl}${path}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
};

export const getUsCitiesByState = async (stateAbbreviation) => {
  if (!stateAbbreviation) return [];
  const data = await fetchJson(`/api/addresses/cities?state=${encodeURIComponent(stateAbbreviation)}`);
  return data.cities || [];
};

export const getUsZipCodesByCity = async (stateAbbreviation, city) => {
  if (!stateAbbreviation || !city) return [];
  const data = await fetchJson(
    `/api/addresses/zip-codes?state=${encodeURIComponent(stateAbbreviation)}&city=${encodeURIComponent(city)}`
  );
  return data.zipCodes || [];
};
