const FairToken = artifacts.require("FairToken")

contract('FairToken', (accounts) => {
  before(async () => {
    this.token = await FairToken.deployed()
    this.admin = accounts[0]  
  })

  it('deploy', async () => {
    const name = await this.token.name()
    const symbol = await this.token.symbol()
    const decimals = await this.token.decimals()

    assert.deepEqual(name, "Fair Token")
    assert.deepEqual(symbol, "FAIR")
    assert.deepEqual(decimals.toString(), "18")
  })

  it('minting', async () => {
    const minter = accounts[1]
    const mint_to = accounts[3]

    // mint 2000 FAIR
    await this.token.mint(mint_to, '2000000000000000000000', { from: minter })
    const balance = await this.token.balanceOf(mint_to)
    assert.deepEqual(balance.toString(), '2000000000000000000000')
  })

  it('unauthed minting', async () => {
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

  it('max supply', async () => {
    const minter = accounts[1]
    const mint_to = accounts[3]
    await (async () => {
      let err = ""
      try {
        // minting more tokens than the specified cap
        await this.token.mint(mint_to, '50000001000000000000000000', { from: minter })
      } catch (error) {
        err = error.reason
      }
      assert.deepEqual(err, "ERC20Capped: cap exceeded")
    })() 
  })

  it('transfer ownership', async () => {
    const new_admin = accounts[4]
    const admin_role = await this.token.DEFAULT_ADMIN_ROLE()
    const minter_role = await this.token.MINTER_ROLE()
    // add new admin
    await this.token.grantRole(admin_role, new_admin, { from: this.admin })
    // revoke admin
    await this.token.renounceRole(admin_role, this.admin, { from: this.admin })
    
    // check that old admin is no longer eligible for management
    await (async () => {
      let err = ""
      try {
        // minting more tokens than the specified cap
        await this.token.grantRole(minter_role, this.admin, { from: this.admin })
      } catch (error) {
        err = error.reason
      }
      assert.deepEqual(err, `AccessControl: account ${this.admin.toLowerCase()} is missing role ${admin_role}`)
    })() 
  })

  it('assign minter role', async () => {
    const minter_role = await this.token.MINTER_ROLE()
    // new admin is accounts[4]
    const admin = accounts[4]
    // original minter
    const minter = accounts[1]
    const new_minter = accounts[5]
    const mint_to = accounts[3]

    const mintable_amount = '2000000000000000000000'

    // add new minter
    await this.token.grantRole(minter_role, new_minter, { from: admin })
    await this.token.mint(mint_to, mintable_amount, { from: new_minter })
    await this.token.mint(mint_to, mintable_amount, { from: minter })

    const balance = await this.token.balanceOf(mint_to)
    // mintable_amount + old amount
    assert.deepEqual(balance.toString(), '6000000000000000000000')

    // remove minter
    await this.token.revokeRole(minter_role, new_minter, { from: admin })
    // try to mint from the revoked address
    await (async () => {
      let err = ""
      try {
        await this.token.mint(mint_to, mintable_amount, { from: new_minter })
      } catch (error) {
        err = error.reason
      }
      assert.deepEqual(err, "mint: unauthorized call!")
    })() 
  })

  it('transfer', async () => {

  })
})
