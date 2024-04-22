import { Alert, Box, Button, ButtonGroup, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, StandardTextFieldProps, Typography } from "@mui/material"
import { Formik } from "formik"
import * as Yup from 'yup';
import  Wallet  from "sats-connect";
import { useContext, useState } from "react";
import { AppContext } from "../../../context/AppContext";

const fees = {
    slow:359,
    medium:414,
    fast:459
}

interface InputFiledType extends StandardTextFieldProps{
    errorMsg?:string|undefined;
}

const InputField=(props:InputFiledType)=>{
    return(
        <Box
            sx={{
                ...props.sx,
                bgcolor:'#0c1529bf',
                padding:'10px',
                borderRadius:'10px'
            }}
        >
            <Typography
                sx={{
                    color:'rgb(198 191 131)',
                    fontWeight:"bold"
                }}
            >
                {
                    props.label
                }
            </Typography>
           <Box
                component='input'
                sx={{
                    width:'100%',
                    bgcolor:'transparent',
                    border:'none',
                    color:'whitesmoke',
                    fontSize:'22px'
                }}
                name={props.name}
                value={props.value}
                onChange={props.onChange}
                placeholder={props.placeholder}
                autocomplete="off"
           />
           {
                props.errorMsg&&(
                    <Typography  
                        color='error'
                        sx={{
                            fontSize:"14px"
                        }}
                    >
                        {props.errorMsg}
                    </Typography>
                )
           }
            
        </Box>
    )
}

export default function Forms(){

    const [ selectedForm, setSelectedForm ] = useState('etch');

    const [ processedTxn, setProcessedTxn ] = useState({});
    const [ showSuccessDialog, setSuccessDialog  ] = useState(false);

    return(
        <Paper
            sx={{
                background:'rgba(25,45,85,1)',
                p:'20px',
                maxWidth:"450px"
            }}
        >

            <Dialog
                open={showSuccessDialog}
                maxWidth='sm'
                fullWidth={true}
                PaperProps={{
                    sx:{
                        bgcolor:'#323d55'
                    }
                }}
            >
                <DialogTitle 
                    sx={{
                        //b:0,
                        color:'white'
                    }}
                >
                    Your transaction under progress
                </DialogTitle>
                <DialogContent sx={{color:'white'}}>

                    {
                        processedTxn?.fundTransactionId&&(
                            <>
                                <Box>
                                    <Typography variant="h6" sx={{fontSize:'18px', color:'rgb(198 191 131)'}}>
                                        Truncation Id
                                    </Typography>
                                    <Typography 
                                        sx={{
                                            color:'white'
                                        }}
                                        component='a' 
                                        target='_blank'
                                        href={`https://mempool.space/testnet/tx/${processedTxn.fundTransactionId}`}
                                    >
                                        {processedTxn.fundTransactionId}
                                    </Typography>
                                </Box>

                                <Box sx={{my:'10px'}}>
                                    <Typography variant="h6" sx={{fontSize:'18px', color:'rgb(198 191 131)'}}>
                                        Order Id
                                    </Typography>
                                    <Typography>
                                        {processedTxn.orderId}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="h6" sx={{fontSize:'18px', color:'rgb(198 191 131)'}}>
                                        Funding Address
                                    </Typography>
                                    <Typography>
                                        {processedTxn.fundingAddress}
                                    </Typography>
                                </Box>
                            </>
                        )
                    }
                    
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        disableElevation
                        size='small'
                        onClick={()=>{
                            setSuccessDialog(false);
                        }}
                    >
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
            <ButtonGroup
                sx={{
                    width:"100%",
                    mb:'25px'
                }}
                disableElevation
                variant="contained"
                aria-label="Disabled button group"
            >
                <Button
                    sx={{
                        flex:1,
                        bgcolor: selectedForm !== 'etch'? "#0c1529bf": undefined
                    }}
                    onClick={() => setSelectedForm("etch") }
                >
                    ETCH
                </Button>
                <Button
                    sx={{
                        flex:1,
                        bgcolor: selectedForm !== 'mint'? "#0c1529bf": undefined
                    }}
                    onClick={() => setSelectedForm("mint") }
                >
                    MINT
                </Button>                
            </ButtonGroup>

            {
                selectedForm === "mint"&&(
                    <MintForm 
                        onSuccess={(txn:any) => {
                            setSuccessDialog(true)
                            setProcessedTxn(txn)
                        }}
                    />
                )
            }

            {
                selectedForm === "etch"&&(
                    <EtchForm
                        onSuccess={(txn:any) => {
                            setSuccessDialog(true)
                            setProcessedTxn(txn)
                        }}
                    />
                )
            }
        </Paper>
    )
}

function MintForm(props:any){

    const { connectedWallet } = useContext(AppContext);
    
    const [ error, setError ] = useState('');

    const handleSubmit = async (values:any, actions:any)=>{

        try{

            setError("");

            const reqObj = {
                runeName:values.ticker,
                repeats: parseInt(values.repeat) ,
                destinationAddress:connectedWallet.ordinals.address,
                refundAddress:connectedWallet.payment.address,
                feeRate:200,
                network:"Testnet"

            }
            console.log({reqObj})

            const response = await Wallet.request('runes_mint', reqObj);

            console.log({response})
            if(response.status === 'error'){
                const { message } = JSON.parse(response.error.message);
                setError(message);
                return;
            }

            actions.resetForm();

            // @ts-ignore
            props.onSuccess(response.result)

           
        }catch(err){
            console.log(err)
        }finally{

            actions.setSubmitting(false)
        }

    }

    return(
        <>
                {
                    error&&(
                        <Alert
                            severity="error"
                            sx={{
                                my:'15px'
                            }}
                        >
                            {
                                error
                            }
                        </Alert>
                    )
                } 
            <Box
            >
                <Formik
                    initialValues={{
                        repeat:1,
                        ticker:"",
                        custom_fee:"",
                        selected_fee:'slow',
                        
                    }}
                    validationSchema={Yup.object().shape({
                        ticker:Yup.string().required("Please enter ticker name"),
                        repeat:Yup.number().typeError("Enter valid number").min(1).max(4).optional(),
                        custom_fee:Yup.number().typeError("Enter valid number").optional(),
                        max_supply:Yup.number().typeError("Enter valid number").optional(),
                    })}
                    onSubmit={handleSubmit}
                >
                    {({values, errors, isSubmitting, handleSubmit, handleChange, setFieldValue})=>(
                        <form onSubmit={handleSubmit}>
                            <Box  
                                component='fieldset' 
                                disabled={isSubmitting}
                                sx={{
                                    px:0,
                                    mx:0,
                                    border:'none'
                                }}
                            >
                                <Grid container spacing={1}>
                                    <Grid
                                        item
                                        xs={12}
                                    >
                                        <InputField 
                                            name='ticker'
                                            value={values.ticker}
                                            label='Rune Ticker*'
                                            placeholder="Ticker"
                                            onChange={handleChange}
                                            errorMsg={errors.ticker}
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                    >
                                        <InputField 
                                            name='repeat'
                                            value={values.repeat}
                                            onChange={handleChange}
                                            label='Repeat Mint'
                                            placeholder="From 1 to 4"
                                            errorMsg={errors.repeat}
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                    >
                                        <Typography
                                            sx={{
                                                color:'rgb(198 191 131)',
                                                fontWeight:"bold"
                                            }}
                                        >
                                            Select Fees  ( { fees[values.selected_fee] } sats/vB)
                                        </Typography>
                                        <ButtonGroup
                                            disabled={isSubmitting}
                                            sx={{
                                                width:"100%"
                                            }}
                                            disableElevation
                                            variant="contained"
                                            aria-label="Disabled button group"
                                        >
                                            <Button
                                                sx={{
                                                    flex:1,
                                                    bgcolor: values.selected_fee !== 'slow'? "#0c1529bf": undefined
                                                }}
                                                onClick={() => setFieldValue("selected_fee", "slow") }
                                            >
                                                Slow
                                            </Button>
                                            <Button
                                                sx={{
                                                    flex:1,
                                                    bgcolor: values.selected_fee !== 'medium'? "#0c1529bf": undefined
                                                }}
                                                onClick={() => setFieldValue("selected_fee", "medium") }
                                            >
                                                Medium
                                            </Button>
                                            <Button
                                                sx={{
                                                    flex:1,
                                                    bgcolor: values.selected_fee !== 'fast'? "#0c1529bf": undefined
                                                }}
                                                onClick={() => setFieldValue("selected_fee", "fast") }
                                            >
                                                Fast
                                            </Button>
                                            <Button
                                                sx={{
                                                    flex:1,
                                                    bgcolor: values.selected_fee !== 'custom'? "#0c1529bf": undefined
                                                }}
                                                onClick={() => setFieldValue("selected_fee", "custom") }
                                            >
                                                Custom
                                            </Button>
                                        </ButtonGroup>
                                        {
                                            values.selected_fee === 'custom'&&(
                                                <InputField 
                                                    sx={{my:'15px'}}
                                                    name='custom_fee'
                                                    value={values.custom_fee}
                                                    onChange={handleChange}
                                                    label='Custom Fee Rate'
                                                    placeholder="e.g 10"
                                                    errorMsg={errors.custom_fee}
                                                />
                                            )
                                        }
                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                    >
                                        
                                        <Button
                                            variant="outlined"
                                            sx={{
                                                mt:"15px",
                                                width:'100%',
                                                color:'whitesmoke',
                                                fontWeight:'bold',
                                                borderWidth:'1.8',
                                                "&:disabled":{
                                                    color:'gray',
                                                    borderColor:'gray'
                                                }
                                            }}
                                            type='submit'
                                            disableElevation
                                            disabled={isSubmitting}
                                            startIcon={
                                                isSubmitting &&  <CircularProgress sx={{color:'gray'}} size={20} />
                                            }
                                        >
                                            MINT
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                            
                        </form>
                    )}
                </Formik>
            </Box>
        </>
    )
}


function EtchForm(props:any){

    const { connectedWallet } = useContext(AppContext);

    const [ error, setError ] = useState('');

    const handleSubmit = async (values:any, actions:any)=>{

        setError("");

        try{

            const reqObj = {
                runeName:values.ticker,
                isMintable:true,
                destinationAddress:connectedWallet.ordinals.address,
                refundAddress:connectedWallet.payment.address,
                feeRate:200,
                //premine:100000,
                network:"Testnet"
            }

            if(values.decimals){
                // @ts-ignore
                reqObj.divisibility = parseInt(values.decimals) 
            }

            if(values.symbol){
                // @ts-ignore
                reqObj.symbol = values.symbol
            }

            if(values.max_supply || values.limit){
                 // @ts-ignore
                reqObj.terms = {
                    amount: parseInt(values.max_supply || 0) ,
                    cap: parseInt(values.limit || 0) 
                }
            }

            console.log({reqObj});


            const response = await Wallet.request('runes_etch', reqObj);
            
            console.log({response});
            if(response.status === 'error'){
                const { message } = JSON.parse(response.error.message);
                setError(message)
                return
            }

            actions.resetForm();
            
            // @ts-ignore
            props.onSuccess(response.result)
            
            
        }catch(err){
            console.log(err)
        }finally{

            actions.setSubmitting(false)
        }

    }

    return(
        <>
            


            <Typography
                variant="h5"
                sx={{
                    color:'whitesmoke'
                }}
            >
                Create your new Rune token
            </Typography>
                {
                    error&&(
                        <Alert
                            severity="error"
                            sx={{
                                my:'15px'
                            }}
                        >
                            {
                                error
                            }
                        </Alert>
                    )
                } 
            <Box
                sx={{
                    //mt:'20px'
                }}
            >
                <Formik
                    initialValues={{
                        ticker:"",
                        decimals:"",
                        symbol:'',
                        max_supply:'',
                        limit:'',
                        custom_fee:"",
                        selected_fee:'slow',
                        
                    }}
                    validationSchema={Yup.object().shape({
                        ticker:Yup.string().required("Please enter ticker name"),
                        decimals:Yup.number().typeError("Enter valid number").optional(),
                        symbol:Yup.string().optional(),
                        custom_fee:Yup.number().typeError("Enter valid number").optional(),
                        max_supply:Yup.number().typeError("Enter valid number").required("Enter max supply"),
                        limit:Yup.number().typeError("Enter valid number").required("Enter max limit")
                    })}
                    onSubmit={handleSubmit}
                >
                    {({values, errors, isSubmitting, handleSubmit, handleChange, setFieldValue})=>(
                        <form onSubmit={handleSubmit}>
                            <Box  
                                component='fieldset' 
                                disabled={isSubmitting}
                                sx={{
                                    px:0,
                                    mx:0,
                                    border:'none'
                                }}
                            >
                                <Grid container spacing={1}>
                                    <Grid
                                        item
                                        xs={12}
                                    >
                                        <InputField 
                                            name='ticker'
                                            value={values.ticker}
                                            label='Rune Ticker*'
                                            placeholder="Ticker"
                                            onChange={handleChange}
                                            errorMsg={errors.ticker}
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                        md={6}
                                    >
                                        <InputField 
                                            name='decimals'
                                            value={values.decimals}
                                            onChange={handleChange}
                                            label='Decimals'
                                            placeholder="From 0 to 38"
                                            errorMsg={errors.decimals}
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                        md={6}
                                    >
                                        <InputField 
                                            name='symbol'
                                            value={values.symbol}
                                            onChange={handleChange}
                                            label='Symbol'
                                            placeholder="One Character"
                                            errorMsg={errors.symbol}
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                    >
                                        <InputField 
                                            name='max_supply'
                                            value={values.max_supply}
                                            onChange={handleChange}
                                            label='Max Supply*'
                                            placeholder="e.g 100000000"
                                            errorMsg={errors.max_supply}
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                    >
                                        <InputField 
                                            name='limit'
                                            value={values.limit}
                                            onChange={handleChange}
                                            label='Limit Per Mint*'
                                            placeholder="e.g 1000"
                                            errorMsg={errors.limit}
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                    >
                                        <Typography
                                            sx={{
                                                color:'rgb(198 191 131)',
                                                fontWeight:"bold"
                                            }}
                                        >
                                            Select Fees  ( { fees[values.selected_fee] } sats/vB)
                                        </Typography>
                                        <ButtonGroup
                                            disabled={isSubmitting}
                                            sx={{
                                                width:"100%"
                                            }}
                                            disableElevation
                                            variant="contained"
                                            aria-label="Disabled button group"
                                        >
                                            <Button
                                                sx={{
                                                    flex:1,
                                                    bgcolor: values.selected_fee !== 'slow'? "#0c1529bf": undefined
                                                }}
                                                onClick={() => setFieldValue("selected_fee", "slow") }
                                            >
                                                Slow
                                            </Button>
                                            <Button
                                                sx={{
                                                    flex:1,
                                                    bgcolor: values.selected_fee !== 'medium'? "#0c1529bf": undefined
                                                }}
                                                onClick={() => setFieldValue("selected_fee", "medium") }
                                            >
                                                Medium
                                            </Button>
                                            <Button
                                                sx={{
                                                    flex:1,
                                                    bgcolor: values.selected_fee !== 'fast'? "#0c1529bf": undefined
                                                }}
                                                onClick={() => setFieldValue("selected_fee", "fast") }
                                            >
                                                Fast
                                            </Button>
                                            <Button
                                                sx={{
                                                    flex:1,
                                                    bgcolor: values.selected_fee !== 'custom'? "#0c1529bf": undefined
                                                }}
                                                onClick={() => setFieldValue("selected_fee", "custom") }
                                            >
                                                Custom
                                            </Button>
                                        </ButtonGroup>
                                        {
                                            values.selected_fee === 'custom'&&(
                                                <InputField 
                                                    sx={{my:'15px'}}
                                                    name='custom_fee'
                                                    value={values.custom_fee}
                                                    onChange={handleChange}
                                                    label='Custom Fee Rate'
                                                    placeholder="e.g 10"
                                                    errorMsg={errors.custom_fee}
                                                />
                                            )
                                        }
                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                    >
                                        
                                        <Button
                                            variant="outlined"
                                            sx={{
                                                mt:'15px',
                                                width:'100%',
                                                color:'whitesmoke',
                                                fontWeight:'bold',
                                                borderWidth:'1.8',
                                                "&:disabled":{
                                                    color:'gray',
                                                    borderColor:'gray'
                                                }
                                            }}
                                            type='submit'
                                            disableElevation
                                            disabled={isSubmitting}
                                            startIcon={
                                                isSubmitting &&  <CircularProgress sx={{color:'gray'}} size={20} />
                                            }
                                        >
                                            SUBMIT ETCH
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                            
                        </form>
                    )}
                </Formik>
            </Box>
        </>
    )
}