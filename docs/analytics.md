# AquaInsight Analytical Formulations

## 1. AquaInsight Composite Stream Health Indicator
The composite score aggregates five core indicators:
- **Water Quality:** 30%
- **Biodiversity:** 25%
- **Habitat Condition:** 20%
- **Citizen Observation Signal:** 15%
- **Environmental Context:** 10%

### Proportional Weight Redistribution Rule
If one or more indicators are missing, available weights are dynamically normalized to sum to 100%:
$$w'_i = \frac{w_i}{\sum_{j \in \text{available}} w_j} \times 100\%$$
A confidence penalty of $15\%$ per missing indicator is applied to reflect higher observational uncertainty.

## 2. Confidence Model (0–100)
Evaluated across 4 inputs:
1. **Observation Volume (35 pts):** $\ge 25$ obs $\to 35$, $\ge 10 \to 24$, $\ge 4 \to 14$, $< 4 \to 5$.
2. **Temporal Recency (25 pts):** $\le 7$ days $\to 25$, $\le 21$ days $\to 18$, $\le 45$ days $\to 10$, $> 45$ days $\to 2$.
3. **Multi-Indicator Breadth (25 pts):** $\ge 80\%$ indicators $\to 25$, $\ge 60\% \to 16$, $< 60\% \to 6$.
4. **Historical Depth (15 pts):** $\ge 90$ days span $\to 15$, $\ge 30$ days $\to 9$, $< 30$ days $\to 3$.

Classification:
- **High:** $\ge 75$
- **Medium:** $45 - 74$
- **Low:** $< 45$

## 3. "What Changed?" Temporal Delta
Calculates period-over-period percentage shifts for each parameter:
$$\Delta = \frac{\bar{x}_{\text{current}} - \bar{x}_{\text{previous}}}{\bar{x}_{\text{previous}}} \times 100\%$$
Ranks factors by absolute magnitude $|\Delta|$ and labels the primary shifting driver.

## 4. Potential Monitoring Hotspot Algorithm
Flagged when:
- Site composite is $\ge 12$ points below nearby catchment average ($<15$ km radius).
- Physicochemical water quality dropped $\ge 10\%$ over 30 days.
- Citizen pollution incidents surged $\ge 15\%$.
