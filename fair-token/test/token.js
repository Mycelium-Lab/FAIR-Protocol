const FairToken = artifacts.require("FairToken")

contract('FairToken', (accounts) => {
  before(async () => {
    this.token = await FairToken.deployed()
    this.admin = accounts[0]
  })
  it('deploy test', async () => {
    const name = await this.token.name()
    const symbol = await this.token.symbol()
    const decimals = await this.token.decimals()

    assert.deepEqual(name, "Fair Token")
    assert.deepEqual(symbol, "FAIR")
    assert.deepEqual(decimals.toString(), "18")
  });
  it('test minting', async () => {
    const minter = accounts[1]
    const mint_to = accounts[3]

    await this.token.mint(mint_to, '2000000000000000000000', { from: minter })
    const balance = await this.token.balanceOf(mint_to)
    assert.deepEqual(balance.toString(), '2000000000000000000000')
  })
  it('test unauthed minting', async () => {
    const non_minter = accounts[2]
    const mint_to = accounts[3]

    // admin cannot mint by default
    await (async () => {
      let err = ""
      try {
        await this.token.mint(mint_to, '2000000000000000000000', { from: this.admin })
      } catch (error) {
        err = error.reason
      }
      assert.deepEqual(err, "mint: unauthorized call!")
    })()
    
    // ordinary users cannot mint
    await (async () => {
      let err = ""
      try {
        await this.token.mint(mint_to, '2000000000000000000000', { from: non_minter })
      } catch (error) {
        err = error.reason
      }
      assert.deepEqual(err, "mint: unauthorized call!")
    })()
  })
})
