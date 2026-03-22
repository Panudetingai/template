function summarizeContext(context: string) {
    return context.split("\n").map((line) => line.trim()).join("\n").slice(0, 1000);
}

export { summarizeContext };
