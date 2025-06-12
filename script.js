let web3;
let contract;
const contractAddress = "0x4436a07606de10ea23dac531672d855ec4b9de37";
const tokenAddress = "0x65e47d9bd03c73021858ab2e1acb2cab38d9b039";
let accounts;

window.addEventListener("load", async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        accounts = await web3.eth.getAccounts();
        contract = new web3.eth.Contract(stakingABI, contractAddress);
        document.getElementById("status").innerText = "✅ Connected: " + accounts[0];
    } else {
        alert("⚠️ Please install MetaMask");
    }
});

document.getElementById("connectWallet").onclick = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    accounts = await web3.eth.getAccounts();
    document.getElementById("status").innerText = "✅ Connected: " + accounts[0];
};

document.getElementById("approveBtn").onclick = async () => {
    const amount = document.getElementById("stakeAmount").value;
    const tokenContract = new web3.eth.Contract([
        { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "type": "function" }
    ], tokenAddress);
    await tokenContract.methods.approve(contractAddress, web3.utils.toWei(amount)).send({ from: accounts[0] });
    alert("Approved");
};

document.getElementById("stakeBtn").onclick = async () => {
    const amount = document.getElementById("stakeAmount").value;
    const tier = parseInt(document.getElementById("stakeTier").value);
    await contract.methods.stake(web3.utils.toWei(amount), tier).send({ from: accounts[0] });
    alert("Staked");
};

document.getElementById("claimBtn").onclick = async () => {
    await contract.methods.claim(0).send({ from: accounts[0] });
    alert("Claimed");
};

document.getElementById("unstakeBtn").onclick = async () => {
    await contract.methods.unstake(0).send({ from: accounts[0] });
    alert("Unstaked");
};
