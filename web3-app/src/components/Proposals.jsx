import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Identicon from "react-identicons";
import { toast } from "react-toastify";
import { truncate, useGlobalState } from "../store";
import { payoutBeneficiary } from "../Blockchain.services";

const Proposals = () => {
  const [proposals] = useGlobalState("proposals");
  const [isStakeholder] = useGlobalState("isStakeholder");
  const [filter, setFilter] = useState("all");
  const [now, setNow] = useState(Date.now());
  const [pending, setPending] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePayout = async (id) => {
    setPending(id);
    try {
      await payoutBeneficiary(id);
      toast.success("Payout thành công!");
    } catch (error) {
      toast.error(error.message || "Thanh toán không thành công.");
    } finally {
      setPending(null);
    }
  };

  const visible = proposals.filter((proposal) => {
    const open = now < Number(proposal.duration) * 1000;
    return filter === "open" ? open : filter === "closed" ? !open : true;
  });

  const buttonClass = "rounded-full border border-blue-500 px-4 py-2 text-xs uppercase text-blue-500 disabled:opacity-50";

  return (
    <section className="p-8">
      <div className="flex justify-center mb-6">
        {["all", "open", "closed"].map((name) => (
          <button key={name} type="button" onClick={() => setFilter(name)}
            className={`border border-blue-600 px-6 py-2 text-xs uppercase ${filter === name ? "bg-blue-600 text-white" : "text-blue-500"}`}>
            {name}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-gray-500">
            <tr>{["Created By", "Title", "Amount", "Expires", "Votes", "Action"].map((label) => (
              <th key={label} className="px-6 py-4 text-left">{label}</th>
            ))}</tr>
          </thead>
          <tbody>
            {visible.map((proposal) => {
              const expired = now >= Number(proposal.duration) * 1000;
              const accepted = proposal.upvotes > proposal.downvotes;
              return (
                <tr key={proposal.id} className="border-b border-gray-500">
                  <td className="px-6 py-4"><div className="flex items-center space-x-3">
                    <Identicon string={proposal.proposer.toLowerCase()} size={25} />
                    <span>{truncate(proposal.proposer, 4, 4, 11)}</span>
                  </div></td>
                  <td className="px-6 py-4">{proposal.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proposal.amount} ETH</td>
                  <td className="px-6 py-4 whitespace-nowrap">{expired ? "Expired" : `${Math.ceil((Number(proposal.duration) * 1000 - now) / 1000)}s`}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{proposal.upvotes} Accept / {proposal.downvotes} Reject</td>
                  <td className="px-6 py-4"><div className="flex items-center gap-3 whitespace-nowrap">
                    <Link className={buttonClass} to={`/proposal/${proposal.id}`}>View</Link>
                    {proposal.paid ? <span className="text-green-500">Paid</span> : expired ? (
                      accepted ? (isStakeholder ? (
                        <button type="button" className={buttonClass} disabled={pending !== null} onClick={() => handlePayout(proposal.id)}>
                          {pending === proposal.id ? "Confirming..." : "Payout"}
                        </button>
                      ) : <span>Passed</span>) : <span className="text-red-500">Not Passed</span>
                    ) : <span>Pending</span>}
                  </div></td>
                </tr>
              );
            })}
            {!visible.length && <tr><td colSpan={6} className="px-6 py-8 text-center">No proposals found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Proposals;
