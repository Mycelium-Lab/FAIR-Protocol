const FairToken = artifacts.require("FairToken")

module.exports = (deployer, _, accounts) => {
  const [admin, minter] = accounts
  deployer.then(async () => {
    const cap = '50000000000000000000000000' // 50 mln. FAIR
    await deployer.deploy(FairToken, 'Fair Token', 'FAIR', cap, admin, minter)
  })
}