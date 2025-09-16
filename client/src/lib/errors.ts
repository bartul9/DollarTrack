export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const jsonMatch = error.message.match(/\{.*\}$/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.message) {
          return parsed.message as string;
        }
      } catch (parseError) {
        console.error("Failed to parse error message", parseError);
      }
    }

    const parts = error.message.split(": ");
    if (parts.length > 1) {
      return parts.slice(1).join(": ");
    }
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Something went wrong";
}
