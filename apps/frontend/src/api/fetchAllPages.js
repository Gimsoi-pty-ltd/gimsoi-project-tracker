import { resourceAPI } from "./api";

export const fetchAllPages = async (path, initialParams = {}) => {
  const records = [];
  let cursor = null;

  do {
    const params = new URLSearchParams({ ...initialParams, limit: "100" });
    if (cursor) params.set("cursor", cursor);
    const response = await resourceAPI.get(`${path}?${params.toString()}`);
    const page = response.data?.data;
    if (!Array.isArray(page)) throw new Error(`Unexpected list response from ${path}`);
    records.push(...page);
    cursor = response.data?.nextCursor || null;
  } while (cursor);

  return records;
};