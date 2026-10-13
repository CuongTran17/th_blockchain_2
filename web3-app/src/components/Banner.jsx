import { useState } from "react";
import { toast } from "react-toastify";
import { useGlobalState, setGlobalState } from "../store";
import { performContribute } from "../Blockchain.services";

const Banner = () => {
  const [connectedAccount] = useGlobalState("connectedAccount");
  const [isStakeholder] = useGlobalState("isStakeholder");
  const [proposals] = useGlobalState("proposals");
  const [balance] = useGlobalState("balance");
  const [mybalance] = useGlobalState("mybalance");

  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);

  const opened = proposals.filter(
    (proposal) => Date.now() < Number(proposal.duration) * 1000
  ).length;

  const onContribute = async (event) => {
    event.preventDefault();
    setPending(true);

    try {
      await performContribute(amount);
      setAmount("");
      toast.success("Contribution received");
    } catch (error) {
      toast.error(error.message || "Đóng góp không thành công.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="p-8">
      <h2 className="font-semibold text-3xl mb-5">
        {opened} Proposal{opened === 1 ? "" : "s"} Currently Opened
      </h2>

      {!connectedAccount ? (
        <p>Please connect your wallet to use the DAO.</p>
      ) : (
        <>
          <p>
            Current DAO Balance: <strong>{balance} ETH</strong>
            <br />
            Your contributions: <strong>{mybalance} ETH</strong>
            {isStakeholder ? ", and you are now a stakeholder 😊" : ""}
          </p>

          <hr className="my-6 border-gray-300 dark:border-gray-500" />

          <p>
            {isStakeholder
              ? "You can now raise proposals on this platform."
              : "Contribute a total of at least 0.01 ETH to become a stakeholder."}
          </p>

          <form onSubmit={onContribute} className="mt-4">
            <label htmlFor="contribution" className="sr-only">
              Contribution in ETH
            </label>

            <input
              id="contribution"
              type="number"
              step="any"
              min="0"
              required
              disabled={pending}
              placeholder="e.g. 0.01 ETH"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="block w-full md:w-1/3 px-3 py-1.5 rounded border border-gray-400 bg-transparent"
            />

            <button
              type="submit"
              disabled={pending || !amount || Number(amount) <= 0}
              className="mt-4 px-6 py-2.5 rounded-full border border-blue-500 text-blue-500 text-xs uppercase disabled:opacity-50"
            >
              {pending ? "Confirming..." : "Contribute"}
            </button>

            {isStakeholder && (
              <button
                type="button"
                disabled={pending}
                onClick={() => setGlobalState("createModal", "scale-100")}
                className="ml-3 mt-4 px-6 py-2.5 rounded-full border border-blue-500 text-blue-500 text-xs uppercase disabled:opacity-50"
              >
                Propose
              </button>
            )}
          </form>
        </>
      )}
    </section>
  );
};

export default Banner;