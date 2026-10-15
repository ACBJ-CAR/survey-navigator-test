type Estimate = { status: "insufficient" } | { status: "preliminary" | "updated"; range: string };

export function BizEstimateCard({ estimate }: { estimate: Estimate }) {
  return (
    <section className="estimate-card" aria-labelledby="estimate-title">
      <div className="estimate-icon" aria-hidden="true">
        <span>↗</span>
      </div>
      <h2 id="estimate-title">
        {estimate.status === "updated" ? "BizEstimate updated" : "Your BizEstimate"}
      </h2>
      {estimate.status === "insufficient" ? (
        <p>Complete a few questions to begin building your estimate.</p>
      ) : (
        <>
          <p className="estimate-range">{estimate.range}</p>
          <p>Synthetic prototype estimate only. Not a professional valuation.</p>
          <p className="estimate-source-note">A demonstration value based only on designated company size and revenue inputs.</p>
        </>
      )}
    </section>
  );
}
