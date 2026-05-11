import { publicGet } from "../instances/public";

export const getExample = async () => publicGet<string>("/api/");
