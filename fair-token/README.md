<h1>Fair Token</h1>
<h2>Parameters: </h2>
<ul>
    <li>Name: Fair Token</li>
    <li>Symbol: FAIR</li>
    <li>Decimals: 18</li>
    <li>Cap: 50,000,000 (50 mln.) FAIR</li>
</ul>

<h2>How to deploy & manage?</h2>
NB: The following scripts must be run line by line in your terminal. Also, you do not need the curly braces when using the <b>params</b> that we specify (e.g., {new_admin} will not become {'0x191A9Eb3d632d3969028610398AC0ef5EC37569b'}, but rather '0x191A9Eb3d632d3969028610398AC0ef5EC37569b'). However, they are always needed otherwise. 
<h3>Prerequisites</h3>
To deployed the token, you must have sufficient funds on your deployer's account. By default it is the first account generated by truffle. To check what it is, please run the following command in your terminal:
<pre>
truffle console --network polygon
accounts = await web3.eth.getAccounts()
accounts[0]
</pre>
The final command should display the account you must have sufficient funds for deployment on.
<h3>Deployment</h3>
In your terminal please run:
<pre>
truffle compile
truffle migrate --network polygon
</pre>
This should deploy your token to Polygon Mainnet.
<h3>Setting Up Roles</h3>
To set up new roles for your contract, you must have the following accounts (addresses) ready:
<ul>
    <li>{new_admin}</li>
    <li>{new_minter}</li>
</ul>
Next, in your terminal please run:
<pre>
truffle console --network polygon
token = await FairToken.deployed()
</pre>
Then retrieve your current accounts:
<pre>
accounts = await web3.eth.getAccounts()
[admin, minter] = accounts
</pre>
And your roles:
<pre>
admin_role = await token.DEFAULT_ADMIN_ROLE()
minter_role = await token.MINTER_ROLE()
</pre>
Grant a new minter role (note that your {new_minter} must be an address string, e.g., '0x191A9Eb3d632d3969028610398AC0ef5EC37569b'):
<pre>
await token.grantRole(minter_role, {new_minter})
</pre>
Revoke the role of the previous minter:
<pre>
await token.revokeRole(minter_role, minter)
</pre>
Grant a new admin role (note that your {new_admin} must be an address string, e.g., '0x191A9Eb3d632d3969028610398AC0ef5EC37569b'):
<pre>
await token.grantRole(admin_role, {new_admin})
</pre>
Renounce the admin role of the old admin:
<pre>
await token.renounceRole(admin_role, admin)
</pre>
<h3>How to mint?</h3>
First, set up the following params:
<ul>
<li>{mint_to}: address., e.g., '0x191A9Eb3d632d3969028610398AC0ef5EC37569b'</li>
<li>{amount}: a string representation of a number with a power of 18 (decimals), e.g., if we want to mint 5555 tokens, the value must be '5555000000000000000000'</li>
</ul>
Please note that your minter must have sufficient funds to perform the transaction. Also, since you need to sign your transaction as a minter, its seed phrase / private key must be specified your config. In your terminal please run:
<pre>
truffle console --network polygon
token = await FairToken.deployed()
await token.mint({mint_to}, {amount}, from: { {minter} })
</pre>
<h3>How to display the token in your wallet app?</h3>
Your need to get the token address. This can be done by running the following commands in your terminal:
<pre>
truffle console --network polygon
token = await FairToken.deployed()
token.address
</pre>