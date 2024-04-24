App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    // Load pets.
    $.getJSON("../pets.json", function (data) {
      var petsRow = $("#petsRow");
      var petTemplate = $("#petTemplate");

      for (i = 0; i < data.length; i++) {
        petTemplate.find(".panel-title").text(data[i].name);
        petTemplate.find("img").attr("src", data[i].picture);
        petTemplate.find(".pet-breed").text(data[i].breed);
        petTemplate.find(".pet-age").text(data[i].age);
        petTemplate.find(".pet-location").text(data[i].location);
        petTemplate.find(".btn-adopt").attr("data-id", data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON("InterestAccrualContract.json", function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var IACArtifact = data;
      App.contracts.IAC = TruffleContract(IACArtifact);

      // Set the provider for our contract
      App.contracts.IAC.setProvider(App.web3Provider);

      App.getBallance();

      setInterval(App.getBallance, 1000);

      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", ".btn-adopt", App.handleAdopt);
    $(document).on("click", "#deposit_coin", App.depositETH);
  },

  markAdopted: function () {
    /* var IACInstance;

    App.contracts.IAC.deployed()
      .then(function (instance) {
        IACInstance = instance;

        return IACInstance.getAdopters.call();
      })
      .then(function (IACrs) {
        for (i = 0; i < adopters.length; i++) {
          if (adopters[i] !== "0x0000000000000000000000000000000000000000") {
            $(".panel-pet")
              .eq(i)
              .find("button")
              .text("Success")
              .attr("disabled", true);
          }
        }
      })
      .catch(function (err) {
        console.log(err.message);
      }); */
  },

  handleAdopt: function (event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data("id"));
    var adoptionInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed()
        .then(function (instance) {
          adoptionInstance = instance;

          // Execute adopt as a transaction by sending account
          return adoptionInstance.adopt(petId, { from: account });
        })
        .then(function (result) {
          return App.markAdopted();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },

  depositETH: () => {
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      //alert("Depositing");
      App.contracts.IAC.deployed()
        .then(function (instance) {
          IACInstance = instance;
          if (!IACInstance) {
            alert("Contract not deployed");
          } else {
            console.log(account);
            console.log(IACInstance);
            //alert("Contract deployed");
          }

          // Execute adopt as a transaction by sending account
          return IACInstance.deposit({
            from: account,
            value: 1000000000000000000 * 2 + "",
          }).then((result) => {
            App.getBallance();
          });
        })
        .then(function (result) {
          return App.markAdopted();
        })
        .catch(function (err) {
          console.log(err.message);
        });
    });
  },

  getBallance: () => {
    console.log("Getting");

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      //alert("Depositing");
      App.contracts.IAC.deployed().then(function (instance) {
        IACInstance = instance;
        if (!IACInstance) {
          alert("Contract not deployed");
        } else {
          console.log(account);
          console.log(IACInstance);
          //alert("Contract deployed");
        }

        IACInstance.getBalance(account).then((result) => {
          const eth = result / 1e18;
          console.log({
            result: eth,
          });

          $("#Your_Money").text(eth);
        });
      });
    });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
