let web3;
let contract;
let tokenContract;
const contractAddress = "0x4436a07606de10ea23dac531672d855ec4b9de37";
const tokenAddress = "0x65e47d9bd03c73021858ab2e1acb2cab38d9b039";
let user;

window.addEventListener("load", async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await connectWallet();
    } else {
        alert("⚠️ MetaMask not found");
    }
});

async function connectWallet() {
    try {
        await ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        user = accounts[0];
        contract = new web3.eth.Contract(stakingABI, contractAddress);
        tokenContract = new web3.eth.Contract([
            { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "type": "function" }
        ], tokenAddress);
        document.getElementById("status").innerText = "✅ Wallet: " + user;
    } catch (err) {
        console.error(err);
        document.getElementById("status").innerText = "❌ Wallet connect failed";
    }
}

document.getElementById("connectWallet").onclick = connectWallet;

document.getElementById("approveBtn").onclick = async () => {
    const amount = document.getElementById("stakeAmount").value;
    if (!amount || amount <= 0) {
        alert("❌ Invalid amount");
        return;
    }
    try {
        await tokenContract.methods
            .approve(contractAddress, web3.utils.toWei(amount, "ether"))
            .send({ from: user });
        alert("✅ Approve success");
    } catch (err) {
        console.error(err);
        alert("❌ Approve failed");
    }
};

document.getElementById("stakeBtn").onclick = async () => {
    const amount = document.getElementById("stakeAmount").value;
    const duration = document.getElementById("stakeTier").value;
    if (!amount || amount <= 0) {
        alert("❌ Invalid amount");
        return;
    }
    try {
        await contract.methods
            .stake(web3.utils.toWei(amount, "ether"), duration)
            .send({ from: user });
        alert("✅ Stake success");
    } catch (err) {
        console.error(err);
        alert("❌ Stake failed");
    }
};

document.getElementById("claimBtn").onclick = async () => {
    try {
        const stakeCount = await contract.methods.getStakeCount(user).call();
        for (let i = 0; i < stakeCount; i++) {
            const stakeInfo = await contract.methods.getStakeInfo(user, i).call();
            if (!stakeInfo.claimed) {
                await contract.methods.claim(i).send({ from: user });
                alert(`✅ Claimed Stake #${i}`);
            }
        }
    } catch (err) {
        console.error(err);
        alert("❌ Claim failed");
    }
};

document.getElementById("unstakeBtn").onclick = async () => {
    try {
        const stakeCount = await contract.methods.getStakeCount(user).call();
        for (let i = 0; i < stakeCount; i++) {
            const stakeInfo = await contract.methods.getStakeInfo(user, i).call();
            const unlockTime = stakeInfo.unlockTime;
            const now = Math.floor(Date.now() / 1000);
            if (now >= unlockTime && !stakeInfo.claimed) {
                await contract.methods.unstake(i).send({ from: user });
                alert(`✅ Unstaked #${i}`);
            }
        }
    } catch (err) {
        console.error(err);
        alert("❌ Unstake failed");
    }
};

async function loadTVL() {
    const tvl = await contract.methods.totalStaked().call();
    document.getElementById("tvl").innerText = "TVL: " + web3.utils.fromWei(tvl, "ether") + " G3X";
}
setInterval(loadTVL, 10000);
