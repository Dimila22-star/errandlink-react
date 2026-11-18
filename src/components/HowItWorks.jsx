const steps = [
  {
    number: 1,
    title: "Send your list",
    text: "Share the items you need, quantities, and any preferences.",
  },
  {
    number: 2,
    title: "We shop for you",
    text: "A local runner compares stalls and negotiates a fair price.",
  },
  {
    number: 3,
    title: "Delivered or guided",
    text: "Get your items dropped off, or meet us at the market in person.",
  },
  {
    number: 4,
    title: "Custom orders welcome",
    text: "Send us a message with your specific requests.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works">
      <h2>How it works</h2>
      <div className="steps">
        {steps.map((step) => (
          <div key={step.number} className="step">
            <span>{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;