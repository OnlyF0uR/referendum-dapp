App = {
  provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function () {
    return App.initProvider();
  },

  initProvider: function () {
    if (typeof window.ethereum !== 'undefined') {
      detectEthereumProvider().then(function (provider) {
        App.provider = provider;

        return App.initContract();
      })
    }
  },

  initContract: function () {
    $.getJSON("Referendum.json", function (referendum) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Referendum = TruffleContract(referendum);
      // Connect provider to interact with contract
      App.contracts.Referendum.setProvider(App.provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.Referendum.deployed().then(function (instance) {
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function (_ex, event) {
        // console.log("event triggered", event)
        App.render();
      });
    });
  },

  render: function () {
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    ethereum.request({ method: 'eth_requestAccounts' }).then(function(accounts) {
      App.account = accounts[0]
    })

    var referendumInstance;

    // Load contract data
    App.contracts.Referendum.deployed().then(function (instance) {
      referendumInstance = instance;
      return referendumInstance.proposalCount();
    }).then(function (proposalCount) {
      const proposalResults = $("#proposalResults");
      const proposalSelect = $('#proposalSelect');

      proposalResults.empty();
      proposalSelect.empty();

      for (let i = 1; i <= proposalCount; i++) {
        referendumInstance.proposals(i).then(function (proposal) {
          proposalResults.append("<tr><th>" + proposal[0] + "</th><td>" + proposal[1] + "</td><td>" + proposal[2] + "</td><td>" + proposal[3] + "</td></tr>");

          referendumInstance.checkVote(i, { from: App.account }).then(function (hasVoted) {
            let proposalOption = "<option value='" + proposal[0] + "' >" + proposal[1] + "</ option>";
            if (hasVoted) {
              proposalOption = "<option value='" + proposal[0] + "' disabled>" + proposal[1] + "</ option>";
            }
            proposalSelect.append(proposalOption);
          })
        });
      }
    }).then(function () {
      loader.hide();
      content.show();
    }).catch(function (ex) {
      console.warn(ex);
    });
  },

  castVote: function () {
    var proposalId = $('#proposalSelect').val();
    App.contracts.Referendum.deployed().then(function (instance) {
      console.log(proposalId, App.account);
      return instance.vote(proposalId, { from: App.account });
    }).then(function (_res) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function (ex) {
      console.error(ex);
    });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});