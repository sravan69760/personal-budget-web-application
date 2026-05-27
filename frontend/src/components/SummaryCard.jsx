export default function SummaryCard({ label, value, helper, tone = "neutral" }) {
  return (
    <section className={`summary-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </section>
  );
}
