const contractAddress = "0x4436a07606de10ea23dac531672d855ec4b9de37";
const tokenAddress = "0x65e47d9bd03c73021858ab2e1acb2cab38d9b039";

let web3;
let contract;
let accounts;

async function connect() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        accounts = await web3.eth.getAccounts();
        contract = new web3.eth.Contract(stakingABI, contractAddress);
        document.getElementById("walletAddress").innerText = accounts[0];
        loadTVL();
    } else {
        alert("Please install MetaMask.");
    }
}

async function loadTVL() {
    const tvl = await contract.methods.totalStaked().call();
    document.getElementById("tvl").innerText = web3.utils.fromWei(tvl);
}

async function approve() {
    const amount = document.getElementById("stakeAmount").value;
    const token = new web3.eth.Contract([
        {"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"type":"function"}
    ], tokenAddress);

    await token.methods.approve(contractAddress, web3.utils.toWei(amount)).send({ from: accounts[0] });
    alert("Approved");
}

async function stake() {
    const amount = document.getElementById("stakeAmount").value;
    const tier = document.getElementById("stakeTier").value;
    await contract.methods.stake(web3.utils.toWei(amount), tier).send({ from: accounts[0] });
    alert("Staked");
    loadTVL();
}

async function claim() {
    await contract.methods.claim(0).send({ from: accounts[0] });
    alert("Reward Claimed");
}

async function unstake() {
    await contract.methods.unstake(0).send({ from: accounts[0] });
    alert("Unstaked");
}

document.getElementById("connectButton").onclick = connect;
document.getElementById("approveButton").onclick = approve;
document.getElementById("stakeButton").onclick = stake;
document.getElementById("claimButton").onclick = claim;
document.getElementById("unstakeButton").onclick = unstake;
