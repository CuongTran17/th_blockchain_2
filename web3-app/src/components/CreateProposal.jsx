import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useGlobalState, setGlobalState } from "../store";
import { raiseProposal } from "../Blockchain.services";

const CreateProposal = () => {
  const [createModal] = useGlobalState("createModal");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);

  const closeModal = () => {
    if (pending) return;
    setGlobalState("createModal", "scale-0");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPending(true);

    try {
      await raiseProposal({
        title: title.trim(),
        description: description.trim(),
        beneficiary: beneficiary.trim(),
        amount,
      });

      toast.success("Proposal created");
      setTitle("");
      setDescription("");
      setBeneficiary("");
      setAmount("");
      setGlobalState("createModal", "scale-0");
    } catch (error) {
      toast.error(error.message || "Không thể tạo đề xuất.");
    } finally {
      setPending(false);
    }
  };

  if (createModal !== "scale-100") return null;

  const inputClass =
    "w-full mt-4 rounded-xl border border-gray-500 bg-transparent px-3 py-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="proposal-heading"
        className="w-full md:w-2/5 max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-[#212936] p-6 shadow-xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between">
            <h2 id="proposal-heading" className="font-semibold">
              Raise Proposal
            </h2>
            <button
              type="button"
              aria-label="Đóng form"
              disabled={pending}
              onClick={closeModal}
            >
              <FaTimes />
            </button>
          </div>

          <fieldset disabled={pending}>
            <input
              aria-label="Title"
              placeholder="Title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClass}
            />

            <input
              aria-label="Amount in ETH"
              type="number"
              step="any"
              min="0"
              placeholder="Amount, e.g. 0.005 ETH"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={inputClass}
            />

            <input
              aria-label="Beneficiary address"
              placeholder="Beneficiary Address: 0x..."
              required
              value={beneficiary}
              onChange={(event) => setBeneficiary(event.target.value)}
              className={inputClass}
            />

            <textarea
              aria-label="Description"
              placeholder="Description"
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={`${inputClass} h-24`}
            />

            <button
              type="submit"
              className="w-full mt-5 rounded-lg bg-blue-600 px-6 py-2.5 text-white text-xs uppercase disabled:opacity-50"
            >
              {pending ? "Confirming..." : "Submit Proposal"}
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default CreateProposal;