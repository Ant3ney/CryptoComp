// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InterestAccrualContract {
    uint256 private constant DOUBLING_PERIOD = 10;

    struct Deposit {
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => Deposit[]) private deposits;
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    // Function to deposit ETH
    function deposit() public payable {
        require(msg.value > 0, "Deposit must be > 0");
        deposits[msg.sender].push(Deposit(msg.value, block.timestamp));
        emit Deposited(msg.sender, msg.value);
    }

    // Optimized getBalance function
    function getBalance(address user) public view returns (uint256 totalBalance) {
        uint256 length = deposits[user].length;
        for (uint i = 0; i < length; i++) {
            Deposit storage dep = deposits[user][i];
            uint256 timeElapsed = block.timestamp - dep.timestamp;
            uint256 doublingCycles = timeElapsed / DOUBLING_PERIOD;
            totalBalance += (dep.amount << doublingCycles); // Efficient shift operation
        }
    }

    // Function to withdraw a specified amount of the balance
    function withdraw(uint256 amount) public {
        uint256 currentBalance = getBalance(msg.sender);
        require(currentBalance >= amount, "Insufficient balance");
        require(amount > 0, "Withdrawal amount must be greater than zero");

        payable(msg.sender).transfer(amount);

        // Update the stored balance after withdrawal
        reduceBalance(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    // Internal function to reduce the user's balance after withdrawal
    function reduceBalance(address user, uint256 amount) internal {
        uint256 remainingAmount = amount;
        uint256 length = deposits[user].length;
        // We iterate backwards to handle recent deposits first
        for (uint i = length; i > 0; i--) {
            uint index = i - 1;
            Deposit storage dep = deposits[user][index];
            uint256 timeElapsed = block.timestamp - dep.timestamp;
            uint256 doublingCycles = timeElapsed / DOUBLING_PERIOD;
            uint256 currentAmount = dep.amount << doublingCycles;

            if (currentAmount <= remainingAmount) {
                remainingAmount -= currentAmount;
                dep.amount = 0; // Fully used this deposit
                if (remainingAmount == 0) break;
            } else {
                // Partially use this deposit
                uint256 newAmount = (currentAmount - remainingAmount) >> doublingCycles; // Scale back down
                dep.amount = newAmount;
                break;
            }
        }
        // Clear zeroed out deposits
        cleanupDeposits(user);
    }

    // Cleanup zero amounts to prevent state bloat
    function cleanupDeposits(address user) internal {
        uint256 length = deposits[user].length;
        while (length > 0 && deposits[user][length-1].amount == 0) {
            deposits[user].pop();
            length--;
        }
    }
}