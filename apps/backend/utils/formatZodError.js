export const formatZodError = (zodErr) => {
    const issues = zodErr.issues || zodErr.errors || [];
    return {
        message: issues[0]?.message || "Validation failed.",
        errors: issues.map((issue) => ({
            field: issue.path.join(".") || "(root)",
            message: issue.message,
        })),
    };
};
