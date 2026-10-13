import { useState } from "react";
import Identicon from "react-identicons";
import moment from "moment";
import { truncate } from "../store";

const Voters = ({ votes }) => {
  const [filter, setFilter] = useState("all");
  const visible = votes.filter((vote) => filter === "accept" ? vote.choosen : filter === "reject" ? !vote.choosen : true);

  return (
    <section className="mt-8">
      <h3 className="font-semibold mb-4">Voters</h3>
      <div className="flex justify-center mb-6">
        {["all", "accept", "reject"].map((name) => (
          <button key={name} type="button" onClick={() => setFilter(name)}
            className={`border border-blue-600 px-6 py-2 text-xs uppercase ${filter === name ? "bg-blue-600 text-white" : "text-blue-500"}`}>
            {name}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-gray-500"><tr>
            <th className="px-6 py-4 text-left">Voter</th>
            <th className="px-6 py-4 text-left">Voted</th>
            <th className="px-6 py-4 text-left">Choice</th>
          </tr></thead>
          <tbody>
            {visible.map((vote) => (
              <tr key={vote.voter.toLowerCase()} className="border-b border-gray-500">
                <td className="px-6 py-4"><div className="flex items-center space-x-3">
                  <Identicon string={vote.voter.toLowerCase()} size={25} />
                  <span>{truncate(vote.voter, 4, 4, 11)}</span>
                </div></td>
                <td className="px-6 py-4">{moment(Number(vote.timestamp) * 1000).fromNow()}</td>
                <td className={`px-6 py-4 ${vote.choosen ? "text-blue-500" : "text-red-500"}`}>{vote.choosen ? "Accepted" : "Rejected"}</td>
              </tr>
            ))}
            {!visible.length && <tr><td colSpan={3} className="px-6 py-8 text-center">No votes found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Voters;
