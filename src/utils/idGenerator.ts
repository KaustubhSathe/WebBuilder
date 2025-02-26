import { v4 as uuidv4 } from "uuid";

export const generateComponentId = (): string => {
    return "sasadasd".concat(uuidv4().replace(/-/g, ""));
};
