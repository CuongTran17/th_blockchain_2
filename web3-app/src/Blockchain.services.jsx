import Web3 from "web3";
import { setGlobalState, getGlobalState } from "./store";
import abi from "./abis/DominionDAO.json";

const { ethereum } = window;
const web3 = ethereum ? new Web3(ethereum) : null;
let listenersRegistered = false;

const getEtheriumContract = async () => {
  if (!ethereum) {
    throw new Error("Vui lòng cài MetaMask.");
  }

  const chainId = await ethereum.request({
    method: "eth_chainId",
  });

  if (chainId !== "0xaa36a7") {
    throw new Error("Vui lòng chuyển MetaMask sang mạng Sepolia.");
  }

  const address = process.env.REACT_APP_CONTRACT_ADDRESS;

  if (!web3.utils.isAddress(address || "")) {
    throw new Error("Địa chỉ contract trong .env không hợp lệ.");
  }

  const contract = new web3.eth.Contract(abi.abi, address);
  setGlobalState("contract", contract);

  return contract;
};

const requireAccount = () => {
  const account = getGlobalState("connectedAccount");

  if (!account) {
    throw new Error("Vui lòng kết nối ví trước.");
  }

  return account;
};

const connectWallet = async () => {
  if (!ethereum) {
    throw new Error("Vui lòng cài MetaMask.");
  }

  const accounts = await ethereum.request({
    method: "eth_requestAccounts",
  });

  setGlobalState(
    "connectedAccount",
    accounts[0] ? accounts[0].toLowerCase() : ""
  );

  window.location.reload();
};

// Giữ cách viết tên hàm như tài liệu.
const isWallectConnected = async () => {
  if (!ethereum) return false;

  if (!listenersRegistered) {
    ethereum.on("chainChanged", () => window.location.reload());
    ethereum.on("accountsChanged", () => window.location.reload());
    listenersRegistered = true;
  }

  const accounts = await ethereum.request({
    method: "eth_accounts",
  });

  setGlobalState(
    "connectedAccount",
    accounts[0] ? accounts[0].toLowerCase() : ""
  );

  return accounts.length > 0;
};

const getInfo = async () => {
  if (!getGlobalState("connectedAccount")) return;

  const contract = await getEtheriumContract();
  const account = requireAccount();

  const [isStakeholder, balance, mybalance] = await Promise.all([
    contract.methods.isStakeholder().call({ from: account }),
    contract.methods.daoBalance().call(),
    contract.methods.getBalance().call({ from: account }),
  ]);

  setGlobalState("isStakeholder", isStakeholder);
  setGlobalState("balance", web3.utils.fromWei(balance, "ether"));
  setGlobalState("mybalance", web3.utils.fromWei(mybalance, "ether"));
};

const performContribute = async (amount) => {
  const account = requireAccount();
  const contract = await getEtheriumContract();
  const value = web3.utils.toWei(amount.toString(), "ether");

  if (web3.utils.toBN(value).lte(web3.utils.toBN("0"))) {
    throw new Error("Số ETH đóng góp phải lớn hơn 0.");
  }

  await contract.methods.contribute().send({
    from: account,
    value,
  });

  await getInfo();
};

const structuredProposals = (proposals) =>
  proposals.map((proposal) => ({
    id: proposal.id,
    amount: web3.utils.fromWei(proposal.amount, "ether"),
    title: proposal.title,
    description: proposal.description,
    paid: proposal.paid,
    passed: proposal.passed,
    proposer: proposal.proposer,
    upvotes: Number(proposal.upvotes),
    downvotes: Number(proposal.downvotes),
    beneficiary: proposal.beneficiary,
    executor: proposal.executor,
    duration: proposal.duration,
  }));

const getProposals = async () => {
  if (!getGlobalState("connectedAccount")) return;

  const contract = await getEtheriumContract();
  const proposals = await contract.methods.getProposals().call();

  setGlobalState(
    "proposals",
    structuredProposals(proposals).reverse()
  );
};

const getProposal = async (id) => {
  const contract = await getEtheriumContract();
  const proposal = await contract.methods.getProposal(id).call();

  return structuredProposals([proposal])[0];
};

const raiseProposal = async ({
  title,
  description,
  beneficiary,
  amount,
}) => {
  const account = requireAccount();
  const contract = await getEtheriumContract();

  if (!web3.utils.isAddress(beneficiary)) {
    throw new Error("Địa chỉ người nhận không hợp lệ.");
  }

  const value = web3.utils.toWei(amount.toString(), "ether");

  if (web3.utils.toBN(value).lte(web3.utils.toBN("0"))) {
    throw new Error("Số ETH yêu cầu phải lớn hơn 0.");
  }

  await contract.methods
    .createProposal(title, description, beneficiary, value)
    .send({ from: account });

  await getProposals();
};

const voteOnProposal = async (proposalId, supported) => {
  const account = requireAccount();
  const contract = await getEtheriumContract();

  await contract.methods
    .performVote(proposalId, supported)
    .send({ from: account });

  await getProposals();
};

const listVoters = async (id) => {
  const contract = await getEtheriumContract();
  return contract.methods.getVotesOf(id).call();
};

const payoutBeneficiary = async (id) => {
  const account = requireAccount();
  const contract = await getEtheriumContract();

  await contract.methods
    .payBeneficiary(id)
    .send({ from: account });

  await getInfo();
  await getProposals();
};

export {
  isWallectConnected,
  connectWallet,
  performContribute,
  getInfo,
  raiseProposal,
  getProposals,
  getProposal,
  voteOnProposal,
  listVoters,
  payoutBeneficiary,
};