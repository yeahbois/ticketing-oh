import { Link } from "react-router-dom";

export default function Database() {
  return (
    <div>
      <h1>Ticketing System</h1>
      <Link to="/scan">Scan Ticket</Link>
    </div>
  );
}