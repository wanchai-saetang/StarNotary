import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function (message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function () {
    const { createStar } = this.meta.methods;
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;
    await createStar(name, id).send({ from: this.account });
    App.setStatus("New Star Owner is " + this.account + ".");
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function () {
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    const starName = await lookUptokenIdToStarInfo(
      document.getElementById("lookid").value
    ).call();
    document.getElementById("star_name").textContent = starName;
  },
};

window.App = App;

window.addEventListener("load", async function () {
  App.web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
  App.start();
});
