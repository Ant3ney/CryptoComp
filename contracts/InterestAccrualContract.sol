// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ExponentialGrowthContract {
    // Time interval for doubling in seconds
    uint256 private constant DOUBLING_PERIOD = 15;

    struct Deposit {
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => Deposit[]) private deposits;

    event Deposited(address indexed user, uint256 amount);

    // Function to deposit ETH into the contract
    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        deposits[msg.sender].push(Deposit({
            amount: msg.value,
            timestamp: block.timestamp
        }));

        emit Deposited(msg.sender, msg.value);
    }

    // Function to calculate and return the total balance of the user including exponential growth
    function getBalance(address user) public view returns (uint256) {
        uint256 totalBalance = 0;
        for (uint i = 0; i < deposits[user].length; i++) {
            uint256 timeElapsed = block.timestamp - deposits[user][i].timestamp;
            uint256 doublingCycles = timeElapsed / DOUBLING_PERIOD;
            uint256 growthFactor = 2 ** doublingCycles; // Calculate the growth factor as 2^number of doubling cycles
            totalBalance += deposits[user][i].amount * growthFactor;
        }
        return totalBalance;
    }

    // Function to allow withdrawal of the entire balance
    function withdraw() public {
        uint256 currentBalance = getBalance(msg.sender);
        require(currentBalance > 0, "Insufficient balance");
        payable(msg.sender).transfer(currentBalance);

        // Clear the deposits after withdrawal
        delete deposits[msg.sender];
    }
}