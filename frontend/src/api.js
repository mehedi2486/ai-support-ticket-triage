async function readResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an unreadable response. Check that the backend is running.");
  }
  if (!response.ok) {
    throw new Error(data.message || "The request could not be completed. Try again.");
  }
  if (!data.ticket || !data.ticket._id) {
    throw new Error("The response did not contain a saved ticket.");
  }
  return data.ticket;
}

export async function createTicket(title, body) {
  const response = await fetch("/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title.trim(), body: body.trim() }),
    signal: AbortSignal.timeout(25000),
  });
  return readResponse(response);
}

export async function findTicket(id) {
  const response = await fetch("/tickets/" + encodeURIComponent(id.trim()), {
    signal: AbortSignal.timeout(15000),
  });
  return readResponse(response);
}
