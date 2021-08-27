// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract FairToken is ERC20Capped, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

	constructor(
        string memory _name, 
        string memory _symbol, 
        uint256 _cap, 
        address _admin, 
        address _minter
    )
	    ERC20(_name, _symbol)
	    ERC20Capped(_cap)
    {
        _setupRole(DEFAULT_ADMIN_ROLE, _admin);
        _setupRole(MINTER_ROLE, _minter);
    }
    
    function mint(address recipient, uint256 amount) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "mint: unauthorized call!");
        _mint(recipient, amount);
    }

    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
    }
}