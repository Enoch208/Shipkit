const ACE_BASE = "https://api.acedata.cloud";

export async function aceChatJson(
  token: string,
  systemPrompt: string,
  userPrompt: string,
  model = "gpt-4o-mini"
): Promise<unknown> {
  const res = await fetch(`${ACE_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Ace API error (${res.status}): ${text.slice(0, 300)}`
    );
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Ace returned no content");

  try {
    return JSON.parse(content);
  } catch {
    throw new Error("Ace response was not valid JSON");
  }
}
