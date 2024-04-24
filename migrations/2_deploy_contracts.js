var InterestAccrualContract = artifacts.require("InterestAccrualContract");

module.exports = function (deployer) {
  deployer.deploy(InterestAccrualContract);
};
