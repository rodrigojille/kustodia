// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint8 private _customDecimals;

    constructor(string memory name, string memory symbol, uint8 decimals_) ERC20(name, symbol) {
        _customDecimals = decimals_;
    }
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
    function decimals() public view override returns (uint8) {
        return _customDecimals;
    }
}
