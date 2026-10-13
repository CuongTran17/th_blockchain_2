import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { getProposal, listVoters, voteOnProposal } from "../Blockchain.services";
import { useGlobalState } from "../store";
import Voters from "./Voters";

const ProposalDetails = () => {
  const { id } = useParams();
  const [account] = useGlobalState("connectedAccount");
  const [isStakeholder] = useGlobalState("isStakeholder");
  const [proposals] = useGlobalState("proposals");
  const [proposal, setProposal] = useState(null);
  const [votes, setVotes] = useState([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!proposals.some((item) => String(item.id) === id)) {
        if (active) setError("Không tìm thấy đề xuất.");
        return;
      }
      try {
        const [detail, voters] = await Promise.all([getProposal(id), listVoters(id)]);
        if (active) {
          setProposal(detail);
          setVotes(voters);
          setError("");
        }
      } catch (error) {
        if (active) setError(error.message || "Không thể đọc đề xuất.");
      }
    };
    load();
    const refresh = setInterval(load, 10000);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      active = false;
      clearInterval(refresh);
      clearInterval(clock);
    };
  }, [id, proposals]);

  const onVote = async (choice) => {
    if (Date.now() >= Number(proposal.duration) * 1000) {
      toast.warning("Proposal expired!");
      return;
    }
    setPending(true);
    try {
      await voteOnProposal(id, choice);
      toast.success("Voted successfully!");
    } catch (error) {
      toast.error(error.message || "Bỏ phiếu không thành công.");
    } finally {
      setPending(false);
    }
  };

  if (error) return <p role="alert" className="p-8 text-red-500">{error}</p>;
  if (!proposal) return <p className="p-8">Loading proposal...</p>;

  const secondsLeft = Math.max(0, Math.ceil((Number(proposal.duration) * 1000 - now) / 1000));
  const expired = secondsLeft === 0;
  const hasVoted = votes.some((vote) => vote.voter.toLowerCase() === account.toLowerCase());
  const status = proposal.paid ? "Paid" : !expired ? "Pending" : proposal.upvotes > proposal.downvotes ? "Passed" : "Not Passed";
  const data = [{ name: "Voters", Acceptees: proposal.upvotes, Rejectees: proposal.downvotes }];
  const buttonClass = "rounded-full border border-blue-500 px-6 py-2.5 text-blue-500 text-xs uppercase disabled:opacity-50";

  return (
    <section className="p-8">
      <Link to="/" className="text-blue-500">← Back to proposals</Link>
      <h2 className="font-semibold text-3xl mt-6 mb-5">{proposal.title}</h2>
      <p>Amount: <strong>{proposal.amount} ETH</strong></p>
      <p>Status: <strong>{status}</strong></p>
      <p>Voting time: <strong>{expired ? "Expired" : `${Math.floor(secondsLeft / 60)}m ${secondsLeft % 60}s`}</strong></p>
      <p className="break-all mt-3">Beneficiary: {proposal.beneficiary}</p>
      <hr className="my-6 border-gray-500" />
      <p className="whitespace-pre-wrap">{proposal.description}</p>
      <div className="w-full h-64 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Acceptees" fill="#2563eb" />
            <Bar dataKey="Rejectees" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-3 mt-4">
        {isStakeholder && !expired && !proposal.paid && !hasVoted && <>
          <button type="button" className={buttonClass} disabled={pending} onClick={() => onVote(true)}>Accept</button>
          <button type="button" className={buttonClass} disabled={pending} onClick={() => onVote(false)}>Reject</button>
        </>}
        {pending && <p>Confirming transaction...</p>}
      </div>
      {hasVoted && <p className="mt-4">You have already voted on this proposal.</p>}
      {expired && <p className="mt-4">Voting has ended. Return to the proposal list to check Payout.</p>}
      <Voters votes={votes} />
    </section>
  );
};

export default ProposalDetails;
