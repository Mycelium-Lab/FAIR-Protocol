const FairToken = artifacts.require("FairToken")
const { ether } = require("@openzeppelin/test-helpers")

contract('FairToken', (accounts) => {
  before(async () => {
    this.token = await FairToken.deployed()
    this.admin = accounts[0]  
    this.errorCatcher = async (action) => {
      let err = ""
      try {
        await action()
      } catch (error) {
        err = error.reason
      }
      return err
    }
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
    await this.token.mint(mint_to, ether("2000"), { from: minter })
    const balance = await this.token.balanceOf(mint_to)
    assert.deepEqual(balance.toString(), ether("2000").toString())
  })

  it('unauthed minting', async () => {
    const non_minter = accounts[2]
    const mint_to = accounts[3]
    const minter_role = await this.token.MINTER_ROLE()

    // admin cannot mint by default
    const _unauthedMintMsg_0 = await this.errorCatcher(
      async () => await this.token.mint(mint_to, ether("2000"), { from: this.admin })
    )
    assert.deepEqual(_unauthedMintMsg_0, `AccessControl: account ${this.admin.toLowerCase()} is missing role ${minter_role}`)
    
    // ordinary users cannot mint
    const _unauthedMintMsg_1 = await this.errorCatcher(
      async () => await this.token.mint(mint_to, ether("2000"), { from: non_minter })
    )
    assert.deepEqual(_unauthedMintMsg_1, `AccessControl: account ${non_minter.toLowerCase()} is missing role ${minter_role}`)
  })

  it('max supply', async () => {
    const minter = accounts[1]
    const mint_to = accounts[3]

    const _capExceededMsg = await this.errorCatcher(
      // minting more tokens than the specified cap
      async () => await this.token.mint(mint_to, ether("50000001"), { from: minter })
    )
    assert.deepEqual(_capExceededMsg, "ERC20Capped: cap exceeded")
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
    const _accessControlMsg = await this.errorCatcher(
      // trying to grant a role from the old admin
      async () => await this.token.grantRole(minter_role, this.admin, { from: this.admin })
    )
    assert.deepEqual(_accessControlMsg, `AccessControl: account ${this.admin.toLowerCase()} is missing role ${admin_role}`)
  })

  it('assign minter role', async () => {
    const minter_role = await this.token.MINTER_ROLE()
    // new admin is accounts[4]
    const admin = accounts[4]
    // original minter
    const minter = accounts[1]
    const new_minter = accounts[5]
    const mint_to = accounts[3]

    const mintable_amount = ether("2000")

    // add new minter
    await this.token.grantRole(minter_role, new_minter, { from: admin })
    await this.token.mint(mint_to, mintable_amount, { from: new_minter })
    await this.token.mint(mint_to, mintable_amount, { from: minter })

    const balance = await this.token.balanceOf(mint_to)
    // mintable_amount + old amount
    assert.deepEqual(balance.toString(), ether("6000").toString())

    // remove minter
    await this.token.revokeRole(minter_role, new_minter, { from: admin })

    // try to mint from the revoked address
    const _unauthedMintMsg = await this.errorCatcher(
      async () => this.token.mint(mint_to, mintable_amount, { from: new_minter })
    )
    assert.deepEqual(_unauthedMintMsg, `AccessControl: account ${new_minter.toLowerCase()} is missing role ${minter_role}`)
  })

  it('transfer', async () => {
    const minter = accounts[1]
    const jack = accounts[6]
    const john = accounts[7]

    await this.token.mint(jack, ether("2000"), { from: minter })
    await this.token.transfer(john, ether("500"), { from: jack })

    const jackBalance = await this.token.balanceOf(jack)
    const johnBalance = await this.token.balanceOf(john)

    assert.deepEqual(jackBalance.toString(), ether("1500").toString())
    assert.deepEqual(johnBalance.toString(), ether("500").toString())
  })

  it("approve", async () => {
    const alice = accounts[8]
    const bob = accounts[9]

    let allowance = await this.token.allowance(alice, bob)
    assert.deepEqual(allowance.toString(), "0")

    await this.token.approve(bob, ether("5000"), { from: alice })

    allowance = await this.token.allowance(alice, bob)
    assert.deepEqual(allowance.toString(), ether("5000").toString())
  })

  it("burn", async () => {
    const jack = accounts[6]
    // jack had 1500 tokens
    let balance = await this.token.balanceOf(jack)
    await this.token.burn(ether("1000"), { from: jack } )
    balance = await this.token.balanceOf(jack)
    assert.deepEqual(balance.toString(), ether("500").toString())
  })
})
