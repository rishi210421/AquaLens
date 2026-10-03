# AI Safety, Grounding & Responsible Environmental Governance

## Strict Grounding Guardrails
1. **No Hallucinated Metrics:** The LLM receives strictly serialized JSON computed by the deterministic analytics engine. It is explicitly prohibited from inventing numbers or facts.
2. **No Medical Claims:** The AI engine never makes human medical diagnoses (e.g. "this water will cause disease"). It frames all observations within ecosystem dynamics and community well-being.
3. **Explicit Uncertainty:** The AI output must always mention the data confidence level and cite any missing indicator streams.
4. **Deterministic Fallback:** If `GEMINI_API_KEY` is not present, AquaInsight runs its template engine so 100% of user interactions succeed without degradation.
