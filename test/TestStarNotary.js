const StarNotary = artifacts.require("StarNotary");

let accounts;
let owner;

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];

  it("can create a star", async () => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
    assert.equal(
      await instance.tokenIdToStarInfo.call(tokenId),
      "Awesome Star!"
    );
  });

  it("lets user1 put up their star for sale", async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar("awesome star", starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    assert.equal(await instance.starsForSale.call(starId), starPrice);
  });

  it("lets user1 get the funds after the sale", async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar("awesome star", starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, { from: user2, value: balance });
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
  });

  it("lets user2 buy a star, if it is put up for sale", async () => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 4;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");
    await instance.createStar("awesome star", starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    await instance.buyStar(starId, { from: user2, value: balance });
    assert.equal(await instance.ownerOf.call(starId), user2);
  });

  it("lets user2 buy a star and decreases its balance in ether", async () => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 5;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");
    await instance.createStar("awesome star", starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {
      from: user2,
      value: balance,
      gasPrice: 0,
    });
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    const value =
      Number(balanceOfUser2BeforeTransaction) -
      Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
  });

  // Implement Task 2 Add supporting unit tests

  it("can add the star name and star symbol properly", async () => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    const instance = await StarNotary.deployed();
    const contractName = "StarNotary";
    const contractSymbol = "SNT";
    const name = await instance.name();
    const symbol = await instance.symbol();
    assert.equal(contractName, name);
    assert.equal(contractSymbol, symbol);
  });

  it("lets 2 users exchange stars", async () => {
    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed
    const instance = await StarNotary.deployed();
    const star1Name = "star1";
    const star1TokenId = Math.trunc(Math.random() * 100);
    const star2Name = "star2";
    const star2TokenId = Math.trunc(Math.random() * 100);

    await instance.createStar(star1Name, star1TokenId, {
      from: accounts[0],
    });
    await instance.createStar(star2Name, star2TokenId, {
      from: accounts[1],
    });
    const ownerBefore1 = await instance.ownerOf(star1TokenId, {
      from: accounts[0],
    });
    const ownerBefore2 = await instance.ownerOf(star2TokenId, {
      from: accounts[1],
    });
    // Before Exchange
    assert.equal(accounts[0], ownerBefore1);
    assert.equal(accounts[1], ownerBefore2);

    // Exchange
    await instance.exchangeStars(star1TokenId, star2TokenId);

    // After Exchange
    const ownerAfter1 = await instance.ownerOf(star2TokenId, {
      from: accounts[0],
    });

    const ownerAfter2 = await instance.ownerOf(star1TokenId, {
      from: accounts[1],
    });
    assert.equal(accounts[0], ownerAfter1);
    assert.equal(accounts[1], ownerAfter2);
  });

  it("lets a user transfer a star", async () => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
    const instance = await StarNotary.deployed();
    const starName = "star test";
    const starId = Math.trunc(Math.random() * 10000);
    await instance.createStar(starName, starId, {
      from: accounts[0],
    });
    await instance.transferStar(accounts[1], starId, { from: accounts[0] });
    const ownerOfStar = await instance.ownerOf(starId, { from: accounts[1] });
    assert.equal(ownerOfStar, accounts[1]);
  });

  it("lookUptokenIdToStarInfo test", async () => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    const instance = await StarNotary.deployed();
    const starName = "star test";
    const starId = Math.trunc(Math.random() * 10000);
    await instance.createStar(starName, starId, { from: accounts[0] });
    const starNameFromContract = await instance.lookUptokenIdToStarInfo(starId);
    assert.equal(starName, starNameFromContract);
  });
});
