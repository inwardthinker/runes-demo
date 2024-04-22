import Wallet, {AddressPurpose, RpcErrorCode, getProviders, request, } from "sats-connect"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Menu, MenuItem, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';


export default function AppBar(){

    const { connectedWallet, setConnectedWallet } = useContext(AppContext);

    const [ openMenu, setOpenMenu ] = useState(false);
    const [ menuAnchor, setMenuAnchor ] = useState();
    const [ error, setError ] = useState();


    useEffect(()=>{
        const savedWallet = localStorage.getItem('connectedWallet');
        if(savedWallet){
            try{
                const obj = JSON.parse(savedWallet);
                if(obj){
                    setConnectedWallet(obj);
                }
            }catch(err){

            }
        }
    },[]);



    const handleConnect = async () => {

		try {

            const response = await request(
                'getAccounts', 
                 {
                    purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
                    message: 'Cool app wants to know your addresses!',
                 }
            );

            if (response.status === 'success') {

              const ordinalsAddressItem = response.result.find(
                (address) => address.purpose === AddressPurpose.Ordinals
              );

              const paymentAddressItem = response.result.find(
                (address) => address.purpose === AddressPurpose.Payment
              );

              const obj = {
                ordinals:ordinalsAddressItem,
                payment:paymentAddressItem
              }

              setConnectedWallet(obj);

              localStorage.setItem('connectedWallet', JSON.stringify(obj))

            } else {
              if (response.error.code === RpcErrorCode.USER_REJECTION) {
                // handle user cancellation error
                console.log('user cancelled')
              } else {
                console.log("other error")
                // handle error
              }
            }
          } catch (err:any) {
            setError(err.message)
              //console.log({err})
          }
	}

    const handleDisConnect = async ()=>{
        onCloseMenu()
        await Wallet.disconnect();
        localStorage.removeItem('connectedWallet')
        setConnectedWallet();
    }

    const onCloseMenu = ()=>{
        setOpenMenu(false);
    }

    const getOrder = async ()=>{
        try{
            const response = await Wallet.request('runes_getOrder', { 
                id:"0CAC0C5F-1C35-6000-8788-CAFDFC5CF07A",//"0CAC0C29-8A4A-6000-9562-FA83F294BA4A", //"0CAC0AD1-45A3-6000-8788-CAFDFC5CF07A",//"0CAC0847-861F-6000-9562-FA83F294BA4A", 
                network: "Testnet" 
            });
            console.log({response})
        }catch(err){

        }
    }

    return(
        <Box
            sx={{
                p:'20px',
                display:'flex',
                justifyContent:'space-between'
            }}
        >
            <Typography
                variant="h5"
                sx={{
                    color:'#cbcbcb',
                    fontWeight:"bold"
                }}
            >
                Xverse Wallet
            </Typography>

            <Dialog
                open={Boolean(error)}
                maxWidth='xs'
                fullWidth={true}
            >
                <DialogTitle sx={{pb:0}}>
                    Error
                </DialogTitle>
                <DialogContent>
                    {error||"Err mGS"}
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        size='small'
                        disableElevation
                        onClick={()=>{
                            // @ts-ignore
                            setError()
                        }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            <Menu
                open={openMenu}
                anchorEl={menuAnchor}
                onClose={onCloseMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                MenuListProps={{
                    sx:{
                        bgcolor:'rgba(25,45,85,1)'
                    }
                }}
                sx={{
                    ".MuiMenu-paper":{
                        background:'none'
                    }
                }}
            >
                <MenuItem sx={{color:'white'}} onClick={handleDisConnect}>
                    Disconnect
                </MenuItem>
            </Menu>
            {/* <Button
                variant="outlined"
                onClick={getOrder}
            >
                Orders
            </Button> */}
            {
                !connectedWallet?(
                    <Button
                        variant="outlined"
                        sx={{
                            color:'whitesmoke',
                            textTransform:'capitalize',
                            fontWeight:"bold"
                        }}
                        onClick={handleConnect}
                    >
                        Connect
                    </Button>
                ):(
                    <Button
                        variant="outlined"
                        sx={{
                            color:'whitesmoke',
                            textTransform:'capitalize',
                            fontWeight:"bold",
                            // maxWidth:'80px',
                            // textOverflow:'ellipsis',
                            // overflow:"hidden"
                        }}
                        startIcon={<AccountBalanceWalletIcon/>}
                        onClick={(e)=>{
                            //@ts-ignore
                            setMenuAnchor(e.currentTarget);
                            setOpenMenu(true)
                        }}
                    >
                        { connectedWallet.ordinals.address}
                    </Button>
                )
            }
            
        </Box>
    )
}