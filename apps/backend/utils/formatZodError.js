const flattenIssue = (issue) => {
    if (issue.code === "invalid_union" && Array.isArray(issue.errors)) {
        return issue.errors.flat().flatMap(flattenIssue);
    }
    return [issue];
};

export const formatZodError = (zodError) => {
    const errors = zodError.issues.flatMap(flattenIssue).map((issue) => ({
        field: issue.path.join(".") || "(root)",
        message: issue.message,
    }));

    return {
        message: errors[0]?.message || "Validation failed",
        errors,
    };
};
