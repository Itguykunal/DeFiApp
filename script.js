let contractAddress = "0x32ae1A9D2c2A82f49038497E0892B4860F742A80"; // Replace with your contract address
let abi = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "borrow",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "repay",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

let provider, signer, contract;
let userBaseBalance = 0;
let contractBaseBalance = 0;

async function connectWallet() {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            contract = new ethers.Contract(contractAddress, abi, signer);

            console.log("Wallet connected:", await signer.getAddress());
            alert("Wallet connected!");
            await updateWalletBalances(); // Update wallet balance when connected
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Wallet connection failed! Please try again.");
        }
    } else {
        alert("Please install MetaMask!");
    }
}

async function deposit() {
    let amount = document.getElementById("depositAmount").value;
    if (!amount || isNaN(amount) || amount <= 0) return alert("Enter a valid amount!");

    try {
        let tx = await contract.deposit({ value: ethers.utils.parseEther(amount) });
        await tx.wait();
        alert("Deposit successful!");
        await updateWalletBalances(); // Update wallet balance after deposit
    } catch (error) {
        console.error("Error during deposit:", error);
        alert("Transaction failed!");
    }
}

async function withdraw() {
    try {
        let tx = await contract.withdraw();
        await tx.wait();
        alert("Withdraw successful!");
        await updateWalletBalances(); // Update wallet balance after withdrawal
    } catch (error) {
        console.error("Error during withdrawal:", error);
        alert("Transaction failed!");
    }
}

async function borrow() {
    let amount = document.getElementById("borrowAmount").value;
    if (!amount || isNaN(amount) || amount <= 0) return alert("Enter a valid amount!");

    try {
        let tx = await contract.borrow(ethers.utils.parseEther(amount));
        await tx.wait();
        alert("Borrow successful!");
        await updateWalletBalances(); // Update wallet balance after borrow
    } catch (error) {
        console.error("Error during borrowing:", error);
        alert("Not enough Balance!");
    }
}

async function repay() {
    let amount = document.getElementById("repayAmount").value;
    if (!amount || isNaN(amount) || amount <= 0) return alert("Enter a valid amount!");

    try {
        let tx = await contract.repay({ value: ethers.utils.parseEther(amount) });
        await tx.wait();
        alert("Repayment successful!");
        await updateWalletBalances(); // Update wallet balance after repayment
    } catch (error) {
        console.error("Error during repayment:", error);
        alert("Transaction failed!");
    }
}

async function updateWalletBalances() {
    try {
        if (!provider || !signer) {
            alert("Please connect your wallet first!");
            return;
        }

        let userAddress = await signer.getAddress();
        let userBalance = await provider.getBalance(userAddress);
        let contractBalance = await provider.getBalance(contractAddress);

        // Convert balances to ETH
        userBalance = parseFloat(ethers.utils.formatEther(userBalance));
        contractBalance = parseFloat(ethers.utils.formatEther(contractBalance));

        // Set initial balances (base value) if not set already
        if (userBaseBalance === 0) {
            userBaseBalance = userBalance; // Set the base user balance to current balance
        }

        if (contractBaseBalance === 0 && contractBalance > 0) {
            contractBaseBalance = contractBalance; // Set the base contract balance to current balance
        }

        // Update the progress bars
        updateCircularProgress("userWalletProgress", "userWalletBalanceText", userBalance, userBaseBalance);
        updateCircularProgress("contractWalletProgress", "contractWalletBalanceText", contractBalance, contractBaseBalance);
    } catch (error) {
        console.error("Error updating balances:", error);
        alert("Failed to fetch balances!");
    }
}

function updateCircularProgress(elementId, textId, current, base) {
    const percentage = Math.min((current / base) * 100, 100); // Use the base for percentage calculation
    const progress = document.getElementById(elementId);
    const text = document.getElementById(textId);

    progress.style.background = `conic-gradient(#4caf50 ${percentage}%, #ddd ${percentage}%)`;

    // Format the value to 4 decimal places and update the text
    text.innerText = `${current.toFixed(5)} ETH (${Math.round(percentage)}%)`;
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("connectMetaMask").onclick = connectWallet;
    document.getElementById("deposit").onclick = deposit;
    document.getElementById("withdraw").onclick = withdraw;
    document.getElementById("borrow").onclick = borrow;
    document.getElementById("repay").onclick = repay;
    document.getElementById("refreshBalances").onclick = updateWalletBalances;
});
