
import { ReactNode, createContext, useState } from "react";
import { PaperProps } from "@mui/material";

interface ContextType{
    connectedWallet:any
    setConnectedWallet:any,
}

interface AppProps{
    children:ReactNode
}

// @ts-ignore
const AppContext = createContext<ContextType>({})

function AppContextProvider(props:AppProps){

    const  [ connectedWallet, setConnectedWallet ] = useState();
 
    return(
        <AppContext.Provider
            value={{
                connectedWallet, 
                setConnectedWallet
            }}
        >
            {props.children}
        </AppContext.Provider>
    )
}

export {
    AppContextProvider,
    AppContext
};
