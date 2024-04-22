import { Box } from "@mui/material";
import EtchForm from "./components/EtchForm";

export default function Home(){
    return(
        <Box
            sx={{
                display:"grid",
                justifyContent:'center',
                width:'100%'
            }}
        >
             <EtchForm/>
        </Box>
       
    )
}