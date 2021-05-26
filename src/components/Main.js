import React, { Component } from 'react'
import Swap from '../abi/Swap.json'
import IERC20 from '../abi/IERC20.json'
import IUniswapV2Router02 from '../abi/IUniswapV2Router02.json'
import Web3 from 'web3'
import Header from './Header'
import ERC20 from '../abi/ERC20.json'

class Main extends Component {

    constructor(props) {
      super(props)
      this.state = {
        account: '',
        balance: '',
        swapping: null,
        ierc20: null,
        erc20:null,
        unsiswap: null,
        loading: false,
        tokenAddress: [],
        tokenAmount: []
      }
    }

    componentWillMount() {
        this.loadWeb3()
        this.loadBlockchainData()
    }

    async loadWeb3() {
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum)
          await window.ethereum.enable()
        }
        else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider)
        }
        else {
          window.alert("Please Install Metamask...")
        }
    }
    
    async loadBlockchainData() {
        const web3 = window.web3
    
        const accounts = await web3.eth.getAccounts()
        this.setState({ account: accounts[0] })
        console.log(this.state.account)

        const balances = await web3.eth.getBalance(this.state.account)
        this.setState({balance: balances})
    
        const networkId = await web3.eth.net.getId()
        console.log(networkId)
    
        if (networkId === 3) {
        const swap = new web3.eth.Contract(Swap, "0x0BEBDD9BA9e7fB68b6b658F159FCCbC963dAbD63")
        this.setState({ swapping: swap })
    
        const uniswap = new web3.eth.Contract(IUniswapV2Router02, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
        this.setState({ uniswap: uniswap })
        
        const erctoken = new web3.eth.Contract(IERC20, "0xad6d458402f60fd3bd25163575031acdce07538d")
        this.setState({ ierc20: erctoken })
          
        const ercContract = new web3.eth.Contract(ERC20, "0xad6d458402f60fd3bd25163575031acdce07538d")
        this.setState({ erc20: ercContract })  
        
        console.log(this.state.erc20, this.state.swapping,this.state.ierc20, this.state.uniswap, this.state.account)
        } else {
          alert("Smart contract not deployed to this network..")
        }
  }

 
  
  async swapToken(targetToken, tokenVal, tokenAdd, tokenAmnt) {
    await this.state.erc20.methods.approve("0x0BEBDD9BA9e7fB68b6b658F159FCCbC963dAbD63", tokenVal).send({from: this.state.account})
      .then(() => {
        console.log(tokenAdd, tokenAmnt, targetToken)
        this.state.swapping.methods.swap(tokenAdd, tokenAmnt, targetToken).send({ from: this.state.account })
          .then((res) => {
            console.log(res)
          }).catch((error) => {
        console.log(error)
      })
      }).catch((error) => {
      console.log(error)
      })
  }
      
    render() {
        return (
            <div>
                <Header accounts={this.state.account} balances={this.state.balance} />
                <hr />
                <div>
              <form onSubmit={(event) => {
                event.preventDefault()
                const tokenVal = this.amount.value
                const tokenAddress = this.state.tokenAddress.push(this.address.value)
                const tokenValue = this.state.tokenAmount.push(this.amount.value)
                const targetToken = this.targetAddress.value
                this.setState({ tokenAddress: tokenAddress, tokenAmount: tokenValue })
                const tokenAdd = this.state.tokenAddress
                const tokenAmnt = this.state.tokenAmount
                console.log(tokenVal,targetToken,tokenAdd, tokenAmnt)
                this.swapToken(targetToken, tokenVal, tokenAdd, tokenAmnt)
                }}>
                  <div className="form-group row">
                    <label className="col-sm-2 col-form-label">Token Address</label>
                    <div className="col-sm-10">
                    <input
                     value="0xad6d458402f60fd3bd25163575031acdce07538d"
                     ref={(input) => {this.address = input}}
                     type="text"
                     className="form-control"
                     />
                    </div>
                    </div>
                    <br/>
                    <div className="form-group row">
                    <label className="col-sm-2 col-form-label">Token Amount</label>
                    <div className="col-sm-10">
                    <input
                    type="Number"
                    className="form-control"
                    placeholder="Enter amount of tokens eg.1000"
                    ref={(input) => {this.amount = input}}
                    />
                    </div>
                    </div>
                    <br />
                    <div className="form-group row">
                    <label className="col-sm-2 col-form-label">Target Token Address</label>
                    <div className="col-sm-10">
                    <input
                    type="text"
                    value="0x7b2810576aa1cce68f2b118cef1f36467c648f92"
                    className="form-control"
                    placeholder="Enter target token address"
                    ref={(input) => {this.targetAddress = input}}
                    />
                    </div>
                    </div>
                    <br/>        
                    <button className="btn btn-outline-success">Submit</button>
                </form>
                </div>
            </div>
        )
    }
}

export default Main