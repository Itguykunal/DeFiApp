// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract SimpleEthLending {
    struct User {
        uint256 depositAmount;
        uint256 borrowAmount;
    }

    mapping(address => User) public users;
    uint256 public constant BORROW_LIMIT = 50; // 50% of deposit
    address public owner;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyDeposited() {
        require(users[msg.sender].depositAmount > 0, "No active deposit.");
        _;
    }

    function deposit() external payable {
        require(msg.value > 0, "Deposit must be greater than 0.");
        User storage user = users[msg.sender];
        user.depositAmount += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw() external onlyDeposited {
        User storage user = users[msg.sender];
        require(user.borrowAmount == 0, "Repay outstanding loan before withdrawing.");

        uint256 amount = user.depositAmount;
        user.depositAmount = 0;

        payable(msg.sender).transfer(amount);
        emit Withdraw(msg.sender, amount);
    }

    function borrow(uint256 amount) external onlyDeposited {
        User storage user = users[msg.sender];
        uint256 maxBorrowAmount = (user.depositAmount * BORROW_LIMIT) / 100;

        require(amount > 0, "Borrow amount must be greater than 0.");
        require(user.borrowAmount + amount <= maxBorrowAmount, "Exceeds borrow limit.");
        require(address(this).balance >= amount, "Contract has insufficient funds.");

        user.borrowAmount += amount;
        payable(msg.sender).transfer(amount);
        emit Borrow(msg.sender, amount);
    }

    function repay() external payable {
        require(msg.value > 0, "Repayment must be greater than 0.");
        User storage user = users[msg.sender];
        require(user.borrowAmount > 0, "No active loan.");

        if (msg.value >= user.borrowAmount) {
            uint256 excess = msg.value - user.borrowAmount;
            user.borrowAmount = 0;

            // Refund excess ETH to user
            if (excess > 0) {
                payable(msg.sender).transfer(excess);
            }
        } else {
            user.borrowAmount -= msg.value;
        }

        emit Repay(msg.sender, msg.value);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
