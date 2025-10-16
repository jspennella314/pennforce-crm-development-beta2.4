export async function bulkDelete(model: string, ids: string[]) {
  const response = await fetch('/api/bulk/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete records');
  }

  return response.json();
}

export async function bulkUpdate(model: string, ids: string[], data: Record<string, any>) {
  const response = await fetch('/api/bulk/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, ids, data }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update records');
  }

  return response.json();
}
