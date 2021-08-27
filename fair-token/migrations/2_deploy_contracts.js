const BigNumber = require("bignumber.js")
const FairToken = artifacts.require("FairToken")

module.exports = (deployer, _, accounts) => {
  const [admin, minter] = accounts
  deployer.then(async () => {
    const cap = new BigNumber('50000000000000000000000000')
    await deployer.deploy(FairToken, 'Fair Token', 'FAIR', cap, admin, minter)
  })
}