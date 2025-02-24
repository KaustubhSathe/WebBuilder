let counter = 1;

export const generateComponentId = (prefix: string): string => {
    return `${prefix}_${counter++}`;
};

// Reset counter (useful for testing)
export const resetIdCounter = () => {
    counter = 1;
};
