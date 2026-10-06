import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <section>
      <h1>AI Invest Portfolio</h1>
      <p>Здесь будет описание функционала и инструкция по использованию.</p>
      <Link to="/auth?mode=register">Начать</Link>
    </section>
  );
}
