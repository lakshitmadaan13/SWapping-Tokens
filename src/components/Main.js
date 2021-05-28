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
        tokenAmount: [],
        approve: false
      }
    }

    async componentWillMount() {
      //detect metamask
      const metamaskInstalled = typeof window.web3 !== 'undefined'
      this.setState({ metamaskInstalled })
      if (metamaskInstalled) {
        await this.loadWeb3()
        await this.loadBlockchainData()
      }
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
        const swap = new web3.eth.Contract(Swap, "0x2E73f59BA9BAdda63A997B85840EcB4d2E4ec77A")
        this.setState({ swapping: swap })
    
        const uniswap = new web3.eth.Contract(IUniswapV2Router02, "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
        this.setState({ uniswap: uniswap })
        
        console.log(this.state.swapping,this.state.uniswap, this.state.account)
        } else {
          alert("Smart contract not deployed to this network..")
        }
  }

  async onApprove(address, value) {
    const web3 = window.web3
    console.log(address,value)                                                    

    const ercContract = await new web3.eth.Contract(ERC20, address)
    this.setState({ erc20: ercContract })

    console.log(address, value, this.state.erc20)
    await this.state.erc20.methods.approve("0x2E73f59BA9BAdda63A997B85840EcB4d2E4ec77A", value).send({ from: this.state.account })
      .then(() => {
       this.setState({approve: true})
      })
      .catch(() => {
        alert("Transaction failed")
      })
  }
  
  async swapToken(tokenInputAddress, tokenInputAmount, targetToken) {
    if (this.state.approve) {
      console.log(tokenInputAddress, tokenInputAmount, targetToken)
      this.state.swapping.methods.swap(tokenInputAmount, tokenInputAddress, targetToken).send({ from: this.state.account })
        .then((res) => {
          console.log(res)
          alert("Transaction Done Successfully")
        })
        .catch((error) => {
      console.log(error)
    }) 
    } else {
      alert("First Approve the transaction")
    }
  } 
      
    render() {
        return (
            <div className="container">
            {this.state.metamaskInstalled ? 
              <>
              <Header accounts={this.state.account} balances={this.state.balance} />
                <hr />
                <div>
               <form onSubmit={(event) => {
                event.preventDefault()

                const tokenVal = this.amount.value
                const tokenAdd = this.address.value
                const targetToken = this.targetAddress.value
                const tokenAddress = this.state.tokenAddress.push(tokenAdd)
                const tokenValue = this.state.tokenAmount.push(tokenVal)
                this.setState({ tokenAddress: tokenAddress, tokenAmount: tokenValue })
                const tokenInputAddress = this.state.tokenAddress
                const tokenInputAmount = this.state.tokenAmount
                console.log(tokenInputAddress, tokenInputAmount, targetToken)
                this.swapToken(tokenInputAddress, tokenInputAmount, targetToken)
                }
              }>
                  <div className="form-group row">
                    <label className="col-sm-2 col-form-label">Token Address</label>
                    <div className="col-sm-10">
                    <input
                     required
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
                    required
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
                    required
                    type="text"
                    className="form-control"
                    placeholder="Enter target token address"
                    ref={(input) => {this.targetAddress = input}}
                    />
                    </div>
                </div>
                <br/>
                <button className="btn btn-success">Swap</button>
                </form>
            </div>
            <br />
            <div>
              <hr />
              <p>{this.state.approve ? <div className="text-success">Approved</div> : <div className="text-danger">Not Approved</div>}</p>
              <button className="btn btn-primary" onClick={(event) => {
                  event.preventDefault()
                
                  const address = this.address.value
                  const value = this.amount.value
                  console.log(address, value)
                  this.onApprove(address, value)
                }}>Approve</button>
                </div>
                </>  : <div>
                  <h3 className="text-center">Please Install Metamask</h3>
                </div>
              
            }
            </div>
        )
    }
}

export default Main