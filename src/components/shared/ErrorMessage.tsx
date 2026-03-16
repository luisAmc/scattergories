export function ErrorMessage({ error }: { error: string | null }) {
    if (!error) {
        return null;
    }

    return (
        <div className="mb-4 border border-red-500 bg-red-50 p-4  font-semibold text-red-500">
            <p>{error}</p>
        </div>
    );
}
